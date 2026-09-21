import React from 'react';
import { Smartphone, Download, CheckCircle2, Sparkles, ShieldCheck, Database, ArrowLeft } from 'lucide-react';

interface MobileAppBannerProps {
  onOpenModal: () => void;
}

export const MobileAppBanner: React.FC<MobileAppBannerProps> = ({ onOpenModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden border border-slate-800 shadow-2xl">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Main text column */}
          <div className="lg:col-span-8 space-y-4 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>تطبيق ConnectTrans للهواتف الذكية (أندرويد وآيفون)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              أدر شحناتك وأسطولك من أي مكان، بمزامنة حية ومباشرة من الموقع
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              سواء كنت صاحب شركة تتابع بوالص الشحن، أو مكتب نقل يدير عروض الأسعار، أو سائق شاحنة على الطريق؛ حمّل تطبيق ConnectTrans لتبقى على اتصال دائم مع نفس قاعدة البيانات المركزية بدون أي تأخير.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">داتا مسحوبة من الموقع 100%</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200">
                <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-bold">متاح على Google Play و iOS</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">إشعارات وتتبع لحظي آمن</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenModal}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-amber-400/20"
              >
                <Download className="w-4 h-4" />
                <span>تحميل البرنامج وطريقة التثبيت</span>
                <ArrowLeft className="w-4 h-4 mr-1" />
              </button>

              <button
                onClick={onOpenModal}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>شرح كيفية سحب البيانات من الموقع</span>
              </button>
            </div>
          </div>

          {/* Right column: Phone Mockup Visual */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-64 bg-slate-900 border-4 border-slate-700 rounded-[2.5rem] p-3 shadow-2xl shadow-blue-500/10">
              {/* Phone Speaker & Camera Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

              {/* Screen Mockup */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-right">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">متصل بالسيرفر</span>
                  </div>
                  <span className="text-[10px] font-black text-white">ConnectTrans</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>طلب شحن جديد #882</span>
                    <span className="text-amber-400 font-bold">120 طن</span>
                  </div>
                  <p className="font-bold text-white">العين السخنة ← السادس من أكتوبر</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                    مُحدث لحظياً من الموقع
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>حالة الرحلة الميدانية:</span>
                    <span className="text-emerald-400 font-bold">جاري النقل</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-2/3 rounded-full"></div>
                  </div>
                </div>

                <div className="pt-1">
                  <button 
                    onClick={onOpenModal}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors shadow-sm"
                  >
                    تنزيل التطبيق لجهازك الآن
                  </button>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-3"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
