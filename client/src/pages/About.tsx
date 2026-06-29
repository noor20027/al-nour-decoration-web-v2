import { Award, Users, Zap, Heart, CheckCircle, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, navigate] = useLocation();
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
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">من نحن</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              مؤسسة النور للديكور متخصصة في تقديم حلول ديكور فاخرة وإضاءة احترافية تعكس الذوق والأناقة
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-gold/40 mx-auto mt-8"></div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">قصتنا</h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                بدأنا رحلتنا بحلم واحد: تحويل المساحات العادية إلى أماكن استثنائية تعكس شخصية أصحابها وتجسد أحلامهم.
              </p>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                مع خبرة تزيد عن 15 سنة في مجال الديكور والإضاءة الاحترافية، اكتسبنا سمعة طيبة في تقديم تصاميم فاخرة وحديثة.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                نؤمن بأن كل مشروع فريد ويستحق اهتماماً خاصاً، لذا نعمل بجد لتحقيق رؤية عملائنا وتجاوز توقعاتهم.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-8 border border-gold/20">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Award className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">خبرة عميقة</h3>
                    <p className="text-gray-600">أكثر من 15 سنة من الخبرة في مجال الديكور والإضاءة</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">فريق محترف</h3>
                    <p className="text-gray-600">فريق متخصص مكرس لتقديم أفضل الخدمات</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">تصاميم حديثة</h3>
                    <p className="text-gray-600">تصاميم مبتكرة تواكب أحدث الاتجاهات العالمية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">قيمنا الأساسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <Heart className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">الشغف</h3>
              <p className="text-gray-600">نحب ما نفعله ونضع قلبنا في كل مشروع نعمل عليه</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">الجودة</h3>
              <p className="text-gray-600">نلتزم بأعلى معايير الجودة في كل جانب من جوانب عملنا</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">العميل أولاً</h3>
              <p className="text-gray-600">رضا العميل هو أولويتنا الأولى وهدفنا الأساسي</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gold mb-2">15+</div>
              <p className="text-gray-600 text-lg">سنة خبرة</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gold mb-2">500+</div>
              <p className="text-gray-600 text-lg">مشروع منجز</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gold mb-2">100%</div>
              <p className="text-gray-600 text-lg">رضا العملاء</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gold mb-2">24/7</div>
              <p className="text-gray-600 text-lg">دعم متواصل</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
