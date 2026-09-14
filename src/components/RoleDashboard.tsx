import React, { useState } from 'react';
import { 
  Building2, Briefcase, Truck, ArrowLeft, CheckCircle2, 
  MapPin, ShieldCheck, DollarSign, Calendar, Clock, 
  Search, Plus, Eye, Navigation, Phone, Check, RefreshCw
} from 'lucide-react';
import { UserRole, UserAccount, Shipment, CommissionProfile } from '../types';
import { calculateTripCommission } from '../data/egyptLocations';
import { RequestLifecycleManager } from './RequestLifecycleManager';

interface RoleDashboardProps {
  currentRole: UserRole;
  userAccount?: UserAccount;
  allShipments: Shipment[];
  commissionProfile: CommissionProfile;
  onOpenBooking: () => void;
  onSwitchRole: (role: UserRole) => void;
  onNavigateHome: () => void;
  onOpenAdmin?: () => void;
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
}) => {
  const [selectedTab, setSelectedTab] = useState<'available' | 'my_trips' | 'wallet' | 'live_requests'>('available');
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
      description: 'طلب سيارات وشاحنات فورية ومجدولة لنقل المنتجات والمواد الخام بين المحافظات والموانئ.',
    },
    office: {
      title: 'بوابة مكاتب النقل والوساطة المعتمدة',
      badge: 'مكتب لوجستي',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Briefcase,
      description: 'تنظيم شاحنات الأسطول، استقبال بوالص الشحن، وإسناد الرحلات للسائقين بأقل عمولة.',
    },
    driver: {
      title: 'بوابة صاحب السيارة أو السائق (حمولات وعودة محملة)',
      badge: 'مالك / سائق شاحنة',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: Truck,
      description: 'العثور على حمولات قريبة وفورية، وتأمين نقلات العودة لتفادي السير فارغاً مع أسرع سداد.',
    },
  };

  const currentConfig = roleConfigs[currentRole] || roleConfigs.company;

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
      
      {/* Top Bar with Role Switcher */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
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
                <h1 className="text-base sm:text-lg font-black text-slate-900">{currentConfig.title}</h1>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentConfig.badgeBg}`}>
                  {currentConfig.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">{currentConfig.description}</p>
            </div>
          </div>

          {/* Role Preview Switcher Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden md:inline">عرض الصلاحية:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onSwitchRole('company')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'company' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الشركات
              </button>
              <button
                onClick={() => onSwitchRole('driver')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'driver' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                صاحب سيارة
              </button>
              <button
                onClick={() => onSwitchRole('office')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'office' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مكتب نقل
              </button>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'admin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                المدير العام
              </button>
            </div>

            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer mr-2"
            >
              الرئيسية
            </button>
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

        {currentRole === 'admin' && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950">أنت تتصفح بصلاحية المدير والمشرف العام (Admin)</h4>
                <p className="text-xs text-amber-800">
                  يمكنك الانتقال فورياً إلى لوحة الإدارة للتحكم في بروفايلات العمولات وتعديل بيانات أي فئة من الفئات الأربع وتعديل صفحات الموقع.
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

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setSelectedTab('available')}
            className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              selectedTab === 'available'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentRole === 'company' ? 'عروض الشاحنات والرحلات المتاحة' : 'الحمولات المعروضة في محافظات وقرى مصر'}
          </button>
          
          <button
            onClick={() => setSelectedTab('my_trips')}
            className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              selectedTab === 'my_trips'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            رحلاتي النشطة والمكتملة (4)
          </button>

          <button
            onClick={() => setSelectedTab('wallet')}
            className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              selectedTab === 'wallet'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            المحفظة والفواتير وحساب العمولة
          </button>

          <button
            onClick={() => setSelectedTab('live_requests')}
            className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              selectedTab === 'live_requests'
                ? 'border-amber-500 text-amber-700 bg-amber-50/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            نظام طلبات النقل والكميات والقبول (ConnectTrans)
          </button>
        </div>

        {/* ================= TAB 1: SHIPMENTS / LOADS ================= */}
        {selectedTab === 'available' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>تصفية حسب نطاق المحافظات المصرية:</span>
                <select
                  value={governorateFilter}
                  onChange={(e) => setGovernorateFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-900"
                >
                  <option value="all">كافة محافظات مصر</option>
                  <option value="القاهرة">القاهرة والجيزة</option>
                  <option value="الإسكندرية">الإسكندرية والبحيرة</option>
                  <option value="الشرقية">الشرقية والقليوبية والعاشر</option>
                  <option value="الدقهلية">الدقهلية والغربية والمنوفية</option>
                  <option value="السويس">السويس والعين السخنة</option>
                  <option value="قنا">محافظات الصعيد (أسيوط / قنا / أسوان)</option>
                </select>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                يتم حساب العمولة تلقائياً بدقة وفقاً لتسعيرة الرحلة المعتمدة
              </span>
            </div>

            {/* Shipment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredShipments.map(s => {
                const commission = calculateTripCommission(s.price, commissionProfile);
                
                return (
                  <div 
                    key={s.id} 
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div>
                          <span className="text-[11px] font-mono text-slate-500 block">رقم الإذن: {s.trackingNumber}</span>
                          <h4 className="text-base font-black text-slate-900">{s.sender}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === 'in_transit' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.status === 'in_transit' ? 'جاري النقل' : 'بانتظار سائق'}
                        </span>
                      </div>

                      {/* Route Locations (Exact Pickup & Dropoff) */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                            م
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">مكان التحميل: {s.fromCity}</span>
                            {s.specificPickupLocation && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Navigation className="w-3 h-3 text-emerald-600 inline" />
                                <span>{s.specificPickupLocation}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                            ت
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">مكان التسليم والتفريغ: {s.toCity}</span>
                            {s.specificDropoffLocation && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Navigation className="w-3 h-3 text-rose-600 inline" />
                                <span>{s.specificDropoffLocation}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cargo Details */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 gap-2 text-xs mb-4">
                        <div>
                          <span className="text-[11px] text-slate-500 block">نوع السيارة:</span>
                          <span className="font-bold text-slate-800">{s.truckType}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">الحمولة والوزن:</span>
                          <span className="font-bold text-slate-800">{s.cargoType} ({s.weightTons} طن)</span>
                        </div>
                      </div>

                      {/* Pricing & Commission Breakdown for Both Parties */}
                      <div className="p-3.5 bg-gradient-to-r from-blue-50/70 to-slate-50 border border-blue-200 rounded-2xl space-y-1.5 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">صافي أجر النقل للرحلة:</span>
                          <span className="text-lg font-black text-blue-700 font-mono">
                            {s.price.toLocaleString()} ج.م
                          </span>
                        </div>

                        <div className="border-t border-blue-200/80 pt-1.5 flex items-center justify-between text-[11px]">
                          <span className="text-emerald-700 font-bold">
                            عمولة الشركة: {commission.shipperFee.toLocaleString()} ج.م
                          </span>
                          <span className="text-blue-700 font-bold">
                            عمولة السائق: {commission.transporterFee.toLocaleString()} ج.م
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block text-right font-medium">
                          حسب شريحة: {commission.tierLabel}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2">
                      {currentRole === 'driver' || currentRole === 'office' ? (
                        <button
                          onClick={() => handleAcceptShipment(s.id)}
                          disabled={simulatedAcceptedId === s.id}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          {simulatedAcceptedId === s.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>جاري إسناد الرحلة وحجز البوليصة...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>قبول الحمولة والاتصال للتنفيذ</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`بيانات التواصل مع الشاحنة لمسار: ${s.fromCity} إلى ${s.toCity} متوفرة إلكترونياً.`)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          عرض تفاصيل ومسار الشاحنة
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= TAB 2: MY TRIPS ================= */}
        {selectedTab === 'my_trips' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">سجل الرحلات والبوالص الصادرة</h3>
              <span className="text-xs text-slate-500">تم توثيق كافة الرحلات مع إيصالات الاستلام الرقمية</span>
            </div>

            <div className="space-y-3">
              {allShipments.map(s => (
                <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-700">{s.trackingNumber}</span>
                      <span className="text-xs font-bold text-slate-800">{s.fromCity} ➔ {s.toCity}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      الحمولة: {s.cargoType} • الشاحنة: {s.truckType} • الحالة: {s.currentLocation}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">{s.price.toLocaleString()} ج.م</span>
                      <span className="text-[11px] text-emerald-600 font-bold">بوليصة مؤكدة</span>
                    </div>
                    <button 
                      onClick={() => alert(`بوليصة الشحن الإلكترونية للرحلة ${s.trackingNumber} جاهزة للطباعة والتوقيع.`)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      عرض البوليصة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: WALLET & COMMISSIONS ================= */}
        {selectedTab === 'wallet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <span className="text-xs font-bold text-slate-500 block">رصيد الحساب المتاح للسحب / الشحن:</span>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {userAccount ? userAccount.walletBalance.toLocaleString() : '14,850'} <span className="text-sm font-bold text-slate-500">ج.م</span>
              </div>
              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => alert('تم فتح بوابة الإيداع والشحن السريع عبر فودافون كاش أو إنستاباي أو الحساب البنكي')}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  إيداع رصيد
                </button>
                <button 
                  onClick={() => alert('طلب سحب الأرباح عبر إنستاباي أو المحفظة الذكية')}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  سحب الرصيد
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs md:col-span-2 space-y-4">
              <h4 className="text-sm font-black text-slate-900">سجل تسويات العمولات الأخيرة مع المنصة</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black">
                      <th className="pb-2">رقم الرحلة</th>
                      <th className="pb-2">قيمة النقلة</th>
                      <th className="pb-2">العمولة المقتطعة</th>
                      <th className="pb-2">طريقة التسوية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="py-2.5 font-mono">EG-90214</td>
                      <td className="py-2.5">4,500 ج.م</td>
                      <td className="py-2.5 text-emerald-600 font-bold">0 ج.م (مجاني - الفترة التجريبية)</td>
                      <td className="py-2.5">معفاة بالكامل</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono">EG-88410</td>
                      <td className="py-2.5">8,500 ج.م</td>
                      <td className="py-2.5 text-emerald-600 font-bold">0 ج.م (مجاني - الفترة التجريبية)</td>
                      <td className="py-2.5">معفاة بالكامل</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono">EG-66115</td>
                      <td className="py-2.5">16,500 ج.م</td>
                      <td className="py-2.5 text-emerald-600 font-bold">0 ج.م (مجاني - الفترة التجريبية)</td>
                      <td className="py-2.5">معفاة بالكامل</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 4: CONNECTTRANS LIVE REQUESTS ================= */}
        {selectedTab === 'live_requests' && (
          <RequestLifecycleManager />
        )}

      </div>
    </div>
  );
};
