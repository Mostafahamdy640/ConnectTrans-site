import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  Headphones,
  Building2,
  ExternalLink
} from 'lucide-react';

interface ContactPageProps {
  onNavigateHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('شحن بضائع وتعاقدات');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* 1. Page Header */}
      <PageHeader
        title="تواصل معنا"
        subtitle="فريق خدمة العملاء والدعم الفني اللوجستي جاهز لخدمتكم والإجابة على كافة الاستفسارات على مدار الساعة"
        badge="مركز الاتصال والدعم 24/7"
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Column (Right in RTL) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900">قنوات التواصل المباشرة</h3>
              
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">الرقم الموحد المجاني</span>
                  <a href="tel:8001245566" className="text-base font-black text-slate-900 font-mono hover:text-blue-600">
                    800 124 5566
                  </a>
                  <span className="text-[11px] text-slate-400 block">من 8:00 ص إلى 11:00 م يومياً</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">واتساب العمليات والطوارئ</span>
                  <a 
                    href="https://wa.me/966501234567" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-base font-black text-slate-900 font-mono hover:text-emerald-600 inline-flex items-center gap-1"
                  >
                    <span>+966 50 123 4567</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <span className="text-[11px] text-emerald-600 font-bold block">متاح على مدار 24 ساعة للمسارات</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">البريد الإلكتروني المعتمد</span>
                  <a href="mailto:support@connecttrans.sa" className="text-sm font-bold text-slate-900 font-mono hover:text-amber-600">
                    support@connecttrans.sa
                  </a>
                  <span className="text-[11px] text-slate-400 block">الرد خلال ساعتي عمل كحد أقصى</span>
                </div>
              </div>

              {/* Headquarter Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">المقر الرئيسي</span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    المملكة العربية السعودية، الرياض، مركز الملك عبد الله المالي (KAFD)، برج اللوجستيات، الطابق 14.
                  </p>
                </div>
              </div>

            </div>

            {/* Direct Operations Support CTA Card */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="w-6 h-6 text-amber-400" />
                <h4 className="text-base font-black">مركز العمليات والدعم المباشر</h4>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                هل تحتاج إلى مساعدة تشغيلية فورية أو ترغب في تنسيق أسطول شاحنات كبير؟ مسؤولو الدعم متاحون لمساعدتك الآن.
              </p>
              <a
                href="https://wa.me/966501234567"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>محادثة فورية مع العمليات</span>
              </a>
            </div>

          </div>

          {/* Inquiry Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-2">أرسل لنا رسالة أو استفسار</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                سيتواصل معك أحد مستشارينا اللوجستيين لمساعدتك وتزويدك بأفضل الحلول لأسطولك أو بضائعك.
              </p>

              {sentSuccess ? (
                <div className="py-12 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-black text-emerald-900">تم استلام رسالتك بنجاح!</h4>
                  <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                    شكراً لتواصلك. سيقوم فريق خدمة العملاء بالتواصل معك عبر رقم الجوال المرفق خلال وقت وجيز.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكريم:</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: سلطان الشمري"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال للتواصل:</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الاستفسار:</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      >
                        <option value="شحن بضائع وتعاقدات">شحن بضائع وتعاقدات شركات</option>
                        <option value="تسجيل أسطول شاحنات">تسجيل أسطول شاحنات وسائقين</option>
                        <option value="اعتماد مكتب نقليات">اعتماد وتوثيق مكتب نقليات</option>
                        <option value="استفسار فني أو بوليصة">استفسار فني أو متابعة بوليصة</option>
                        <option value="أخرى">اقتراحات وملاحظات عامة</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الرسالة أو الطلب:</label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اذكر تفاصيل بضاعتك، المسار، أو أي استفسار ترغب في توضيحه..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>إرسال الرسالة الآن</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
