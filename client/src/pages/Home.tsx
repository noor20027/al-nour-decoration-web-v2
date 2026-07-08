
import { useState, useEffect } from "react";
import { Phone, MessageCircle, Facebook, Instagram, Mail, Smartphone, Linkedin, Music, Menu, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Fetch dynamic branding (logo and banner)
  const logoQuery = trpc.branding.getLogo.useQuery();
  const bannerQuery = trpc.branding.getBanner.useQuery();
  
  // Fetch gallery and carousel images
  const galleryQuery = trpc.gallery.getAll.useQuery();
  const carouselQuery = trpc.gallery.getCarousel.useQuery();
  const socialQuery = trpc.social.getAll.useQuery();
  const floatingIconsQuery = trpc.floatingIcons.getAll.useQuery();
  
  // Use dynamic branding or fallback to defaults
  const logoUrl = logoQuery.data?.imageUrl || DEFAULT_LOGO_URL;
  const bannerUrl = bannerQuery.data?.imageUrl || DEFAULT_BANNER_URL;
  
  const galleryImages = galleryQuery.data || [];
  const carouselImages = carouselQuery.data || [];
  const socialLinks = socialQuery.data || [];
  const floatingIcons = floatingIconsQuery.data || [];

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

  // Show admin button on specific key combination (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setIsAdminMode(true);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

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
              className="h-20 md:h-24 w-auto object-contain transition-all duration-300 hover:drop-shadow-lg" 
              style={{imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased'}}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
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

          {/* Admin Login Button - Visible in Header */}
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
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">مؤسسة النور للديكور</h2>
          <p className="text-xl text-center mb-2 text-amber-700 font-semibold">AL NOUR DECORATION EST</p>
          
          {/* 5 Stars */}
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
              {/* Main Carousel */}
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
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      style={{imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased'}}
                    />
                    {/* Overlay with title */}
                    {image.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-8">
                        <h3 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">{image.title}</h3>
                      </div>
                    )}
                  </div>
                ))}

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="الصورة السابقة"
                >
                  <ChevronRight size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="الصورة التالية"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {carouselImages.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === carouselIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      title={`الصورة ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Counter */}
              <div className="text-center mt-6 text-gray-600">
                <p className="text-sm font-medium">
                  {carouselIndex + 1} من {carouselImages.length}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section id="gallery" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-gold bg-clip-text text-transparent">لمحة عن بعض أعمالنا</h2>
            <p className="text-gray-600 text-lg">استمتع بمعرض أعمالنا الفاخرة والمتنوعة</p>
            <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold/40 mx-auto mt-6"></div>
          </div>
          
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((image: any, index: number) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative overflow-hidden bg-gray-300 aspect-square">
                    <img 
                      src={image.imageUrl} 
                      alt={image.title || `صورة ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      loading="lazy"
                      decoding="async"
                      style={{imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased'}}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  {image.title && (
                    <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-center font-bold text-lg drop-shadow-lg">{image.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-xl mb-4">لا توجد صور في المعرض حالياً</p>
              <p className="text-gray-400">سيتم إضافة الصور قريباً</p>
            </div>
          )}
        </div>
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">خدماتنا</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "الديكور الداخلي", description: "تصاميم ديكور حديثة وفاخرة للمنازل والمكاتب" },
              { title: "الإضاءة الاحترافية", description: "حلول إضاءة متقدمة لجميع الأماكن والفضاءات" },
              { title: "التصميم المخصص", description: "تصاميم مخصصة حسب رغبات واحتياجات العملاء" }
            ].map((service, index) => (
              <div 
                key={index}
                className="p-8 bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">مؤسسة النور للديكور</h3>
              <p className="text-gray-400">AL NOUR DECORATION EST</p>
            </div>

            {/* Social Media Icons - Circular Golden Layout */}
            <div className="flex flex-wrap gap-8 justify-center">
              {/* YouTube */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'youtube')?.url || '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="يوتيوب"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'linkedin')?.url || '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="لينكد إن"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'facebook')?.url || 'https://www.facebook.com/share/1EJs49Jwzg/'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="فيس بوك"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'instagram')?.url || 'https://www.instagram.com/noorest2025'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="إنستجرام"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                </svg>
              </a>

              {/* X (Twitter) */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'twitter' || s.platform === 'x')?.url || '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="X"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.432-8.499L1.077 2.25h6.82l4.713 6.231 5.579-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'tiktok')?.url || '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="تيك توك"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.498 3.094c1.356 0 2.463-1.107 2.463-2.463S20.854 0 19.498 0s-2.463 1.107-2.463 2.463 1.107 2.463 2.463 2.463zM15.5 12.502h4.6c.165-4.27-3.902-7.864-8.339-7.864-4.437 0-8.504 3.594-8.339 7.864h4.6c-.165-2.806 2.306-5.034 5.139-5.034s5.304 2.228 5.339 5.034z"/>
                </svg>
              </a>

              {/* Snapchat */}
              <a 
                href={socialLinks.find((s: any) => s.platform === 'snapchat')?.url || '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-20 h-20 rounded-full border-4 border-yellow-500 hover:border-yellow-400 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                title="سناب شات"
              >
                <svg className="w-10 h-10 text-yellow-500 group-hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm5.521 12.5c.165 0 .33.082.33.247 0 .165-.165.33-.33.33-.165 0-.33-.165-.33-.33 0-.165.165-.247.33-.247zm-11.042 0c.165 0 .33.082.33.247 0 .165-.165.33-.33.33-.165 0-.33-.165-.33-.33 0-.165.165-.247.33-.247zm5.521 6.6c-1.65 0-3.135-.66-4.29-1.815-.33-.33-.33-.825 0-1.155.33-.33.825-.33 1.155 0 .825.825 1.98 1.32 3.135 1.32s2.31-.495 3.135-1.32c.33-.33.825-.33 1.155 0 .33.33.33.825 0 1.155-1.155 1.155-2.64 1.815-4.29 1.815z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 مؤسسة النور للديكور. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Floating Contact Buttons */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-3 z-30">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${floatingIcons.find((icon: any) => icon.type === 'whatsapp')?.phoneNumber || '966508297600'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-125 hover:-translate-y-1"
          title="واتساب"
        >
          {/* White outer border */}
          <div className="absolute inset-0 rounded-full bg-white shadow-lg"></div>
          {/* Green inner circle */}
          <div className="absolute inset-1 rounded-full bg-green-500 group-hover:bg-green-600 transition-all duration-300 flex items-center justify-center text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </div>
          {/* Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            واتساب
          </div>
        </a>

        {/* Phone Button */}
        <a
          href={`tel:+${floatingIcons.find((icon: any) => icon.type === 'call')?.phoneNumber || '966508297600'}`}
          className="group relative w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-125 hover:-translate-y-1"
          title="اتصل بنا"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500 group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300 flex items-center justify-center text-white">
            <Phone size={26} />
          </div>
          {/* Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            اتصل بنا
          </div>
        </a>
      </div>

      {/* Smooth scroll animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
