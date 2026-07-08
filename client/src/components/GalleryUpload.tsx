import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryUploadProps {
  onUploadSuccess?: () => void;
}

export default function GalleryUpload({ onUploadSuccess }: GalleryUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast.error("يرجى إدخال رابط الصورة");
      return;
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      toast.error("رابط الصورة غير صحيح");
      return;
    }

    setIsLoading(true);
    try {
      // Here you would call an API to save the image
      // For now, we'll just show a success message
      toast.success("تم إرسال الصورة بنجاح! سيتم مراجعتها من قبل المسؤول.");
      setImageUrl("");
      setTitle("");
      setDescription("");
      setPreviewUrl(null);
      setIsOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-background font-semibold shadow-lg shadow-gold/30 transition-all duration-300 transform hover:scale-105 gap-2"
        >
          <Upload className="h-4 w-4" />
          شارك صورة من أعمالك
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-gold/30 bg-background">
        <DialogHeader>
          <DialogTitle className="text-gold">شارك صورة من أعمالك</DialogTitle>
          <DialogDescription className="text-gold/60">
            أضف صورة من مشاريعك الجميلة لمعرضنا
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">رابط الصورة</label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={handleImageUrlChange}
              disabled={isLoading}
              className="border-gold/20 focus:border-gold"
            />
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-gold/20 bg-card">
              <img 
                src={previewUrl} 
                alt="معاينة الصورة" 
                className="w-full h-40 object-cover"
                onError={() => {
                  toast.error("لا يمكن تحميل الصورة من هذا الرابط");
                  setPreviewUrl(null);
                }}
              />
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">عنوان الصورة (اختياري)</label>
            <Input
              type="text"
              placeholder="مثال: غرفة نوم فاخرة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="border-gold/20 focus:border-gold"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">وصف الصورة (اختياري)</label>
            <Input
              type="text"
              placeholder="وصف قصير عن المشروع"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="border-gold/20 focus:border-gold"
            />
          </div>

          {/* Info Alert */}
          <Alert className="border-gold/20 bg-gold/5">
            <AlertDescription className="text-sm text-gold/80">
              سيتم مراجعة صورتك من قبل فريقنا قبل نشرها في المعرض
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || !imageUrl}
            className="w-full bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-background font-semibold shadow-lg shadow-gold/30 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              "إرسال الصورة"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
