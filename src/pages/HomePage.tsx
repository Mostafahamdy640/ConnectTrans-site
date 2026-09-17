import React from 'react';
import { Hero } from '../components/Hero';
import { PromoBanner } from '../components/PromoBanner';
import { PageId, UserRole, SitePageContent, UserAccount } from '../types';
import { 
  Building2, 
  Truck, 
  Briefcase, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';
import corpOfficeImg from '../assets/images/corp_office_card_1789141808610.jpg';
import semiTruckImg from '../assets/images/semi_truck_card_1789141825517.jpg';
import agencyOfficeImg from '../assets/images/agency_office_card_1789141842403.jpg';
import { ConnectTransWorkflowManager } from '../components/ConnectTransWorkflowManager';

interface HomePageProps {
  currentUser: UserAccount | null;
  onNavigate: (page: PageId) => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
  onSelectRole: (role: UserRole) => void;
  siteContent?: SitePageContent;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth,
  onSelectRole,
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

      {/* 2. Three Audience Cards - Dedicated Category Portals (الفئات الثلاث) */}
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
            دخول محدد ومصادقة مشددة لكل من الشركات والمصانع، مكاتب النقل، وأصحاب الشاحنات والسيارات.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: الشركات والمصانع */}
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
                <h3 className="text-lg font-black text-slate-900 mb-2">بوابة الشركات والمصانع</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  تسجيل بيانات الشركة وإرسال طلبات التعاون المباشر لـ ConnectTrans، مع متابعة البوالص والرحلات.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectRole('company')}
                  className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>المزايا</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('login', 'company')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    دخول شركة
                  </button>
                  <button
                    onClick={() => onOpenAuth('register', 'company')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    تسجيل جديد
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: مكاتب النقل والوساطة */}
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
                  استعراض طلبات النقل المعتمدة وتقديم عروض الأسعار الرسمية وإدارة أسطول السائقين والقبولات.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectRole('office')}
                  className="text-xs font-bold text-slate-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>المزايا</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('login', 'office')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    دخول مكتب
                  </button>
                  <button
                    onClick={() => onOpenAuth('register', 'office')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    تسجيل جديد
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: أصحاب السيارات والشاحنات */}
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
                  تصفح عروض مكاتب النقل، قبول الشحنات وتحديد الكمية المناسبة، مع حماية سريعة لمستحقات المشوار.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectRole('driver')}
                  className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>المزايا</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('login', 'driver')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    دخول سيارة
                  </button>
                  <button
                    onClick={() => onOpenAuth('register', 'driver')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    تسجيل جديد
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Protected Operational Workflow & Data Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentUser ? (
          /* When logged in: Render interactive workflow tailored to authenticated state */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">منظومة التشغيل والربط الفوري الحية</h3>
                <p className="text-xs text-slate-500">جلسة تشغيلية موثقة وآمنة — التحكمات مفعلة وفق فئة حسابك المعتمدة</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>جلسة موثقة وآمنة</span>
              </span>
            </div>
            <ConnectTransWorkflowManager 
              currentUser={currentUser}
              onRequireAuth={(role) => onOpenAuth('login', role)}
            />
          </div>
        ) : (
          /* When NOT logged in: High-security locked data shield */
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-block mb-2">
                  بيانات تشغيلية مشفرة ومحمية بأعلى معايير الأمان
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  منظومة عروض الأسعار، طلبات الشحن، وإسناد الرحلات
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  حفاظاً على سرية وخصوصية الشركاء، يتم حجب تفاصيل طلبات النقل، عروض الأسعار، وقبولات الحمولات وبيانات الاتصال. تظهر كافة البيانات والتحكمات التشغيلية حصرياً بعد تسجيل الدخول وفق فئة حسابك المعتمدة.
                </p>
              </div>

              {/* 3 Dedicated Category Login CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => onOpenAuth('login', 'company')}
                  className="p-4 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-right transition-all cursor-pointer group"
                >
                  <Building2 className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-black text-white">دخول الشركات والمصانع</span>
                  <span className="block text-[11px] text-emerald-300/80 mt-0.5">متابعة الطلبات والبوالص</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login', 'office')}
                  className="p-4 rounded-2xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-right transition-all cursor-pointer group"
                >
                  <Briefcase className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-black text-white">دخول مكاتب النقل</span>
                  <span className="block text-[11px] text-amber-300/80 mt-0.5">تقديم العروض والأسطول</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login', 'driver')}
                  className="p-4 rounded-2xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/40 text-right transition-all cursor-pointer group"
                >
                  <Truck className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-black text-white">دخول أصحاب السيارات</span>
                  <span className="block text-[11px] text-blue-300/80 mt-0.5">قبول الحمولات والعودة</span>
                </button>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>حسابات موثقة بالسجل التجاري وترخيص النقل البري والرقم القومي</span>
              </div>
            </div>
          </div>
        )}
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
