import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Gallery() {
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const galleryQuery = trpc.gallery.getAll.useQuery();
  const galleryImages = galleryQuery.data || [];

  const totalPages = Math.ceil(galleryImages.length / itemsPerPage);
  const paginatedImages = galleryImages.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Back Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          title="رجوع للرئيسية"
        >
          <ArrowRight size={12} />
          رجوع
        </button>
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">أعمالنا</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              استمتع بمعرض أعمالنا الفاخرة والمتنوعة من الديكورات والإضاءات الاحترافية
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-gold/40 mx-auto mt-8"></div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {galleryImages.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedImages.map((image: any, index: number) => (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer"
                    style={{
                      animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="relative overflow-hidden bg-gray-300 h-72">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg transition-all duration-300 font-medium disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                    السابق
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(i);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                          i === currentPage
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg transition-all duration-300 font-medium disabled:cursor-not-allowed"
                  >
                    التالي
                    <ChevronLeft size={20} />
                  </button>
                </div>
              )}

              <div className="text-center mt-8 text-gray-600">
                <p className="text-sm font-medium">
                  الصفحة {currentPage + 1} من {totalPages} ({galleryImages.length} صورة)
                </p>
              </div>
            </>
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 مؤسسة النور للديكور. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
