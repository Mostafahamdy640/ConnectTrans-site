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
import { TransportRequestsList } from '../components/TransportRequestsList';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { ctStorage } from '../data/connectTransStorage';

interface HomePageProps {
  currentUser: UserAccount | null;
  onNavigate: (page: PageId) => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
  onSelectRole: (role: UserRole) => void;
  siteContent?: SitePageContent;
  onOpenMobileApp?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth,
  onSelectRole,
  siteContent,
  onOpenMobileApp,
}) => {
  // If the user is logged in:
  // Show a simple, dedicated operational hub restricted to requests of all kinds & the archive!
  // No marketing heroes, no promotional cards, no external pages.
  if (currentUser) {
    const roleLabel = 
      currentUser.role === 'company' ? 'شركة ومصنع' :
      currentUser.role === 'office' ? 'مكتب نقل معتمد' :
      currentUser.role === 'driver' ? 'صاحب شاحنة وسائق' : 'المدير العام';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Simple & Focused Operational Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  لوحة متابعة وإدارة الطلبات
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                مرحباً بك، <strong className="text-slate-800 font-bold">{currentUser.name}</strong> — يتم استعراض كافة الطلبات النشطة، الحصص المتاحة، وسجل الأرشيف التشغيلي.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>جلسة تشغيلية مباشرة ومحمية</span>
            </div>
          </div>
        </div>

        {/* The Core Transport Requests & Archive Component */}
        <TransportRequestsList
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onNavigateToOrders={() => onNavigate('orders')}
        />
      </div>
    );
  }

  // If the user is logged out (Guest/Public):
  // Full showcase of ConnectTrans mechanism, hero banner, category portals, and features.
  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* 1. The Core Hero Banner */}
      <Hero
        onStartNow={() => onOpenAuth('register')}
        onExploreMore={() => onNavigate('business')}
        onTrackTrips={() => onNavigate('orders')}
        onLogin={() => onOpenAuth('login')}
        currentUser={currentUser}
        headline={siteContent?.heroHeadline}
        secondHeadline={siteContent?.heroSecondLine}
        badgeText={siteContent?.heroBadgeText}
        subheadline={siteContent?.heroSubheadline}
        activeRoadTrucksText={
          (!siteContent?.useLiveDatabaseStats && siteContent?.metricActiveRoadTrucks)
            ? siteContent.metricActiveRoadTrucks
            : undefined
        }
      />

      {/* 2. Three Audience Cards - Dedicated Category Portals (الفئات الثلاث) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-5">
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

      {/* 3. Transport Requests Management & Workflow Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {currentUser && (
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
        )}

        {/* Transport Requests & Trips Display (Public / Authorized) */}
        <TransportRequestsList
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onNavigateToOrders={() => onNavigate('orders')}
        />
      </div>

      {/* 4. Promotional Banner */}
      <PromoBanner
        onRegisterNow={() => onOpenAuth('register')}
        announcement={siteContent?.announcement}
      />

      {/* 5. Mobile App Download & Live Sync Banner */}
      {onOpenMobileApp && (
        <MobileAppBanner onOpenModal={onOpenMobileApp} />
      )}

      {/* 6. Quick Numbers & Real Operational Trust Metrics */}
      {(() => {
        const realMetrics = ctStorage.getRealMetrics();
        const displayMetrics = {
          completedTrips: (!siteContent?.useLiveDatabaseStats && siteContent?.metricCompletedTrips)
            ? siteContent.metricCompletedTrips
            : `${realMetrics.completedTrips.toLocaleString()}`,
          registeredTrucks: (!siteContent?.useLiveDatabaseStats && siteContent?.metricRegisteredTrucks)
            ? siteContent.metricRegisteredTrucks
            : `${realMetrics.registeredTrucks.toLocaleString()}`,
          partnerCompanies: (!siteContent?.useLiveDatabaseStats && siteContent?.metricPartnerCompanies)
            ? siteContent.metricPartnerCompanies
            : `${realMetrics.partnerCompanies.toLocaleString()}`,
          onTimeRate: (!siteContent?.useLiveDatabaseStats && siteContent?.metricOnTimeRate)
            ? siteContent.metricOnTimeRate
            : realMetrics.onTimeRate
        };

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
              {/* Real-time Indicator Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black text-emerald-400">
                    بيانات وإحصائيات تشغيلية حقيقية
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  محدثة لحظياً وتلقائياً من واقع قاعدة بيانات منصة ConnectTrans الفعلية
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <span className="block text-3xl sm:text-4xl font-black text-amber-400 font-mono mb-1">
                    {displayMetrics.completedTrips}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-300">
                    رحلة نقل مكتملة
                  </span>
                </div>
                <div>
                  <span className="block text-3xl sm:text-4xl font-black text-blue-400 font-mono mb-1">
                    {displayMetrics.registeredTrucks}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-300">
                    شاحنة مسجلة ومعتمدة
                  </span>
                </div>
                <div>
                  <span className="block text-3xl sm:text-4xl font-black text-emerald-400 font-mono mb-1">
                    {displayMetrics.partnerCompanies}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-300">
                    شركة ومصنع شريك
                  </span>
                </div>
                <div>
                  <span className="block text-3xl sm:text-4xl font-black text-amber-300 font-mono mb-1">
                    {displayMetrics.onTimeRate}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-300">
                    نسبة الالتزام بالمواعيد
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
