import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'استفسار عام',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', phone: '', subject: 'استفسار عام', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header with Golden Dividers */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-4 w-full max-w-lg mx-auto">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e59819]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 whitespace-nowrap">
            تواصل معنا
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e59819]" />
        </div>
        <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
          فريق خدمة العملاء والدعم الفني في خدمتكم على مدار الساعة طوال أيام الأسبوع
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">الخط الساخن الموحد</h4>
              <p className="text-xs text-slate-500 mb-1">متاح طوال 24 ساعة لاستقبال البلاغات والاستفسارات</p>
              <a href="tel:920000000" className="text-lg font-black text-blue-600 hover:underline dir-ltr block text-right">
                9200 12 345
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">واتساب الدعم السريع</h4>
              <p className="text-xs text-slate-500 mb-1">محادثة فورية مع مسؤولي العمليات اللوجستية</p>
              <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-600 hover:underline">
                بدء محادثة واتساب الآن ←
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">البريد الإلكتروني</h4>
              <p className="text-xs text-slate-500 mb-1">لطلبات الشراكة والعقود التجارية والشكاوى</p>
              <a href="mailto:support@connecttrans.com" className="text-sm font-bold text-slate-800 hover:underline">
                support@connecttrans.com
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">المقر الرئيسي</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                طريق الملك فهد، حي الملقا، الرياض، المملكة العربية السعودية
              </p>
            </div>
          </div>

        </div>

        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-xl font-black text-slate-900 mb-2">أرسل لنا رسالة مباشرة</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">يسعدنا تلقي استفساركم وسيقوم أحد ممثلينا بالتواصل معكم خلال 15 دقيقة</p>

          {formSubmitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-lg font-black text-emerald-900 mb-1">تم إرسال رسالتك بنجاح!</h4>
              <p className="text-xs sm:text-sm text-emerald-700">شكراً لتواصلك مع ConnectTrans. سيتم الرد عليك في أقرب وقت.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: خالد محمد"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف أو الجوال:</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">موضوع الرسالة:</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="استفسار عام">استفسار عام حول المنصة</option>
                  <option value="تسجيل أسطول شاحنات">تسجيل أسطول شاحنات جديد</option>
                  <option value="شراكات الشركات والمصانع">شراكات للشركات والمصانع</option>
                  <option value="الدعم الفني والعمليات">الدعم الفني وتتبع الرحلات</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تفاصيل الرسالة أو الطلب:</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="اكتب استفسارك بالتفصيل..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة الآن</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </section>
  );
};
