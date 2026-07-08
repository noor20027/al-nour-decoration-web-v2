import { Phone, Mail, MapPin, Clock, ArrowRight, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Contact() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your server
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
    }, 3000);
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
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">اتصل بنا</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              نحن هنا للإجابة على جميع أسئلتك والاستماع إلى احتياجاتك
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-gold/40 mx-auto mt-8"></div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Phone */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border border-blue-200">
              <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">الهاتف</h3>
              <a href="tel:+966508297600" className="text-blue-600 hover:text-blue-700 font-semibold">
                +966 50 829 7600
              </a>
            </div>

            {/* Email */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center border border-red-200">
              <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">البريد الإلكتروني</h3>
              <a href="mailto:asaabood405@gmail.com" className="text-red-600 hover:text-red-700 font-semibold break-all">
                asaabood405@gmail.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center border border-green-200">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">الموقع</h3>
              <p className="text-green-700 font-semibold">
                الرياض - السعودية
              </p>
            </div>

            {/* Hours */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center border border-purple-200">
              <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">ساعات العمل</h3>
              <p className="text-purple-700 font-semibold text-sm">
                السبت - الخميس<br />
                9:00 ص - 10:00 م
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">أرسل لنا رسالة</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                ✓ شكراً! تم استقبال رسالتك بنجاح. سنتواصل معك قريباً.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    placeholder="بريدك الإلكتروني"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    placeholder="رقم هاتفك"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">الرسالة</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none"
                  placeholder="أخبرنا عن احتياجاتك..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Send size={20} />
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">موقعنا</h2>
          <div className="rounded-2xl overflow-hidden shadow-lg h-96 bg-gray-300">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              title="موقع مؤسسة النور للديكور"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3623.9999999999995!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f1234567890ab%3A0x1234567890abcdef!2sAl%20Riyadh%2C%20Saudi%20Arabia!5e0!3m2!1sar!2ssa!4v1234567890"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
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
