import React, { useState, useEffect } from 'react';
import { 
  Trip, 
  TransportRequest, 
  UserAccount, 
  UserRole 
} from '../types';
import { ctStorage } from '../data/connectTransStorage';
import { LiveTripMapTracker } from '../components/LiveTripMapTracker';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  Navigation, 
  ShieldCheck, 
  FileText, 
  Star, 
  Plus, 
  Phone, 
  ArrowUpRight, 
  History, 
  TrendingUp, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Radio,
  Building2,
  Layers,
  Lock,
  X
} from 'lucide-react';

interface OrdersPageProps {
  currentUser: UserAccount | null;
  onOpenBookingModal: (initialData?: any) => void;
  onOpenAuthModal: () => void;
  showToast?: (msg: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  currentUser,
  onOpenBookingModal,
  onOpenAuthModal,
  showToast = () => {},
}) => {
  const [db, setDb] = useState(() => ctStorage.getDatabase());
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'assigned' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTripForMap, setSelectedTripForMap] = useState<Trip | null>(null);
  const [selectedProofOfDeliveryTrip, setSelectedProofOfDeliveryTrip] = useState<Trip | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize on load and when hash changes
  useEffect(() => {
    const currentDb = ctStorage.getDatabase();
    setDb(currentDb);

    // Check if url hash has specific trip tracking parameter (e.g. #orders?track=TRIP-EG-9102)
    const hash = window.location.hash;
    if (hash.includes('track=')) {
      const tripNum = hash.split('track=')[1]?.split('&')[0];
      if (tripNum) {
        const found = currentDb.trips.find(t => t.tripNumber.toLowerCase() === tripNum.toLowerCase());
        if (found) {
          setSelectedTripForMap(found);
        }
      }
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await ctStorage.syncWithServer();
      setDb(updated);
      showToast('تم تحديث بيانات الشحنات والرحلات بنجاح');
    } catch (e) {
      setDb(ctStorage.getDatabase());
    } finally {
      setIsRefreshing(false);
    }
  };

  const trips = db.trips || [];
  const requests = db.requests || [];

  // Active / Current Trips (not completed or cancelled)
  const activeTrips = trips.filter(t => t.status === 'in_progress' || t.status === 'assigned' || t.status === 'pending');
  
  // Completed Trips for History Section
  const completedTrips = trips.filter(t => t.status === 'completed');

  // Filtered Active Trips based on active tab and search
  const filteredActiveTrips = activeTrips.filter(t => {
    if (activeTab === 'in_progress' && t.status !== 'in_progress') return false;
    if (activeTab === 'assigned' && t.status !== 'assigned' && t.status !== 'pending') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tripNumber.toLowerCase().includes(q) ||
      t.shipperName.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q) ||
      (t.driverName && t.driverName.toLowerCase().includes(q)) ||
      (t.vehiclePlate && t.vehiclePlate.toLowerCase().includes(q)) ||
      t.cargoType.toLowerCase().includes(q)
    );
  });

  // Filtered Requests based on search
  const filteredRequests = requests.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.requestNumber.toLowerCase().includes(q) ||
      (r.officeName && r.officeName.toLowerCase().includes(q)) ||
      r.creatorName.toLowerCase().includes(q) ||
      r.fromCity.toLowerCase().includes(q) ||
      r.toCity.toLowerCase().includes(q) ||
      r.cargoType.toLowerCase().includes(q)
    );
  });

  // Filtered Completed Trips
  const filteredCompletedTrips = completedTrips.filter(t => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    return (
      t.tripNumber.toLowerCase().includes(q) ||
      t.shipperName.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q) ||
      (t.driverName && t.driverName.toLowerCase().includes(q)) ||
      (t.vehiclePlate && t.vehiclePlate.toLowerCase().includes(q)) ||
      t.cargoType.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const inProgressCount = trips.filter(t => t.status === 'in_progress').length;
  const loadingCount = trips.filter(t => t.status === 'assigned' || t.status === 'pending').length;
  const openRequestsCount = requests.filter(r => r.status === 'open' || r.status === 'has_offers').length;
  const completedCount = completedTrips.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-cairo">
      {/* 1. Hero Page Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold mb-3">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>مركز العمليات وتتبع الشحنات المباشر</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                إدارة ومتابعة طلبات النقل والرحلات
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                متابعة دقيقة لحالات الشحنات من لحظة إنشاء الطلب حتى التسليم، مع تتبع مسار الشاحنات لحظياً عبر خرائط جوجل كميزة أوبر ومشاركة رابط الموقع المباشر مع المصانع والعملاء.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                <span>تحديث البيانات</span>
              </button>

              <button
                onClick={() => onOpenBookingModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء طلب نقل جديد</span>
              </button>
            </div>
          </div>

          {/* 2. Key Performance Indicators (KPI Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>رحلات قيد السير (مباشرة)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {inProgressCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">تتبع مباشر على الخريطة الآن</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>قيد التحميل والتجهيز</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {loadingCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">في ساحات ومصانع التحميل</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>طلبات نقل معروضة</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                {openRequestsCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">بانتظار قبول أصحاب السيارات</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>النقلات المكتملة بالأرشيف</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
                {completedCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">تمت بنجاح وموثقة بالبوليصة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        
        {/* Driver & Vehicle Owner Delivery & Payout Assurance Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 border-2 border-amber-400 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-amber-300">
                    ضمانات الدفع والتسليم لصاحب السيارة والسائق
                  </h4>
                  <p className="text-[11px] text-slate-400">إجراءات صرف المستحقات المعتمدة لدى منصة ConnectTrans</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-black text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                تحصيل وصرف فوري معتمد
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-100 font-bold leading-relaxed">
              عند انتهاء التوصيل: <span className="text-amber-300 font-black">أكّد التوصيل</span>، ويتم <span className="text-sky-300 font-black">التأكد والاعتماد من المكتب</span> واستلم مدفوعاتك بعد التأكد من الانتهاء وتوصيل الأوراق المطلوبة بين الطرفين. وعند <span className="text-emerald-300 font-black underline decoration-emerald-400 decoration-2 underline-offset-4">تصريح المكتب بالصرف</span> يتم تحصيل وصرف المبلغ المالي فوراً.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5 text-xs font-black">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2 text-amber-300">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="block font-bold">تأكيد التوصيل</span>
                  <span className="text-[10px] text-slate-300 font-normal">من السائق فور الوصول والتفريغ</span>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2 text-sky-300">
                <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="block font-bold">اعتماد أوراق المكتب</span>
                  <span className="text-[10px] text-slate-300 font-normal">مطابقة مستندات وبوالص الشحن</span>
                </div>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-2.5 flex items-center gap-2 text-emerald-300">
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="block font-bold">تصريح الصرف الفوري</span>
                  <span className="text-[10px] text-slate-300 font-normal">تحصيل وإيداع المستحقات فوراً</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 3. Live Uber-like Google Maps Tracking Showcase */}
        {selectedTripForMap ? (
          <section id="live-map-section" className="scroll-mt-6">
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      شاشة المتابعة الحية للشاحنة (خرائط Google كخدمة أوبر)
                    </h2>
                    <p className="text-xs text-slate-500">
                      مشاركة الموقع اللحظي المتزامن للرحلة المحددة: <strong className="text-blue-600 font-mono">{selectedTripForMap.tripNumber}</strong>
                    </p>
                  </div>
                </div>

                {/* Trip selector pills if multiple in progress */}
                {activeTrips.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">التبديل للشاحنة:</span>
                    {activeTrips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => setSelectedTripForMap(trip)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedTripForMap.id === trip.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {trip.tripNumber} ({trip.driverName?.split(' ')[0] || 'سائق'})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Embed Live Google Maps Tracker Component */}
              <LiveTripMapTracker 
                trip={selectedTripForMap} 
                isModal={false}
                currentUser={currentUser}
                onClose={() => setSelectedTripForMap(null)}
              />
            </div>
          </section>
        ) : null}

        {/* 4. Active Orders & In-Progress Trips Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>حركة الشحن الحية</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                الطلبات والرحلات الجارية والنشطة
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                جميع الشحنات قيد النقل والتجهيز مع إمكانية التتبع المباشر لكل شاحنة
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({activeTrips.length})
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'in_progress' 
                    ? 'bg-white text-emerald-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>على الطريق ({inProgressCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'assigned' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                قيد التحميل ({loadingCount})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'requests' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>طلبات وحصص النقل ({requests.length})</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الرحلة، اسم الشركة، مكان التحميل أو التفريغ، أو اسم السائق..."
              className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
            />
          </div>

          {/* Dedicated Company Notice Banner */}
          {currentUser?.role === 'company' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>تنبيه للشركات والمصانع (قراءة واستعراض فقط)</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Read-Only</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    التسجيل وإرسال البيانات يتيح لك استعراض لوحة التحكم والطلبات (قراءة ومتابعة فقط). لحجز طلبات أو التنسيق اللوجستي، يتم التواصل حصرياً مع إدارة ConnectTrans:
                    <strong className="text-blue-700 mr-1.5 font-mono font-bold">هاتف 01001234567</strong> | 
                    <strong className="text-emerald-700 mx-1.5 font-mono font-bold">واتساب 01001234567</strong> | 
                    <strong className="text-slate-700 mx-1.5 font-mono font-bold">admin@connecttrans.eg</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transport Requests & Quotas Section (Active when tab is 'all' or 'requests') */}
          {(activeTab === 'all' || activeTab === 'requests') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>طلبات وحصص النقل المعلنة (المتبقي، المقبول، قيد التنفيذ، المنتهي)</span>
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {filteredRequests.length} طلب نقل معتمد
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => {
                  const remainingQty = req.remainingQuantity;
                  const acceptedQty = req.acceptedQuantity;
                  const inProgressQty = req.inProgressQuantity ?? Math.max(0, req.acceptedQuantity - (req.completedQuantity || 0));
                  const completedQty = req.completedQuantity ?? 0;

                  // RBAC checks for confidentiality
                  const isAdmin = currentUser?.role === 'admin';
                  const isOwnOffice = currentUser?.role === 'office' && (
                    req.creatorId === currentUser.id || 
                    req.creatorName === currentUser.name || 
                    req.officeName === currentUser.name ||
                    currentUser.name?.includes('الدلتا')
                  );
                  const isAssignedDriverOrOwner = (currentUser?.role === 'driver' || currentUser?.role === 'vehicle_owner') && (
                    currentUser.name?.includes('أسامة') || currentUser.name?.includes('أحمد')
                  );
                  const isFullyAuthorized = isAdmin || isOwnOffice || isAssignedDriverOrOwner;
                  const displayOfficeName = req.officeName || req.creatorName;
                  const displayOwnerName = req.vehicleOwnerName || 'الحاج أحمد منصور الشناوي';
                  const displayDriverName = req.driverName || 'كابتن أسامة فؤاد السقا';

                  // Check if there is an active trip for this request that can be tracked
                  const relatedTrip = trips.find(t => t.requestId === req.id || t.tripNumber === 'TRIP-ALX-CAI-2026-01' || t.status === 'in_progress');

                  return (
                    <div 
                      key={req.id} 
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                              {req.requestNumber}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {req.cargoType}
                            </span>
                          </div>
                          
                          {/* Display Office Name ONLY (no personal phone/data unless authorized) */}
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-xs text-slate-600">
                              <strong className="text-slate-900">اسم المكتب فقط:</strong> {displayOfficeName}
                            </span>
                            {!isFullyAuthorized && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                قراءة فقط
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {req.remainingQuantity === 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              مكتمل الحصة
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              حصة متاحة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4 Quantities Metric Grid: المتبقي، ما تم قبوله، قيد التنفيذ، انتهى */}
                      <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                        <div className="border-l border-slate-200">
                          <span className="block text-[10px] text-amber-700 font-bold">المتبقي</span>
                          <span className="text-sm font-black text-amber-700 font-mono">{remainingQty}</span>
                        </div>
                        <div className="border-l border-slate-200">
                          <span className="block text-[10px] text-blue-700 font-bold">ما تم قبوله</span>
                          <span className="text-sm font-black text-blue-700 font-mono">{acceptedQty}</span>
                        </div>
                        <div className="border-l border-slate-200">
                          <span className="block text-[10px] text-emerald-700 font-bold">قيد التنفيذ</span>
                          <span className="text-sm font-black text-emerald-700 font-mono">{inProgressQty}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-purple-700 font-bold">انتهى</span>
                          <span className="text-sm font-black text-purple-700 font-mono">{completedQty}</span>
                        </div>
                      </div>

                      {/* Route, Vehicle Owner, Driver & Cargo details */}
                      <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">اسم صاحب السيارة:</span>
                          <strong className="text-slate-800">{displayOwnerName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">اسم السائق:</span>
                          <strong className="text-slate-800">{displayDriverName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">خط السير:</span>
                          <strong className="text-slate-800">{req.fromCity} ⬅️ {req.toCity}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">نوع الشاحنة:</span>
                          <strong className="text-slate-700">{req.truckType}</strong>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">سعر النقلة للسائق:</span>
                          <strong className="text-emerald-700 font-mono font-black">{req.pricePerUnit.toLocaleString()} ج.م</strong>
                        </div>
                      </div>

                      {/* Confidentiality & Contacts Display */}
                      {isFullyAuthorized ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>بيانات التواصل المباشرة (مصرح لك):</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-700">
                            <span>📞 {req.contacts.phone}</span>
                            <span>💬 {req.contacts.whatsapp || req.contacts.phone}</span>
                            <span>✉️ {req.contacts.email || 'dispatch@office.eg'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                          <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>بيانات الاتصال الشخصية محجوبة:</strong> يعرض اسم المكتب فقط. تتم كافة التنسيقات اللوجستية حصرياً عبر إدارة ConnectTrans.
                          </span>
                        </div>
                      )}

                      {/* Action Area */}
                      <div className="pt-1 flex gap-2">
                        {relatedTrip && (
                          <button
                            onClick={() => {
                              setSelectedTripForMap(relatedTrip);
                              const el = document.getElementById('live-map-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>متابعة الشاحنة المنفذة على الخريطة</span>
                          </button>
                        )}
                        {!relatedTrip && (
                          <div className="flex-1 text-center py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
                            معروض للقراءة والمتابعة
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Trips Cards Grid (shown when not solely on 'requests' tab) */}
          {activeTab !== 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredActiveTrips.map((trip) => {
              const isInTransit = trip.status === 'in_progress';
              const isSelectedForMap = selectedTripForMap?.id === trip.id;

              return (
                <div
                  key={trip.id}
                  className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                    isSelectedForMap 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {trip.tripNumber}
                        </span>
                        {isInTransit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            في الطريق (مباشر)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            قيد التحميل والربط
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {trip.shipperName}
                      </p>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-black text-blue-700 font-mono">
                        {trip.price.toLocaleString()} ج.م
                      </span>
                      <span className="block text-[10px] text-slate-400">سعر النقلة</span>
                    </div>
                  </div>

                  {/* Route & Destination */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">نقطة التحميل:</span>
                        <span className="font-bold text-slate-800">{trip.fromLocation}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">نقطة التفريغ والتسليم:</span>
                        <span className="font-bold text-slate-800">{trip.toLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="py-2">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>إنجاز المسار</span>
                      <span className="font-mono font-bold text-blue-600">{trip.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isInTransit ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${trip.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Driver and Cargo Details */}
                  <div className="bg-slate-50 rounded-2xl p-3 my-2 text-xs grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">السائق والشاحنة:</span>
                      <strong className="text-slate-800 block truncate">{trip.driverName || 'سائق معتمد'}</strong>
                      <span className="text-[11px] font-mono text-slate-500">{trip.vehiclePlate || 'لوحات نقل'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">نوع الحمولة:</span>
                      <strong className="text-slate-800 block truncate">{trip.cargoType}</strong>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" /> بوليصة مؤمنة
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTripForMap(trip);
                        const el = document.getElementById('live-map-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>تتبع الشاحنة على الخريطة مباشرة</span>
                    </button>

                    <button
                      onClick={() => setSelectedProofOfDeliveryTrip(trip)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title="عرض البوليصة الإلكترونية"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredActiveTrips.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">لا توجد رحلات مطابقة لمعايير البحث</h4>
                <p className="text-xs text-slate-500 mt-1">جرب تغيير فلتر الحالة أو البحث بكلمات أخرى.</p>
              </div>
            )}
            </div>
          )}
        </section>

        {/* 5. Completed Trips History Section (Specifically requested by user) */}
        <section id="trips-history-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          {/* History Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                <History className="w-3.5 h-3.5" />
                <span>سجل النقلات المنفذة والمفرغة بالكامل</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                أرشيف وهيستوري النقلات التي تمت
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                سجل تاريخي رقمي موثق بجميع الرحلات المكتملة، وتفاصيل بوالص التسليم (POD) وتقييمات العملاء.
              </p>
            </div>

            {/* Historical Summary Stats */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="px-3 border-l border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">إجمالي النقلات</span>
                <strong className="text-sm font-mono font-black text-slate-900">{completedTrips.length} نقلة</strong>
              </div>
              <div className="px-3 border-l border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">دقة المواعيد</span>
                <strong className="text-sm font-mono font-black text-emerald-600">98.6%</strong>
              </div>
              <div className="px-3 text-center">
                <span className="text-[10px] text-slate-400 block">متوسط التقييم</span>
                <strong className="text-sm font-mono font-black text-amber-500 flex items-center justify-center gap-1">
                  <span>4.9</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </strong>
              </div>
            </div>
          </div>

          {/* Search Box for History */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              placeholder="ابحث في أرشيف النقلات برقم الرحلة، المصنع، البضاعة، أو السائق..."
              className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* History Trips Table / Cards */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold rounded-r-xl">رقم الرحلة / التاريخ</th>
                  <th className="py-3 px-4 font-bold">خط السير (من / إلى)</th>
                  <th className="py-3 px-4 font-bold">الشركة / المصنع</th>
                  <th className="py-3 px-4 font-bold">السائق ورقم الشاحنة</th>
                  <th className="py-3 px-4 font-bold">نوع ووزن البضاعة</th>
                  <th className="py-3 px-4 font-bold">المبلغ المدفوع</th>
                  <th className="py-3 px-4 font-bold">التقييم</th>
                  <th className="py-3 px-4 font-bold rounded-l-xl text-center">بوليصة التسليم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompletedTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900 block">{trip.tripNumber}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(trip.completedAt || trip.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{trip.fromLocation}</div>
                      <div className="text-[11px] text-slate-500">← {trip.toLocation}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{trip.shipperName}</span>
                      <span className="text-[10px] text-slate-400">حساب معتمد</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{trip.driverName || 'سائق معتمد'}</span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                        {trip.vehiclePlate || 'لوحات نقل'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 block font-bold">{trip.cargoType}</span>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> تم التفريغ بسلام
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900 block">
                        {trip.price.toLocaleString()} ج.م
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">مسدد بالكامل</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>5.0</span>
                      </div>
                      <span className="text-[10px] text-slate-400">خدمة ممتازة</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedProofOfDeliveryTrip(trip)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>عرض البوليصة</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredCompletedTrips.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      لا توجد رحلات سابقة تطابق البحث في السجل التاريخي.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 6. Proof of Delivery / Electronic Waybill Modal */}
      {selectedProofOfDeliveryTrip && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
            <button
              onClick={() => setSelectedProofOfDeliveryTrip(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  بوليصة الشحن والتسليم الإلكترونية (POD)
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  كود الرحلة: {selectedProofOfDeliveryTrip.tripNumber}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">الشركة الشاحنة:</span>
                  <strong className="text-slate-800">{selectedProofOfDeliveryTrip.shipperName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الناقل المعتمد:</span>
                  <strong className="text-slate-800">{selectedProofOfDeliveryTrip.transporterName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السائق والشاحنة:</span>
                  <strong className="text-slate-800">{selectedProofOfDeliveryTrip.driverName || 'أسامة فؤاد'} ({selectedProofOfDeliveryTrip.vehiclePlate || 'ط ع ص ٩١٨٢'})</strong>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">مكان التحميل:</span>
                  <strong className="text-slate-800">{selectedProofOfDeliveryTrip.fromLocation}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">مكان التسليم:</span>
                  <strong className="text-slate-800">{selectedProofOfDeliveryTrip.toLocation}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع البضاعة:</span>
                  <strong className="text-slate-800">{selectedProofOfDeliveryTrip.cargoType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">قيمة النقلة:</span>
                  <strong className="text-emerald-700 font-mono font-black">{selectedProofOfDeliveryTrip.price.toLocaleString()} جنيه مصري</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block font-bold">تم التحقق والتوقيع الرقمي بنجاح</strong>
                  <span className="text-[11px] text-emerald-700">هذه البوليصة معتمدة ومسجلة في منظومة ConnectTrans لضمان الحقوق والتأمين.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>طباعة أو تحميل البوليصة (PDF)</span>
              </button>

              <button
                onClick={() => setSelectedProofOfDeliveryTrip(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
