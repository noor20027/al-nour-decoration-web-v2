import { Palette, Lightbulb, Sparkles, Home, Building2, Store, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Services() {
  const [, navigate] = useLocation();
  const services = [
    {
      icon: Palette,
      title: "الديكور الداخلي",
      description: "تصاميم فاخرة وحديثة للمنازل والمكاتب والمحلات تعكس الذوق والأناقة",
      features: ["تصميم مخصص", "مواد عالية الجودة", "تنفيذ احترافي"]
    },
    {
      icon: Lightbulb,
      title: "الإضاءة الاحترافية",
      description: "حلول إضاءة متقدمة تعكس الفخامة والأناقة وتحسن من جمال المساحة",
      features: ["إضاءة ذكية", "تصاميم مبتكرة", "كفاءة طاقية"]
    },
    {
      icon: Sparkles,
      title: "التصاميم الإبداعية",
      description: "تصاميم مبتكرة وفريدة تواكب أحدث الاتجاهات العالمية في الديكور",
      features: ["تصاميم عصرية", "استشارات مجانية", "متابعة دقيقة"]
    },
    {
      icon: Home,
      title: "ديكور المنازل",
      description: "تحويل منزلك إلى واحة فاخرة تعكس شخصيتك وذوقك الرفيع",
      features: ["غرف نوم", "غرف معيشة", "مطابخ حديثة"]
    },
    {
      icon: Building2,
      title: "ديكور المكاتب",
      description: "مساحات عمل احترافية تعزز الإنتاجية وتعكس هوية الشركة",
      features: ["مكاتب تنفيذية", "مساحات استقبال", "قاعات اجتماعات"]
    },
    {
      icon: Store,
      title: "ديكور المحلات",
      description: "تصاميم جذابة تجذب العملاء وتعكس هوية العلامة التجارية",
      features: ["واجهات محلات", "عروض سلع", "ديكور داخلي"]
    }
  ];

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
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">خدماتنا</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              نقدم حلولاً ديكورية شاملة وإضاءة احترافية لجميع أنواع المساحات
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-gold/40 mx-auto mt-8"></div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-gold/30"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="bg-gradient-to-br from-gold/10 to-gold/5 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:from-gold/20 group-hover:to-gold/10 transition-all">
                    <Icon className="w-8 h-8 text-gold" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-gold rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">عملية العمل</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                { step: "1", title: "الاستشارة الأولية", description: "نستمع إلى أحلامك وتصورك للمشروع" },
                { step: "2", title: "التصميم والتخطيط", description: "نقوم بإعداد تصاميم احترافية ومفصلة" },
                { step: "3", title: "الموافقة والتعديل", description: "نناقش التصاميم ونجري التعديلات المطلوبة" },
                { step: "4", title: "التنفيذ", description: "نقوم بتنفيذ المشروع بدقة واحترافية عالية" },
                { step: "5", title: "الفحص النهائي", description: "نتأكد من جودة العمل ورضاك التام" }
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-gold to-gold/80 text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-2xl p-12 text-center border border-gold/20">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">هل أنت مستعد لتحويل مساحتك؟</h2>
            <p className="text-xl text-gray-600 mb-8">تواصل معنا اليوم واحصل على استشارة مجانية</p>
            <button className="bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-background font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              اتصل بنا الآن
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
