import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, LogOut, ArrowRight, Grid3x3, List, Check } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

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

  // Branding state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);

  // Load initial social links from localStorage if available
  const [localSocial, setLocalSocial] = useState(() => {
    const saved = localStorage.getItem('al_nour_social');
    return saved ? JSON.parse(saved) : [
      { platform: 'whatsapp', url: 'https://wa.me/966508297600' },
      { platform: 'instagram', url: 'https://www.instagram.com/noorest2025' },
      { platform: 'facebook', url: 'https://www.facebook.com/share/1EJs49Jwzg/' },
      { platform: 'tiktok', url: '#' },
      { platform: 'snapchat', url: '#' },
      { platform: 'youtube', url: '#' },
      { platform: 'x', url: '#' }
    ];
  });

  // Queries and mutations
  const galleryQuery = trpc.gallery.getAll.useQuery();
  const socialQuery = trpc.social.getAll.useQuery();
  const addImageMutation = trpc.gallery.add.useMutation();
  const deleteImageMutation = trpc.gallery.delete.useMutation();
  const updateSocialMutation = trpc.social.update.useMutation();
  const saveBrandingMutation = trpc.branding.saveBranding.useMutation();
  const getLogoQuery = trpc.branding.getLogo.useQuery();
  const getBannerQuery = trpc.branding.getBanner.useQuery();

  useEffect(() => {
    if (socialQuery.data && socialQuery.data.length > 0) {
      setLocalSocial(socialQuery.data as any);
    }
  }, [socialQuery.data]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار ملف صورة");
        return;
      }
      setSelectedFile(file);
    }
  };

  // الرفع المباشر إلى Vercel Blob باستخدام API الرسمي
  const directBlobUpload = async (file: File, type: 'gallery' | 'logo' | 'banner') => {
    try {
      // توليد اسم فريد للملف
      const uniqueId = uuidv4();
      const ext = file.name.split('.').pop();
      const uniqueFilename = `${type}/${uniqueId}.${ext}`;

      console.log('[Upload] Starting upload for:', uniqueFilename);

      // استخدام FormData لرفع الملف
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', uniqueFilename);

      // الرفع إلى مسار API بسيط في الخادم
      const response = await fetch('/api/upload-blob', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل الرفع');
      }

      const data = await response.json();
      console.log('[Upload] Success:', data);

      return { url: data.url, key: data.key };
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      throw error;
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const uploadResult = await directBlobUpload(selectedFile, 'gallery');

      await addImageMutation.mutateAsync({
        imageUrl: uploadResult.url, 
        imageKey: uploadResult.key,
        title: imageTitle,
        description: imageDescription,
        orientation: imageOrientation,
        isCarousel: isCarouselImage ? "yes" : "no"
      });
      
      setSelectedFile(null); setImageTitle(""); setImageDescription("");
      await galleryQuery.refetch(); 
      toast.success("تم النشر بنجاح");
    } catch (err: any) { 
      console.error(err);
      toast.error(`فشل النشر: ${err.message}`);
    } finally { setIsLoading(false); }
  };

  const handleUpdateSocialLink = async (platform: string, url: string) => {
    const updated = localSocial.map((s: any) => s.platform === platform ? { ...s, url } : s);
    setLocalSocial(updated);
    try { 
      await updateSocialMutation.mutateAsync({ platform, url }); 
      toast.success(`تم تحديث رابط ${platform}`); 
    } catch (err) { 
      console.error(err);
      toast.error(`فشل تحديث رابط ${platform}`); 
    }
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={onLogout} variant="outline" className="border-gold text-gold"><ArrowRight className="ml-2 h-4 w-4" />رجوع للموقع</Button>
            <h1 className="text-3xl font-bold text-gold">لوحة تحكم المسؤول</h1>
          </div>
          <Button onClick={onLogout} variant="outline" className="border-gold text-gold"><LogOut className="mr-2 h-4 w-4" />خروج</Button>
        </div>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-gold/20">
            <TabsTrigger value="gallery">المعرض</TabsTrigger>
            <TabsTrigger value="branding">الهوية</TabsTrigger>
            <TabsTrigger value="social">التواصل</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader><CardTitle className="text-gold">رفع صورة جديدة للمعرض</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddImage} className="space-y-4">
                  <div className="border-2 border-dashed border-gold/30 rounded-lg p-6 text-center cursor-pointer hover:bg-gold/5 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    {selectedFile ? <p className="text-gold font-bold">{selectedFile.name}</p> : <p className="text-gray-500">انقر لاختيار صورة من جهازك</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="عنوان الصورة (اختياري)" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} className="border-gold/20" />
                    <select value={imageOrientation} onChange={(e) => setImageOrientation(e.target.value as any)} className="w-full p-2 border border-gold/20 rounded bg-background">
                      <option value="horizontal">اتجاه أفقي</option><option value="vertical">اتجاه رأسي</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gold/5 rounded border border-gold/10">
                    <input type="checkbox" id="carousel-check" checked={isCarouselImage} onChange={(e) => setIsCarouselImage(e.target.checked)} className="w-4 h-4 accent-gold" />
                    <label htmlFor="carousel-check" className="text-sm font-medium">إضافة هذه الصورة للكاروسيل (الصور المتحركة في الرئيسية)</label>
                  </div>
                  <Button type="submit" disabled={isLoading || !selectedFile} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg shadow-lg transition-all transform hover:scale-[1.01]">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "نشر الصورة الآن"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-gold/20">
              <CardHeader className="flex justify-between flex-row items-center">
                <CardTitle className="text-gold">الصور المنشورة حالياً</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setGalleryLayout("grid")} className={galleryLayout === "grid" ? "bg-gold/20" : ""}><Grid3x3 className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => setGalleryLayout("list")} className={galleryLayout === "list" ? "bg-gold/20" : ""}><List className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={galleryLayout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" : "space-y-2"}>
                  {galleryQuery.data?.map((image: any) => (
                    <div key={image.imageKey} className="border border-gold/20 rounded-lg p-3 bg-card hover:shadow-md transition-shadow">
                      <img src={image.imageUrl} className="w-full h-32 object-cover rounded mb-2 border border-gold/10" />
                      <h3 className="font-semibold text-gold truncate text-sm">{image.title || "بدون عنوان"}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] bg-gold/10 px-2 py-0.5 rounded text-gold">{image.isCarousel === 'yes' ? 'كاروسيل' : 'معرض'}</span>
                        <Button size="sm" variant="ghost" onClick={() => deleteImageMutation.mutateAsync({ imageKey: image.imageKey }).then(() => galleryQuery.refetch())} className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader><CardTitle className="text-gold">تحديث هوية المؤسسة</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="p-4 border border-gold/10 rounded-lg bg-gold/5">
                    <h3 className="font-bold mb-4">شعار المؤسسة (Logo)</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-white rounded border border-gold/20 flex items-center justify-center p-2">
                        {getLogoQuery.data?.imageUrl ? <img src={getLogoQuery.data.imageUrl} className="max-h-full max-w-full object-contain" /> : "لا يوجد"}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input ref={logoFileInputRef} type="file" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                        <Button variant="outline" onClick={() => logoFileInputRef.current?.click()} className="w-full border-gold text-gold">اختيار شعار جديد</Button>
                        {logoFile && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-gold truncate">{logoFile.name}</p>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" onClick={async () => {
                              if (!logoFile) return;
                              setLogoLoading(true);
                              try {
                                const uploadResult = await directBlobUpload(logoFile, 'logo');
                                await saveBrandingMutation.mutateAsync({ type: 'logo', imageUrl: uploadResult.url, imageKey: uploadResult.key });
                                await getLogoQuery.refetch();
                                toast.success('تم نشر الشعار بنجاح');
                                setLogoFile(null);
                              } catch (err: any) { 
                                console.error(err);
                                toast.error('فشل في رفع الشعار');
                              } finally { setLogoLoading(false); }
                            }}>{logoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر الشعار الآن"}</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gold/10 rounded-lg bg-gold/5">
                    <h3 className="font-bold mb-4">بنر الواجهة (Banner)</h3>
                    <div className="space-y-4">
                      <div className="w-full h-32 bg-white rounded border border-gold/20 flex items-center justify-center overflow-hidden">
                        {getBannerQuery.data?.imageUrl ? <img src={getBannerQuery.data.imageUrl} className="w-full h-full object-cover" /> : "لا يوجد"}
                      </div>
                      <input ref={bannerFileInputRef} type="file" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                      <Button variant="outline" onClick={() => bannerFileInputRef.current?.click()} className="w-full border-gold text-gold">اختيار بنر جديد</Button>
                      {bannerFile && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gold truncate">{bannerFile.name}</p>
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" onClick={async () => {
                            if (!bannerFile) return;
                            setBannerLoading(true);
                            try {
                              const uploadResult = await directBlobUpload(bannerFile, 'banner');
                              await saveBrandingMutation.mutateAsync({ type: 'banner', imageUrl: uploadResult.url, imageKey: uploadResult.key });
                              await getBannerQuery.refetch();
                              toast.success('تم نشر البنر بنجاح');
                              setBannerFile(null);
                            } catch (err: any) { 
                              console.error(err);
                              toast.error('فشل في رفع البنر');
                            } finally { setBannerLoading(false); }
                          }}>{bannerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر البنر الآن"}</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader><CardTitle className="text-gold">إدارة روابط التواصل الاجتماعي</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gold/20"><th className="text-right py-4 px-4">المنصة</th><th className="text-right py-4 px-4">الرابط الحالي</th><th className="text-right py-4 px-4">الحالة</th></tr></thead>
                    <tbody>
                      {localSocial.map((social: any) => (
                        <tr key={social.platform} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                          <td className="py-4 px-4 font-bold capitalize">{social.platform}</td>
                          <td className="py-4 px-4"><Input defaultValue={social.url || ""} onBlur={(e) => handleUpdateSocialLink(social.platform, e.currentTarget.value)} className="border-gold/20 h-9 bg-white" placeholder={`أدخل رابط ${social.platform}`} /></td>
                          <td className="py-4 px-4">{social.url && social.url !== '#' ? <Check className="h-5 w-5 text-green-500" /> : <span className="text-red-400">غير محدد</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader><CardTitle className="text-gold">إعدادات الحساب</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm">كلمة السر الحالية</label>
                    <Input type="password" placeholder="********" className="border-gold/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">كلمة السر الجديدة</label>
                    <Input type="password" placeholder="********" className="border-gold/20" />
                  </div>
                  <Button type="button" className="w-full bg-gold text-background font-bold py-5 mt-4">تحديث بيانات الدخول</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
