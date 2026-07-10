import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, LogOut, ArrowRight, Grid3x3, List, Upload, Edit2, Check, X, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("gallery");
  const [isLoading, setIsLoading] = useState(false);
  const [galleryLayout, setGalleryLayout] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageOrientation, setImageOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [isCarouselImage, setIsCarouselImage] = useState(false);
  const [editingImageKey, setEditingImageKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOrientation, setEditOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [editIsCarousel, setEditIsCarousel] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Branding state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);

  // Floating Icons state
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState<"yes" | "no">("yes");
  const [callNumber, setCallNumber] = useState("");
  const [callEnabled, setCallEnabled] = useState<"yes" | "no">("yes");

  // Queries and mutations
  const galleryQuery = trpc.gallery.getAll.useQuery();
  const socialQuery = trpc.social.getAll.useQuery();
  const floatingIconsQuery = trpc.floatingIcons.getAll.useQuery();
  const getLogoQuery = trpc.branding.getLogo.useQuery();
  const getBannerQuery = trpc.branding.getBanner.useQuery();

  const uploadImageMutation = trpc.gallery.uploadImage.useMutation();
  const addImageMutation = trpc.gallery.add.useMutation();
  const deleteImageMutation = trpc.gallery.delete.useMutation();
  const updateImageMutation = trpc.gallery.update.useMutation();
  const changePasswordMutation = trpc.admin.changePassword.useMutation();
  const logoutMutation = trpc.admin.logout.useMutation();
  const updateSocialMutation = trpc.social.update.useMutation();
  const initializeSocialMutation = trpc.social.initialize.useMutation();
  const uploadLogoMutation = trpc.branding.uploadLogo.useMutation();
  const uploadBannerMutation = trpc.branding.uploadBanner.useMutation();
  const deleteLogoMutation = trpc.branding.deleteLogo.useMutation();
  const deleteBannerMutation = trpc.branding.deleteBanner.useMutation();
  const upsertFloatingIconMutation = trpc.floatingIcons.upsert.useMutation();

  // Initialize floating icons state when data is loaded
  useEffect(() => {
    if (floatingIconsQuery.data) {
      const whatsapp = floatingIconsQuery.data.find(i => i.type === 'whatsapp');
      const call = floatingIconsQuery.data.find(i => i.type === 'call');
      if (whatsapp) {
        setWhatsappNumber(whatsapp.phoneNumber);
        setWhatsappEnabled(whatsapp.isEnabled);
      }
      if (call) {
        setCallNumber(call.phoneNumber);
        setCallEnabled(call.isEnabled);
      }
    }
  }, [floatingIconsQuery.data]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار ملف صورة");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // Increased to 10MB
        toast.error("حجم الصورة يجب أن يكون أقل من 10 ميجابايت");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("يرجى اختيار صورة");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64.trim());
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const uploadResult = await uploadImageMutation.mutateAsync({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        fileData,
      });

      await addImageMutation.mutateAsync({
        imageUrl: uploadResult.imageUrl,
        imageKey: uploadResult.imageKey,
        title: imageTitle,
        description: imageDescription,
        orientation: imageOrientation,
        isCarousel: isCarouselImage ? "yes" : "no",
      });

      setSelectedFile(null);
      setImageTitle("");
      setImageDescription("");
      setImageOrientation("horizontal");
      setIsCarouselImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      await galleryQuery.refetch();
      toast.success("تمت إضافة الصورة بنجاح");
      
    } catch (err) {
      console.error("[Upload] Error:", err);
      toast.error("فشل إضافة الصورة. تأكد من حجم الملف واتصال الإنترنت.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageKey: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    try {
      await deleteImageMutation.mutateAsync({ imageKey });
      await galleryQuery.refetch();
      toast.success("تم حذف الصورة بنجاح");
    } catch (err) {
      toast.error("فشل حذف الصورة");
    }
  };

  const startEditImage = (image: any) => {
    setEditingImageKey(image.imageKey);
    setEditTitle(image.title || "");
    setEditDescription(image.description || "");
    setEditOrientation(image.orientation || "horizontal");
    setEditIsCarousel(image.isCarousel === "yes");
  };

  const handleSaveEdit = async () => {
    if (!editingImageKey) return;
    try {
      await updateImageMutation.mutateAsync({
        imageKey: editingImageKey,
        title: editTitle,
        description: editDescription,
        orientation: editOrientation,
        isCarousel: editIsCarousel ? "yes" : "no",
      });
      setEditingImageKey(null);
      await galleryQuery.refetch();
      toast.success("تم تحديث الصورة بنجاح");
    } catch (err) {
      toast.error("فشل تحديث الصورة");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("كلمات السر غير متطابقة");
      return;
    }
    setIsLoading(true);
    try {
      await changePasswordMutation.mutateAsync({
        username: localStorage.getItem("admin_username") || "admin",
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("تم تغيير كلمة السر بنجاح");
    } catch (err) {
      toast.error("فشل تغيير كلمة السر. تأكد من كلمة السر الحالية.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSocialLink = async (platform: string, url: string) => {
    try {
      await updateSocialMutation.mutateAsync({ platform, url: url || null });
      toast.success(`تم تحديث رابط ${platform}`);
    } catch (err) {
      toast.error("فشل تحديث الرابط");
    }
  };

  const handleInitializeSocials = async () => {
    try {
      await initializeSocialMutation.mutateAsync();
      await socialQuery.refetch();
      toast.success("تم تهيئة جميع منصات التواصل");
    } catch (err) {
      toast.error("فشل التهيئة");
    }
  };

  const handleUpdateFloatingIcon = async (type: 'whatsapp' | 'call') => {
    const phoneNumber = type === 'whatsapp' ? whatsappNumber : callNumber;
    const isEnabled = type === 'whatsapp' ? whatsappEnabled : callEnabled;
    
    if (!phoneNumber) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    try {
      await upsertFloatingIconMutation.mutateAsync({ type, phoneNumber, isEnabled });
      await floatingIconsQuery.refetch();
      toast.success("تم تحديث الإعدادات بنجاح");
    } catch (err) {
      toast.error("فشل التحديث");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("admin_username");
      onLogout();
    } catch (err) {
      toast.error("فشل تسجيل الخروج");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={onLogout} variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
              <ArrowRight className="ml-2 h-4 w-4" />
              الموقع الرئيسي
            </Button>
            <h1 className="text-3xl font-bold text-amber-800">لوحة التحكم</h1>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-red-600 hover:bg-red-50">
            <LogOut className="ml-2 h-4 w-4" />
            خروج
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-amber-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="gallery" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">المعرض</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">الهوية</TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">التواصل</TabsTrigger>
            <TabsTrigger value="floating" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">الأيقونات</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-6 space-y-6">
            <Card className="border-amber-100 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-800">إضافة صور للأعمال</CardTitle>
                <CardDescription>ارفع صور مشاريعك لتظهر في معرض الصور والكاروسيل</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddImage} className="space-y-4">
                  <div className="border-2 border-dashed border-amber-200 rounded-xl p-8 text-center cursor-pointer hover:bg-amber-50 transition-all"
                    onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <Check className="h-10 w-10 text-green-500 mx-auto" />
                        <p className="font-medium text-amber-900">{selectedFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 text-amber-400 mx-auto" />
                        <p className="font-medium text-gray-600">اضغط هنا لاختيار صورة</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WebP (Max 10MB)</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="عنوان العمل (مثال: ديكور مجلس رجال)" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} className="border-amber-200" />
                    <select value={imageOrientation} onChange={(e) => setImageOrientation(e.target.value as any)} className="w-full px-3 py-2 border border-amber-200 rounded-md bg-white">
                      <option value="horizontal">عرض أفقي (مستحسن)</option>
                      <option value="vertical">عرض رأسي</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-lg">
                    <input type="checkbox" id="carousel-check" checked={isCarouselImage} onChange={(e) => setIsCarouselImage(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                    <label htmlFor="carousel-check" className="text-sm font-medium text-amber-900 cursor-pointer">إظهار في شريط الصور المتحركة (Carousel)</label>
                  </div>

                  <Button type="submit" disabled={isLoading || !selectedFile} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg">
                    {isLoading ? <Loader2 className="animate-spin ml-2" /> : <Upload className="ml-2" />}
                    نشر الصورة الآن
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryQuery.data?.map((img: any) => (
                <Card key={img.imageKey} className="overflow-hidden group border-amber-50">
                  <div className="aspect-square relative">
                    <img src={img.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteImage(img.imageKey)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="p-2 text-center text-xs font-medium truncate">{img.title || "بدون عنوان"}</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Card */}
              <Card className="border-amber-100 shadow-md">
                <CardHeader>
                  <CardTitle>شعار المؤسسة</CardTitle>
                  <CardDescription>يظهر في أعلى الصفحة وفي التذييل</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 overflow-hidden">
                    {getLogoQuery.data?.imageUrl ? (
                      <img src={getLogoQuery.data.imageUrl} className="max-h-full object-contain p-4" />
                    ) : <p className="text-amber-300">لا يوجد شعار حالياً</p>}
                  </div>
                  <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => logoFileInputRef.current?.click()}>
                      {logoFile ? selectedFile?.name : "اختيار شعار جديد"}
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700" disabled={!logoFile || logoLoading} onClick={async () => {
                      setLogoLoading(true);
                      try {
                        const reader = new FileReader();
                        const fileData = await new Promise<string>((resolve) => {
                          reader.onload = () => resolve((reader.result as string).split(',')[1]);
                          reader.readAsDataURL(logoFile!);
                        });
                        await uploadLogoMutation.mutateAsync({ fileName: logoFile!.name, fileSize: logoFile!.size, mimeType: logoFile!.type, fileData });
                        setLogoFile(null);
                        await getLogoQuery.refetch();
                        toast.success("تم تحديث الشعار");
                      } catch (e) { toast.error("فشل التحديث"); }
                      finally { setLogoLoading(false); }
                    }}>
                      {logoLoading ? <Loader2 className="animate-spin" /> : "حفظ"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Banner Card */}
              <Card className="border-amber-100 shadow-md">
                <CardHeader>
                  <CardTitle>بنر الواجهة الرئيسي</CardTitle>
                  <CardDescription>الصورة الكبيرة في أعلى الموقع</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 overflow-hidden">
                    {getBannerQuery.data?.imageUrl ? (
                      <img src={getBannerQuery.data.imageUrl} className="w-full h-full object-cover" />
                    ) : <p className="text-amber-300">لا يوجد بنر حالياً</p>}
                  </div>
                  <input ref={bannerFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => bannerFileInputRef.current?.click()}>
                      {bannerFile ? bannerFile.name : "اختيار بنر جديد"}
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700" disabled={!bannerFile || bannerLoading} onClick={async () => {
                      setBannerLoading(true);
                      try {
                        const reader = new FileReader();
                        const fileData = await new Promise<string>((resolve) => {
                          reader.onload = () => resolve((reader.result as string).split(',')[1]);
                          reader.readAsDataURL(bannerFile!);
                        });
                        await uploadBannerMutation.mutateAsync({ fileName: bannerFile!.name, fileSize: bannerFile!.size, mimeType: bannerFile!.type, fileData });
                        setBannerFile(null);
                        await getBannerQuery.refetch();
                        toast.success("تم تحديث البنر");
                      } catch (e) { toast.error("فشل التحديث"); }
                      finally { setBannerLoading(false); }
                    }}>
                      {bannerLoading ? <Loader2 className="animate-spin" /> : "حفظ"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-6 space-y-6">
            <Card className="border-amber-100 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>روابط التواصل الاجتماعي</CardTitle>
                  <CardDescription>الروابط التي تظهر في أسفل الموقع</CardDescription>
                </div>
                <Button variant="outline" onClick={handleInitializeSocials} size="sm">تهيئة المنصات</Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialQuery.data?.map((s: any) => (
                  <div key={s.platform} className="space-y-1">
                    <label className="text-xs font-bold text-amber-700 capitalize">{s.platform}</label>
                    <Input 
                      defaultValue={s.url || ""} 
                      placeholder={`رابط ${s.platform}...`}
                      onBlur={(e) => handleUpdateSocialLink(s.platform, e.target.value)}
                      className="border-amber-100 focus:border-amber-500"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Floating Icons Tab */}
          <TabsContent value="floating" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp */}
              <Card className="border-green-100 shadow-md">
                <CardHeader className="bg-green-50 rounded-t-xl">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" /> أيقونة الواتساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Input placeholder="رقم الواتساب (مثال: 966508297600)" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                  <select value={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.value as any)} className="w-full px-3 py-2 border rounded-md">
                    <option value="yes">مفعلة</option>
                    <option value="no">معطلة</option>
                  </select>
                  <Button onClick={() => handleUpdateFloatingIcon('whatsapp')} className="w-full bg-green-600 hover:bg-green-700">حفظ الإعدادات</Button>
                </CardContent>
              </Card>

              {/* Call */}
              <Card className="border-blue-100 shadow-md">
                <CardHeader className="bg-blue-50 rounded-t-xl">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Phone className="h-5 w-5" /> أيقونة الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Input placeholder="رقم الاتصال (مثال: 966508297600)" value={callNumber} onChange={(e) => setCallNumber(e.target.value)} />
                  <select value={callEnabled} onChange={(e) => setCallEnabled(e.target.value as any)} className="w-full px-3 py-2 border rounded-md">
                    <option value="yes">مفعلة</option>
                    <option value="no">معطلة</option>
                  </select>
                  <Button onClick={() => handleUpdateFloatingIcon('call')} className="w-full bg-blue-600 hover:bg-blue-700">حفظ الإعدادات</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="border-amber-100 shadow-md max-w-md mx-auto">
              <CardHeader>
                <CardTitle>تغيير كلمة مرور المدير</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input type="password" placeholder="كلمة المرور الحالية" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  <Input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <Input type="password" placeholder="تأكيد كلمة المرور الجديدة" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <Button type="submit" disabled={isLoading} className="w-full bg-amber-800 hover:bg-black">تحديث كلمة المرور</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
