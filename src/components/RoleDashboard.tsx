import React, { useState } from 'react';
import { 
  Building2, Briefcase, Truck, ArrowLeft, CheckCircle2, 
  MapPin, ShieldCheck, DollarSign, Calendar, Clock, 
  Search, Plus, Eye, Navigation, Phone, Check, RefreshCw,
  LogOut, Lock
} from 'lucide-react';
import { UserRole, UserAccount, Shipment, CommissionProfile } from '../types';
import { calculateTripCommission } from '../data/egyptLocations';
import { RequestLifecycleManager } from './RequestLifecycleManager';
import { ConnectTransWorkflowManager } from './ConnectTransWorkflowManager';

interface RoleDashboardProps {
  currentRole: UserRole;
  userAccount?: UserAccount | null;
  allShipments: Shipment[];
  commissionProfile: CommissionProfile;
  onOpenBooking: () => void;
  onSwitchRole: (role: UserRole) => void;
  onNavigateHome: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
  onRequireLogin?: (role?: UserRole) => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  currentRole,
  userAccount,
  allShipments,
  commissionProfile,
  onOpenBooking,
  onSwitchRole,
  onNavigateHome,
  onOpenAdmin,
  onLogout,
  onRequireLogin,
}) => {
  const [selectedTab, setSelectedTab] = useState<'available' | 'my_trips' | 'wallet' | 'live_requests' | 'workflow'>('workflow');
  const [governorateFilter, setGovernorateFilter] = useState('all');
  const [simulatedAcceptedId, setSimulatedAcceptedId] = useState<string | null>(null);

  // Role Metadata
  const roleConfigs = {
    admin: {
      title: 'لوحة تحكم الإدارة والمشرفين',
      badge: 'إشراف كامل',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: ShieldCheck,
      description: 'إشراف كامل على كافة العمليات والشحنات ومحافظ السائقين والشركات.',
    },
    company: {
      title: 'بوابة الشركات والمصانع التجارية',
      badge: 'شاحن بضائع / مصنع',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Building2,
      description: 'تسجيل طلبات التعاون مع ConnectTrans، متابعة الشحنات والبوالص، وتقييم أداء النقل.',
    },
    office: {
      title: 'بوابة مكاتب النقل والوساطة المعتمدة',
      badge: 'مكتب لوجستي مرخص',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Briefcase,
      description: 'استعراض طلبات النقل، تقديم عروض الأسعار الرسمية، وإسناد الرحلات للسائقين.',
    },
    driver: {
      title: 'بوابة صاحب السيارة والسائق (حمولات وعودة محملة)',
      badge: 'مالك / سائق شاحنة',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: Truck,
      description: 'تصفح عروض مكاتب النقل، قبول الشحنات وتحديد الكمية، وتجنب السير فارغاً مع سداد فوري.',
    },
  };

  const currentConfig = roleConfigs[currentRole] || roleConfigs.company;

  // Security Wall: If not logged in, prompt authentication
  if (!userAccount) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">تسجيل الدخول مطلوب</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              لوحة العمليات والتحكمات الخاصة بـ <strong className="text-slate-900">{currentConfig.title}</strong> مشفرة ومحمية. يرجى تسجيل الدخول للوصول إلى بياناتك وشحناتك.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => onRequireLogin && onRequireLogin(currentRole)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>تسجيل الدخول كـ {currentConfig.badge}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptShipment = (id: string) => {
    setSimulatedAcceptedId(id);
    setTimeout(() => {
      alert('تم قبول الشحنة وحجزها بنجاح! تم إرسال بوليصة الشحن وتفاصيل التحميل إلى هاتفك.');
      setSimulatedAcceptedId(null);
    }, 1200);
  };

  // Filter shipments
  const filteredShipments = allShipments.filter(s => {
    if (governorateFilter === 'all') return true;
    return s.fromGovernorate?.includes(governorateFilter) || s.toGovernorate?.includes(governorateFilter);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      
      {/* Top Bar with Strict Security Identification */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Authenticated Identity Capsule */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
              currentRole === 'company' ? 'bg-emerald-100 text-emerald-700' :
              currentRole === 'driver' ? 'bg-blue-100 text-blue-700' :
              currentRole === 'office' ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'
            }`}>
              <currentConfig.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900">{userAccount.name}</h1>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentConfig.badgeBg}`}>
                  {currentConfig.badge}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                  {userAccount.phone}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {userAccount.governorate} — {userAccount.city || 'المنطقة الصناعية'} | حالة التوثيق: معتمد رسمياً
              </p>
            </div>
          </div>

          {/* Action and Permission Controls */}
          <div className="flex items-center gap-2">
            
            {/* ONLY Admin can switch preview roles for testing */}
            {userAccount.role === 'admin' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 px-1.5 hidden md:inline">محاكاة الفئات:</span>
                <button
                  onClick={() => onSwitchRole('company')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentRole === 'company' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الشركات
                </button>
                <button
                  onClick={() => onSwitchRole('office')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentRole === 'office' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  مكتب نقل
                </button>
                <button
                  onClick={() => onSwitchRole('driver')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentRole === 'driver' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  صاحب سيارة
                </button>
                <button
                  onClick={() => onSwitchRole('admin')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentRole === 'admin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  إشراف عام
                </button>
              </div>
            )}

            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              الرئيسية
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="تسجيل الخروج من الجلسة"
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Active Commission Banner Info */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 inline-block mb-2">
                نظام عمولة ConnectTrans المعتمد لجميع الأطراف
              </span>
              <h2 className="text-xl font-black">
                البروفايل المطبق: {commissionProfile.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {commissionProfile.description} — يتم حسم عمولة رمزية تبدأ من 10 ج.م فقط وتوفير حماية كاملة لحقوق السائق والشركة.
              </p>
            </div>

            {currentRole === 'company' && (
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>طلب نقل شحنة جديدة</span>
              </button>
            )}

            {currentRole === 'driver' && (
              <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-right">
                <span className="text-[11px] text-slate-300 block">حالة جاهزية الشاحنة:</span>
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  متاح لاستقبال حمولات فورية
                </span>
              </div>
            )}
          </div>
        </div>

        {/* If Admin logged in: supervisor banner */}
        {currentRole === 'admin' && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950">أنت تتصفح بصلاحية المدير والمشرف العام (Admin)</h4>
                <p className="text-xs text-amber-800">
                  يمكنك الانتقال فورياً إلى لوحة الإدارة للتحكم في بروفايلات العمولات وتعديل بيانات أي فئة من الفئات وتعديل صفحات الموقع.
                </p>
              </div>
            </div>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-all whitespace-nowrap"
              >
                دخول لوحة التحكم المركزية (Admin Panel)
              </button>
            )}
          </div>
        )}

        {/* Main Operational Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTab('workflow')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              selectedTab === 'workflow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            منظومة التشغيل والربط الفوري الحية
          </button>
          <button
            onClick={() => setSelectedTab('live_requests')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              selectedTab === 'live_requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            دورة حياة الطلبات والبوالص المعتمدة
          </button>
          <button
            onClick={() => setSelectedTab('available')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              selectedTab === 'available'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {currentRole === 'company' ? 'إجمالي طلبات الشحن المباشرة' : 'الحمولات المعروضة في المحافظات'}
          </button>
          <button
            onClick={() => setSelectedTab('wallet')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              selectedTab === 'wallet'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            محفظة المعاملات والمستحقات
          </button>
        </div>

        {/* Tab 1: Workflow Manager (Scoped to current user) */}
        {selectedTab === 'workflow' && (
          <div className="space-y-6">
            <ConnectTransWorkflowManager 
              currentUser={userAccount}
              onRequireAuth={(role) => onRequireLogin && onRequireLogin(role)}
            />
          </div>
        )}

        {/* Tab 2: Request Lifecycle Manager */}
        {selectedTab === 'live_requests' && (
          <div className="space-y-6">
            <RequestLifecycleManager />
          </div>
        )}

        {/* Tab 3: Available Shipments with Commission Calculation */}
        {selectedTab === 'available' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">تصفية حسب المحافظة:</span>
                <select
                  value={governorateFilter}
                  onChange={(e) => setGovernorateFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden"
                >
                  <option value="all">جميع المحافظات</option>
                  <option value="القاهرة">القاهرة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="السويس">السويس (العين السخنة)</option>
                  <option value="بورسعيد">بورسعيد</option>
                  <option value="الشرقية">الشرقية (العاشر من رمضان)</option>
                  <option value="البحر الأحمر">البحر الأحمر</option>
                </select>
              </div>

              <span className="text-xs font-bold text-slate-500">
                إجمالي الشحنات المعروضة: {filteredShipments.length} شحنة
              </span>
            </div>

            {/* Shipments Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShipments.map((shipment) => {
                const commission = calculateTripCommission(shipment.price, commissionProfile);
                const isAccepted = simulatedAcceptedId === shipment.id;
                const driverNet = shipment.price - commission.transporterFee;

                return (
                  <div
                    key={shipment.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                          {shipment.truckType}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{shipment.id}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>من: {shipment.fromGovernorate} ({shipment.fromCity})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <Navigation className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>إلى: {shipment.toGovernorate} ({shipment.toCity})</span>
                        </div>
                        <div className="text-xs text-slate-500 pt-1">
                          نوع البضاعة: <strong className="text-slate-800">{shipment.cargoType}</strong> — {shipment.weightTons} طن
                        </div>
                      </div>

                      {/* Pricing and Commission breakdown */}
                      <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1 text-xs border border-slate-100">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>سعر النقل المتفق عليه:</span>
                          <span className="text-slate-900 font-mono font-black">{shipment.price.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>عمولة ConnectTrans ({commissionProfile.name}):</span>
                          <span className="text-amber-600 font-mono font-bold">-{commission.totalCommission} ج.م</span>
                        </div>
                        <div className="flex justify-between font-black text-emerald-700 pt-1 border-t border-slate-200 text-[13px]">
                          <span>صافي مستحقات السائق:</span>
                          <span className="font-mono">{driverNet.toLocaleString()} ج.م</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div>
                      {currentRole === 'driver' && (
                        <button
                          onClick={() => handleAcceptShipment(shipment.id)}
                          disabled={isAccepted}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isAccepted ? (
                            <span>جاري إسناد الشحنة...</span>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>قبول الشحنة وتحميل فوري</span>
                            </>
                          )}
                        </button>
                      )}

                      {currentRole === 'office' && (
                        <button
                          onClick={() => alert(`تم تحديد الشحنة ${shipment.id} لتقديم عرض أو إسناد لسائقي المكتب.`)}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>تقديم عرض تسعير أو حجز</span>
                        </button>
                      )}

                      {currentRole === 'company' && (
                        <div className="text-center py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
                          حالة الطلب: معروض لشبكة النقل
                        </div>
                      )}

                      {currentRole === 'admin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert(`تعديل الشحنة ${shipment.id}`)}
                            className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => alert(`إلغاء الشحنة ${shipment.id}`)}
                            className="flex-1 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Wallet & Balances */}
        {selectedTab === 'wallet' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">محفظة المعاملات والمستحقات المالية</h3>
                <p className="text-xs text-slate-500">حسابك المالي ورصيد التحويلات الفورية لبنك مصر / فودافون كاش / إنستاباي</p>
              </div>
              <div className="text-right bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl">
                <span className="text-xs text-emerald-800 font-bold block">الرصيد المتاح للسحب الفوري:</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {(userAccount.walletBalance || 4850).toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">إجمالي الرحلات المنفذة</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {userAccount.completedTrips || 24} رحلة
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">التقييم العام للأداء</span>
                <span className="text-xl font-black text-amber-500 font-mono flex items-center gap-1">
                  ★ {userAccount.rating || 4.9} / 5.0
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">معدل التزام العمولة</span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  100% منتظم
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => alert('تم طلب سحب الأرباح بنجاح عبر InstaPay!')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                طلب تحويل عبر InstaPay أو المحافظ الإلكترونية
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
