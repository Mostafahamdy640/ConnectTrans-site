import React from 'react';
import { Gift, ArrowLeft } from 'lucide-react';

interface PromoBannerProps {
  onRegisterNow: () => void;
  announcement?: string;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onRegisterNow, announcement }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-8">
      <div className="bg-[#0b1b33] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:px-8 sm:py-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Right Info: Gift & Free Commission (RTL start) */}
        <div className="flex items-center gap-3 order-1 md:order-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <span className="text-sm sm:text-base lg:text-lg font-black text-amber-400 tracking-wide">
            {announcement || 'عمولة مجانية خلال الفترة التجريبية'}
          </span>
        </div>

        {/* Center: Slogan */}
        <div className="text-center order-2 md:order-2">
          <p className="text-white font-bold text-sm sm:text-base lg:text-lg tracking-wide">
            انضم الآن واستفد من مزايا المنصة
          </p>
        </div>

        {/* Left: Action Button */}
        <div className="order-3 md:order-1 w-full md:w-auto">
          <button
            id="promo-register-btn"
            onClick={onRegisterNow}
            className="group w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#e59819] hover:bg-[#d68a12] text-slate-950 font-black text-sm sm:text-base rounded-full transition-all shadow-md hover:shadow-amber-500/20 hover:scale-105 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>سجل الآن</span>
          </button>
        </div>

      </div>
    </div>
  );
};
