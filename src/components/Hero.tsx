import React from 'react';
import { ArrowLeft, Info, ShieldCheck, Clock, TrendingUp, Users, LogIn } from 'lucide-react';
import heroTruckImg from '../assets/images/hero_logistics_truck_1789141790632.jpg';
import { ctStorage } from '../data/connectTransStorage';

interface HeroProps {
  onStartNow: () => void;
  onExploreMore: () => void;
  onTrackTrips?: () => void;
  onLogin?: () => void;
  currentUser?: any;
  headline?: string;
  secondHeadline?: string;
  badgeText?: string;
  subheadline?: string;
  activeRoadTrucksText?: string;
}

export const Hero: React.FC<HeroProps> = ({ 
  onStartNow, 
  onExploreMore,
  onTrackTrips,
  onLogin,
  currentUser,
  headline,
  secondHeadline,
  badgeText,
  subheadline,
  activeRoadTrucksText,
}) => {
  // Real dynamic active trucks count from storage
  const siteContent = ctStorage.getSiteContent();
  const realMetrics = ctStorage.getRealMetrics();
  const liveStats = ctStorage.getLiveStats();
  const isPure = siteContent.pureDatabaseCountOnly === true || siteContent.activeRoadTrucksBaseline === 0;
  const trucksCount = liveStats.activeRoadTrucksCount ?? realMetrics.activeRoadTrucks ?? (isPure ? 1 : 1455);
  
  const displayActiveTrucks = activeRoadTrucksText 
    ? activeRoadTrucksText 
    : (isPure ? trucksCount.toLocaleString() : `+${trucksCount.toLocaleString()}`);
  return (
    <section id="hero" className="relative pt-4 pb-4 lg:pt-6 lg:pb-6 overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Hero Grid with tight, balanced gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          
          {/* Text Content Column (In Arabic: Right side in RTL, left side in LTR) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-right z-10">
            
            {/* Main Headline */}
            <div className="space-y-0.5 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-black tracking-tight text-slate-900 leading-[1.2]">
                {headline || 'منصة واحدة لإدارة متكاملة'}
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-black tracking-tight text-[#e59819] leading-[1.2]">
                {secondHeadline || 'لكافة محافظات وقرى مصر'}
              </h2>
            </div>

            {/* Sub-headline */}
            <div className="space-y-0.5 mb-3.5">
              <p className="text-base sm:text-lg font-bold text-slate-800">
                {badgeText || 'لإدارة النقل والخدمات اللوجستية والشاحنات'}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {subheadline || 'كل رحلاتك .. كل شحناتك .. وعمولة مجانية بالكامل خلال الفترة التجريبية في مكان واحد'}
              </p>
            </div>

            {/* CTA Buttons - Compact spacing */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3.5">
              {/* Primary Blue Button */}
              <button
                id="hero-start-now-btn"
                onClick={onStartNow}
                className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{siteContent?.heroStartBtnText || 'إبدأ الآن'}</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
              </button>

              {/* Homepage Direct Login Button */}
              {onLogin && !currentUser && (
                <button
                  id="hero-login-btn"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <span>تسجيل الدخول</span>
                </button>
              )}

              {/* Secondary White Outlined Button */}
              <button
                id="hero-explore-btn"
                onClick={onExploreMore}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <span>{siteContent?.heroExploreBtnText || 'اكتشف المزيد'}</span>
                <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                  i
                </div>
              </button>

              {/* Live Tracking GPS Button */}
              {onTrackTrips && (
                <button
                  id="hero-track-trips-btn"
                  onClick={onTrackTrips}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm sm:text-base border border-emerald-300 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{siteContent?.heroTrackBtnText || 'تتبع الشحنات المباشر (خرائط Google)'}</span>
                </button>
              )}
            </div>

            {/* 4 Feature Badges Row (Tightly brought closer to buttons above) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2.5 border-t border-slate-200/80">
              
              {/* Feature 1: يدعم جميع الأطراف */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 sm:bg-transparent text-slate-700">
                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  يدعم جميع الأطراف
                </span>
              </div>

              {/* Feature 2: يساعد في نمو أعمالك */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 sm:bg-transparent text-slate-700">
                <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  يساعد في نمو أعمالك
                </span>
              </div>

              {/* Feature 3: يوفر الوقت */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 sm:bg-transparent text-slate-700">
                <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  يوفر الوقت
                </span>
              </div>

              {/* Feature 4: أمان وموثوقية */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 sm:bg-transparent text-slate-700">
                <div className="w-7 h-7 rounded-md bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  أمان وموثوقية
                </span>
              </div>

            </div>

          </div>

          {/* Truck Image & Visual Badge Column */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            
            {/* Top Bar: Slogan & Vehicle Owner Delivery & Payout Assurance Banner */}
            <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-2.5">
              
              {/* Eye-Catching Driver & Vehicle Owner Payout Guarantee Rectangle (Top & Bottom steps preserved, middle text omitted) */}
              <div className="flex-1 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-2.5 sm:p-3 border-2 border-amber-400 shadow-xl relative overflow-hidden group">
                {/* Background decorative glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10">
                  {/* Header Badge - الجزء العلوي */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-[13px] font-black text-amber-300">
                        توجيه وضمان مالي لصاحب السيارة والسائق
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      تحصيل وصرف فوري مضمون
                    </span>
                  </div>

                  {/* 3 Step Visual Sequence - الجزء السفلي */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:text-xs font-black text-center">
                    <div className="bg-slate-800/80 border border-slate-700/70 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1 text-amber-300">
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">1</span>
                      <span className="truncate">تأكيد التوصيل</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/70 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1 text-sky-300">
                      <span className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">2</span>
                      <span className="truncate">اعتماد أوراق المكتب</span>
                    </div>
                    <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1 text-emerald-300">
                      <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">3</span>
                      <span className="truncate">تصريح الصرف والتحصيل</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slogan on the side */}
              <div className="shrink-0 text-right pr-2 pl-2 self-center">
                <span className="block text-base sm:text-lg lg:text-xl font-black text-slate-800 leading-tight">
                  نحو مستقبل
                </span>
                <span className="block text-base sm:text-lg lg:text-xl font-black text-[#e59819] leading-tight">
                  أفضل للنقل
                </span>
                <span className="block text-xs sm:text-sm font-bold text-slate-500 leading-tight">
                  في كل المدن
                </span>
                <div className="h-1 w-20 bg-gradient-to-l from-[#e59819] to-amber-300 rounded-full mt-0.5 mr-auto"></div>
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
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span className="font-mono text-emerald-700 font-black">{displayActiveTrucks}</span>
                  <span>شاحنة نشطة الآن على الطرق</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
