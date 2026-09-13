import React from 'react';
import { Hero } from '../components/Hero';
import { PromoBanner } from '../components/PromoBanner';
import { PageId, UserRole, SitePageContent } from '../types';
import { 
  Building2, 
  Truck, 
  Briefcase, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import corpOfficeImg from '../assets/images/corp_office_card_1789141808610.jpg';
import semiTruckImg from '../assets/images/semi_truck_card_1789141825517.jpg';
import agencyOfficeImg from '../assets/images/agency_office_card_1789141842403.jpg';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
  onSelectRole: (role: UserRole) => void;
  onOpenAdmin?: () => void;
  siteContent?: SitePageContent;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAuth,
  onSelectRole,
  onOpenAdmin,
  siteContent,
}) => {
  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. The Core Hero Banner */}
      <Hero
        onStartNow={() => onOpenAuth('register')}
        onExploreMore={() => onNavigate('business')}
        headline={siteContent?.heroHeadline}
        subheadline={siteContent?.heroSubheadline}
      />

      {/* 2. Three Audience Cards - Quick Portals (الفئات الرئيسية) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوابات الدخول المخصصة لشركاء النقل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            منظومة مخصصة لكل شريك في قطاع النقل المصري
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            صلاحيات ومزايا مخصصة لكل من الشركات والمصانع، مكاتب النقل، وأصحاب الشاحنات والسيارات.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: الشركات */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src={corpOfficeImg}
                alt="الشركات"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 right-4 px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-lg">
                حلول الشركات والمصانع
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2">بوابة الشركات</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  طلب شاحنات فورية ومجدولة، بوالص شحن رقمية معتمدة، وإدارة شاملة لجميع شحنات البضائع حتى وصولها.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectRole('company')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>تفاصيل المزايا</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenAuth('register', 'company')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  تسجيل شركة
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: أصحاب السيارات */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src={semiTruckImg}
                alt="أصحاب الشاحنات"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg">
                أصحاب الشاحنات والسيارات
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2">بوابة أصحاب السيارات</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  تصفح مئات الحمولات اليومية المتجددة، وتجنب العودة فارغاً، مع تحويل مالي فوري للمستحقات.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectRole('driver')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>تفاصيل المزايا</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenAuth('register', 'driver')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  تسجيل سيارة
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: مكاتب النقل */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src={agencyOfficeImg}
                alt="مكاتب النقل"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 right-4 px-3 py-1 bg-amber-600 text-white text-xs font-black rounded-lg">
                مكاتب النقل والوساطة
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2">بوابة مكاتب النقل</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  إدارة شاملة لأسطول السائقين والعمليات، وإصدار البوالص المعتمدة، وتوسيع قاعدة العملاء التجاريين.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectRole('office')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>تفاصيل المزايا</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenAuth('register', 'office')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  تسجيل مكتب
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('business')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <span>استعراض صفحة ربط الأعمال الكاملة والفرص المتاحة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Promotional Banner */}
      <PromoBanner
        onRegisterNow={() => onOpenAuth('register')}
        announcement={siteContent?.announcement}
      />

      {/* 5. Quick Numbers & Trust Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-amber-400 font-mono mb-1">
                +45,000
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                رحلة نقل مكتملة
              </span>
            </div>
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-blue-400 font-mono mb-1">
                +12,800
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                شاحنة مسجلة ومعتمدة
              </span>
            </div>
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-emerald-400 font-mono mb-1">
                +3,200
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                شركة ومصنع شريك
              </span>
            </div>
            <div>
              <span className="block text-3xl sm:text-4xl font-black text-amber-300 font-mono mb-1">
                99.4%
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                نسبة الالتزام بالمواعيد
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
