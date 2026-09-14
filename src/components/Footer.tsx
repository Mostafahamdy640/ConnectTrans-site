import React from 'react';
import { Truck, ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate?: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ConnectTrans. جميع الحقوق محفوظة لخدمات النقل واللوجستيات.</p>
          <div className="flex items-center gap-4">
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
          </div>
        </div>

      </div>
    </footer>
  );
};
