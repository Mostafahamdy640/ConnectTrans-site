import React from 'react';
import { Truck, ShieldCheck, Heart, MapPin, Phone, Mail, Lock, Smartphone, Download } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate?: (page: PageId) => void;
  onOpenAdminLogin?: () => void;
  onOpenMobileApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdminLogin, onOpenMobileApp }) => {
  const handleLink = (page: PageId) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleLink('home')} 
                className="flex items-center gap-3 cursor-pointer text-right"
              >
                <div className="w-10 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <Truck className="w-5 h-5 transform -scale-x-100" />
                </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-black tracking-tight text-white">Connect</span>
                    <span className="text-2xl font-black tracking-tight text-blue-400">Trans</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">منصة لإدارة النقل والخدمات اللوجستية</span>
                </div>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              المنصة الرائدة في الشرق الأوسط للربط الرقمي الفوري بين مكاتب النقل، أصحاب الشاحنات والسيارات، والشركات التجارية والصناعية لتوفير تجربة نقل موثوقة وسريعة بأعلى معايير الأمان والشفافية.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-amber-400 text-xs font-bold rounded-lg border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                مرخصة وموثقة رسمياً
              </span>
            </div>
          </div>

          {/* Col 3: Pages Links */}
          <div>
            <h4 className="text-sm font-black text-white mb-4">صفحات المنصة</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => handleLink('home')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('services')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  خدمات ConnectTrans
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('how-it-works')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  كيف تعمل المنصة
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('business')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  ربط الأعمال
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('reviews')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  تقييمات العملاء
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('contact')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  تواصل معنا
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('faq')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  الأسئلة الشائعة
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="text-sm font-black text-white mb-4">خدمات النقل</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>شحن البضائع الجافة والمعدات</li>
              <li>النقل المبرد والمجمد للمنتجات</li>
              <li>إدارة وتوزيع أساطيل النقل</li>
              <li>إدارة وتوثيق العقود اللوجستية</li>
              <li>إصدار بوالص الشحن الإلكترونية</li>
              <li>التأمين الشامل على الحمولات</li>
            </ul>
          </div>

        </div>

        {/* Mobile App Download Promo Strip */}
        {onOpenMobileApp && (
          <div className="my-8 p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3 text-right">
              <div className="w-11 h-11 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-black text-white">حمّل تطبيق ConnectTrans لهاتفك</h5>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    مزامنة حية لحظياً
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  تطبيق متكامل لأجهزة أندرويد وآيفون يعمل بنفس بيانات الموقع بدون أي تعارض أو تأخير
                </p>
              </div>
            </div>

            <button
              onClick={onOpenMobileApp}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل التطبيق (Google Play & App Store)</span>
            </button>
          </div>
        )}

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ConnectTrans. جميع الحقوق محفوظة لخدمات النقل واللوجستيات.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            <button onClick={() => handleLink('faq')} className="hover:text-slate-300 cursor-pointer">
              الشروط والأحكام
            </button>
            <span>•</span>
            <button onClick={() => handleLink('faq')} className="hover:text-slate-300 cursor-pointer">
              سياسة الخصوصية
            </button>
            <span>•</span>
            <button onClick={() => handleLink('contact')} className="hover:text-slate-300 cursor-pointer">
              مركز المساعدة
            </button>
            {onOpenAdminLogin && (
              <>
                <span>•</span>
                <button 
                  onClick={onOpenAdminLogin} 
                  title="دخول المشرفين المصرح لهم"
                  className="hover:text-amber-400 text-slate-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-amber-500/70" />
                  <span>بوابة الإدارة المركزية (دخول آمن)</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
