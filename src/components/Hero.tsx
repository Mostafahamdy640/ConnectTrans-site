import React from 'react';
import { ArrowLeft, Info, ShieldCheck, Clock, TrendingUp, Users } from 'lucide-react';
import heroTruckImg from '../assets/images/hero_logistics_truck_1789141790632.jpg';

interface HeroProps {
  onStartNow: () => void;
  onExploreMore: () => void;
  headline?: string;
  subheadline?: string;
}

export const Hero: React.FC<HeroProps> = ({ 
  onStartNow, 
  onExploreMore,
  headline,
  subheadline,
}) => {
  return (
    <section id="hero" className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Text Content Column (In Arabic: Right side in RTL, left side in LTR) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-right z-10">
            
            {/* Main Headline */}
            <div className="space-y-1 mb-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-slate-900 leading-[1.2]">
                {headline || 'منصة واحدة لإدارة متكاملة'}
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#e59819] leading-[1.2]">
                لكافة محافظات وقرى مصر
              </h2>
            </div>

            {/* Sub-headline */}
            <div className="space-y-1 mb-8">
              <p className="text-lg sm:text-xl font-bold text-slate-800">
                لإدارة النقل والخدمات اللوجستية والشاحنات
              </p>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {subheadline || 'كل رحلاتك .. كل شحناتك .. وعمولة مجانية بالكامل خلال الفترة التجريبية في مكان واحد'}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
              {/* Primary Blue Button */}
              <button
                id="hero-start-now-btn"
                onClick={onStartNow}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <span>إبدأ الآن</span>
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </button>

              {/* Secondary White Outlined Button */}
              <button
                id="hero-explore-btn"
                onClick={onExploreMore}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <span>اكتشف المزيد</span>
                <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-bold">
                  i
                </div>
              </button>
            </div>

            {/* 4 Feature Badges Row (as shown in screenshot) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              
              {/* Feature 1: يدعم جميع الأطراف */}
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  يدعم جميع الأطراف
                </span>
              </div>

              {/* Feature 2: يساعد في نمو أعمالك */}
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  يساعد في نمو أعمالك
                </span>
              </div>

              {/* Feature 3: يوفر الوقت */}
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  يوفر الوقت
                </span>
              </div>

              {/* Feature 4: أمان وموثوقية */}
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  أمان وموثوقية
                </span>
              </div>

            </div>

          </div>

          {/* Truck Image & Visual Badge Column */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            
            {/* Top Curved Slogan Callout (as in the screenshot: نحو مستقبل أفضل للنقل في كل المدن) */}
            <div className="w-full flex justify-end lg:justify-end mb-2 pr-4 sm:pr-8">
              <div className="text-right">
                <span className="block text-lg sm:text-xl lg:text-2xl font-black text-slate-800 leading-snug">
                  نحو مستقبل
                </span>
                <span className="block text-lg sm:text-xl lg:text-2xl font-black text-slate-800 leading-snug">
                  أفضل للنقل
                </span>
                <span className="block text-lg sm:text-xl lg:text-2xl font-black text-slate-800 leading-snug">
                  في كل المدن
                </span>
                {/* Curved Golden Line Accent */}
                <div className="h-1.5 w-24 bg-gradient-to-l from-[#e59819] to-amber-300 rounded-full mt-1 mr-auto"></div>
              </div>
            </div>

            {/* Truck Visual Container */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 group">
              <img
                src={heroTruckImg}
                alt="شاحنة نقل حديثة على الطريق السريع - ConnectTrans"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover object-center transform transition-transform duration-700 group-hover:scale-102"
              />
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Live Status Overlay Chip */}
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-md flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">
                  +1,450 شاحنة نشطة الآن على الطرق
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
