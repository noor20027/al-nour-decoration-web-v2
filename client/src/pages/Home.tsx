import { useState, useEffect } from "react";
import { Phone, MessageCircle, Facebook, Instagram, Mail, Smartphone, Linkedin, Music, Menu, X, LogOut, ChevronLeft, ChevronRight, MapPin, Youtube, Twitter } from "lucide-react";
import { SiTiktok, SiSnapchat } from "react-icons/si";
import { Button } from "@/components/ui/button";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import { trpc } from "@/lib/trpc";

// Default fallback URLs (used if no branding is set in the database)
const DEFAULT_LOGO_URL = "/manus-storage/PaQSzhpBRR8XnSvXpgm6lx_1779503904693_na1fn_L2hvbWUvdWJ1bnR1L2FsX25vdXJfbmV3X2JhY2tncm91bmQ_625bc8e1.webp";
const DEFAULT_BANNER_URL = "/manus-storage/al_nour_luxury_banner_718dadb8.png";

export default function Home() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Fetch dynamic branding (logo and banner)
  const logoQuery = trpc.branding.getLogo.useQuery();
  const bannerQuery = trpc.branding.getBanner.useQuery();
  
  // Fetch gallery and carousel images
  const galleryQuery = trpc.gallery.getAll.useQuery();
  const carouselQuery = trpc.gallery.getCarousel.useQuery();
  const socialQuery = trpc.social.getAll.useQuery();
  
  // Use server data exclusively
  const galleryImages = galleryQuery.data || [];
  const carouselImages = carouselQuery.data || [];
  const socialLinks = socialQuery.data || [];
  
  // Use dynamic branding or fallback to defaults
  const logoUrl = logoQuery.data?.imageUrl || DEFAULT_LOGO_URL;
  const bannerUrl = bannerQuery.data?.imageUrl || DEFAULT_BANNER_URL;

  // Auto-rotate carousel
  useEffect(() => {
    if (carouselImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminMode(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  if (isAdminMode && isAdminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  if (isAdminMode && !isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onCancel={() => setIsAdminMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-white via-white to-amber-50 border-b border-amber-100 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img 
              src={logoUrl} 
              alt="مؤسسة النور للديكور" 
              className="h-20 md:h-24 w-auto object-contain transition-all duration-300 hover:drop-shadow-lg cursor-pointer" 
              style={{imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased'}}
            />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <a href="/" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition-colors">الرئيسية</a>
            <a href="/about" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition-colors">من نحن</a>
            <a href="/gallery" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition-colors">أعمالنا</a>
            <a href="/services" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition-colors">الخدمات</a>
            <a href="/contact" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition-colors">اتصل بنا</a>
          </nav>

          {/* Admin Login Button */}
          <button
            onClick={() => setIsAdminMode(true)}
            className="ml-4 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors font-medium"
            title="تسجيل دخول المسؤول"
          >
            دخول
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="flex flex-col gap-4 p-4">
              <a href="/" className="text-gray-700 hover:text-amber-700 font-medium transition-colors">الرئيسية</a>
              <a href="/about" className="text-gray-700 hover:text-amber-700 font-medium transition-colors">من نحن</a>
              <a href="/gallery" className="text-gray-700 hover:text-amber-700 font-medium transition-colors">أعمالنا</a>
              <a href="/services" className="text-gray-700 hover:text-amber-700 font-medium transition-colors">الخدمات</a>
              <a href="/contact" className="text-gray-700 hover:text-amber-700 font-medium transition-colors">اتصل بنا</a>
            </nav>
          </div>
        )}
      </header>

      {/* Banner Section */}
      <section id="home" className="relative w-screen -ml-[calc((100vw-100%)/2)] bg-white flex items-center justify-center">
        <img 
          src={bannerUrl} 
          alt="بنر مؤسسة النور للديكور" 
          className="w-screen h-auto object-cover" 
          style={{imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased'}}
        />
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">مؤسسة النور للديكور</h2>
          <p className="text-xl text-center mb-2 text-amber-700 font-semibold">AL NOUR DECORATION EST</p>
          
          <div className="flex justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-3xl text-amber-500">★</span>
            ))}
          </div>

          <p className="text-center text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            خبرة تزيد عن 15 سنة في مجال الديكور والإضاءة الاحترافية، ومواكبة أحدث التصاميم الإبداعية الحديثة وتنفيذ جميع أنواع الديكورات الداخلية والإضاءات المختلفة. الصور التي في الصفحة هي جزء يسير من الأعمال التي تم تنفيذها.
          </p>
        </div>
      </section>

      {/* Carousel Section */}
      {carouselImages.length > 0 && (
        <section id="carousel" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">صور مختارة</h2>
            <div className="relative max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gray-200 aspect-video md:aspect-[16/9]">
                {carouselImages.map((image: any, index: number) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === carouselIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title || `صورة ${index + 1}`}
                      className="w-full h-full object-cover md:object-contain"
                      style={{imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased'}}
                    />
                    {image.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-8">
                        <h3 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">{image.title}</h3>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg"><ChevronRight size={24} /></button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg"><ChevronLeft size={24} /></button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section id="gallery" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">لمحة عن بعض أعمالنا</h2>
            <p className="text-gray-600 text-lg">استمتع بمعرض أعمالنا الفاخرة والمتنوعة</p>
          </div>
          
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((image: any, index: number) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer">
                  <div className="relative overflow-hidden bg-gray-300 aspect-square sm:aspect-video md:aspect-square">
                    <img 
                      src={image.imageUrl} 
                      alt={image.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16"><p className="text-gray-500 text-xl mb-4">لا توجد صور في المعرض حالياً</p></div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">خدماتنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center hover:bg-amber-50 transition-colors">
              <h3 className="text-2xl font-bold mb-4">الديكور الداخلي</h3>
              <p className="text-gray-600">تصاميم فاخرة وحديثة للمنازل والمكاتب والمحلات</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center hover:bg-amber-50 transition-colors">
              <h3 className="text-2xl font-bold mb-4">الإضاءة الاحترافية</h3>
              <p className="text-gray-600">حلول إضاءة متقدمة تعكس الفخامة والأناقة</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center hover:bg-amber-50 transition-colors">
              <h3 className="text-2xl font-bold mb-4">التصاميم الإبداعية</h3>
              <p className="text-gray-600">تصاميم مبتكرة تواكب أحدث الاتجاهات العالمية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">معلومات التواصل</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <Phone className="mx-auto mb-4 text-amber-600" size={32} />
              <h3 className="font-bold mb-2">الهاتف</h3>
              <p className="text-gray-600">+966508297600</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <Mail className="mx-auto mb-4 text-amber-600" size={32} />
              <h3 className="font-bold mb-2">البريد الإلكتروني</h3>
              <p className="text-gray-600">asaabood405@gmail.com</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="mx-auto mb-4 text-amber-600 flex justify-center"><MapPin size={32} /></div>
              <h3 className="font-bold mb-2">الموقع</h3>
              <p className="text-gray-600">الرياض - السعودية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              <h3 className="text-2xl font-bold mb-2">مؤسسة النور للديكور</h3>
              <p className="text-gray-400">AL NOUR DECORATION EST</p>
            </div>
            <div className="flex gap-6">
              {socialLinks.length > 0 ? socialLinks.map((social: any) => {
                const getIcon = (platform: string) => {
                  switch (platform.toLowerCase()) {
                    case 'facebook': return <Facebook size={24} />;
                    case 'instagram': return <Instagram size={24} />;
                    case 'whatsapp': return <MessageCircle size={24} />;
                    case 'x': return <Twitter size={24} />;
                    case 'tiktok': return <SiTiktok size={24} />;
                    case 'snapchat': return <SiSnapchat size={24} />;
                    case 'youtube': return <Youtube size={24} />;
                    default: return <span className="capitalize">{platform}</span>;
                  }
                };
                return (
                  <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-all hover:scale-110" title={social.platform}>
                    {getIcon(social.platform)}
                  </a>
                );
              }) : (
                <>
                  <a href="#" className="text-amber-500 hover:text-amber-400 transition-all hover:scale-110"><Instagram size={24} /></a>
                  <a href="#" className="text-amber-500 hover:text-amber-400 transition-all hover:scale-110"><Facebook size={24} /></a>
                  <a href="https://wa.me/966508297600" className="text-amber-500 hover:text-amber-400 transition-all hover:scale-110"><MessageCircle size={24} /></a>
                </>
              )}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} مؤسسة النور للديكور. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        {/* Phone Floating Button */}
        <a 
          href="tel:+966508297600" 
          className="bg-amber-600 text-white p-4 rounded-full shadow-2xl hover:bg-amber-700 transition-all hover:scale-110 animate-pulse flex items-center justify-center"
          title="اتصل بنا"
        >
          <Phone size={32} />
        </a>
        
        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/966508297600" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center justify-center"
          title="تواصل عبر واتساب"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="32" 
            height="32" 
            stroke="currentColor" 
            strokeWidth="0" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
