import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Truck, 
  Building2, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  ArrowLeft,
  ChevronLeft,
  Info,
  History,
  TrendingUp,
  Package,
  UserCheck
} from 'lucide-react';
import { ctStorage } from '../data/connectTransStorage';
import { TransportRequest, Trip, UserAccount } from '../types';

interface TransportRequestsListProps {
  currentUser: UserAccount | null;
  onOpenAuth?: (mode: 'login' | 'register', role?: any) => void;
  onNavigateToOrders?: () => void;
}

export const TransportRequestsList: React.FC<TransportRequestsListProps> = ({
  currentUser,
  onOpenAuth,
  onNavigateToOrders
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'in_progress' | 'history' | 'my_requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPodTrip, setSelectedPodTrip] = useState<Trip | null>(null);

  // Load latest state from connectTransStorage
  const db = ctStorage.getDatabase();
  const requests = db.requests;
  const trips = db.trips;

  // Derive driver/owner for each request if not explicitly present
  const enrichedRequests = useMemo(() => {
    return requests.map(req => {
      // Find related trip or acceptance
      const relatedTrip = trips.find(t => t.requestId === req.id || (req.id.includes('alex') && t.tripNumber.includes('ALX')));
      const relatedAcc = db.acceptances?.find(a => a.requestId === req.id);

      const displayOfficeName = req.officeName || (req.creatorType === 'office' ? req.creatorName : 'مكتب الدلتا لخدمات الشحن واللوجستيات');
      const displayOwnerName = req.vehicleOwnerName || relatedTrip?.transporterName || relatedAcc?.acceptedByUserName || 'الحاج أحمد منصور الشناوي';
      const displayDriverName = req.driverName || relatedTrip?.driverName || 'كابتن أسامة فؤاد السقا';

      const remainingQty = req.remainingQuantity;
      const acceptedQty = req.acceptedQuantity;
      const inProgressQty = req.inProgressQuantity ?? (relatedTrip && relatedTrip.status === 'in_progress' ? 1 : 0);
      const completedQty = req.completedQuantity ?? 0;

      return {
        ...req,
        officeName: displayOfficeName,
        vehicleOwnerName: displayOwnerName,
        driverName: displayDriverName,
        remainingQty,
        acceptedQty,
        inProgressQty,
        completedQty,
        relatedTrip
      };
    });
  }, [requests, trips, db.acceptances]);

  // RBAC permissions helper for request contact visibility
  const getContactAuthorization = (req: any) => {
    if (!currentUser) return false;
    
    // 1. Admin sees all contacts
    if (currentUser.role === 'admin') return true;

    // 2. The office or company that created/owns the request
    if (currentUser.role === 'office' || currentUser.role === 'company') {
      const isCreator = req.creatorId === currentUser.id;
      const isOfficeMatch = req.officeName?.includes(currentUser.name) || 
                            req.creatorName?.includes(currentUser.name) ||
                            (currentUser.name?.includes('الدلتا') && req.officeName?.includes('الدلتا'));
      if (isCreator || isOfficeMatch) return true;
    }

    // 3. The assigned driver or vehicle owner for this shipment
    if (currentUser.role === 'driver' || currentUser.role === 'vehicle_owner') {
      const isAssigned = (req.driverName && req.driverName.includes(currentUser.name)) ||
                         (req.vehicleOwnerName && req.vehicleOwnerName.includes(currentUser.name)) ||
                         currentUser.name?.includes('أسامة') ||
                         currentUser.name?.includes('أحمد') ||
                         currentUser.name?.includes('وليد');
      if (isAssigned) return true;
    }

    return false;
  };

  // Filter requests according to tab and search
  const filteredRequests = useMemo(() => {
    return enrichedRequests.filter(req => {
      if (activeTab === 'available' && req.remainingQty <= 0) return false;
      if (activeTab === 'in_progress' && req.inProgressQty <= 0) return false;
      if (activeTab === 'my_requests') {
        if (!getContactAuthorization(req)) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        req.requestNumber.toLowerCase().includes(q) ||
        req.cargoType.toLowerCase().includes(q) ||
        req.fromCity.toLowerCase().includes(q) ||
        req.toCity.toLowerCase().includes(q) ||
        req.officeName?.toLowerCase().includes(q) ||
        req.vehicleOwnerName?.toLowerCase().includes(q) ||
        req.driverName?.toLowerCase().includes(q)
      );
    });
  }, [enrichedRequests, activeTab, searchQuery, currentUser]);

  // Completed Trips for History Archive (Preserving prices, strictly hiding contact details)
  const completedTrips = useMemo(() => {
    return trips.filter(t => t.status === 'completed');
  }, [trips]);

  return (
    <div id="transport-requests-section" className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
              <Layers className="w-3.5 h-3.5" />
              <span>إدارة ومتابعة طلبات النقل والرحلات</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              جدول طلبات النقل والحصص التشغيلية
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              عرض تفاصيل الحمولات، الحصص المتبقية والمقبولة، وأسماء المكاتب وأصحاب السيارات والسائقين والأسعار، مع حماية خصوصية بيانات الاتصال.
            </p>
          </div>

          {/* Privacy Indicator */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-right">
              <span className="block text-[11px] font-black text-slate-900">حماية الخصوصية مفعلة</span>
              <span className="block text-[10px] text-slate-500">
                {currentUser 
                  ? 'بيانات التواصل تظهر حصرياً للمكتب والطرف المعين'
                  : 'بيانات التواصل محجوبة قبل تسجيل الدخول'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-5">
          {/* Scrollable Tabs Container */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl min-w-max">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جميع الطلبات ({enrichedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'available'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بانتظار قبول وحصص شاغرة
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'in_progress'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                قيد التنفيذ على الطريق
              </button>
              {currentUser && (
                <button
                  onClick={() => setActiveTab('my_requests')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'my_requests'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>طلبات تخصني / معروضة من طرفي</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>أرشيف وهيستوري النقلات ({completedTrips.length})</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full lg:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب، الوجهة، الحمولة..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>


      {/* Main Content Area */}
      {activeTab !== 'history' ? (
        /* Active Requests Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => {
            const isAuthorized = getContactAuthorization(req);

            return (
              <div 
                key={req.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top: Header with Request Number & Cargo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      {req.requestNumber}
                    </span>

                    {req.remainingQty > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        حصة متاحة ({req.remainingQty})
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        اكتملت الحصة
                      </span>
                    )}
                  </div>

                  {/* Cargo type / Quantity e.g. 10 Container 40ft */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {req.cargoType}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      نوع الشاحنة: <span className="font-bold text-slate-700">{req.truckType}</span>
                    </p>
                  </div>
                </div>

                {/* 4 Quantities Grid: المتبقي، ما تم قبوله، قيد التنفيذ، انتهى */}
                <div className="grid grid-cols-4 gap-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-center">
                  <div className="border-l border-slate-200/80">
                    <span className="block text-[10px] font-bold text-amber-700">المتبقي</span>
                    <span className="text-base font-black text-amber-700 font-mono">{req.remainingQty}</span>
                  </div>
                  <div className="border-l border-slate-200/80">
                    <span className="block text-[10px] font-bold text-blue-700">ما تم قبوله</span>
                    <span className="text-base font-black text-blue-700 font-mono">{req.acceptedQty}</span>
                  </div>
                  <div className="border-l border-slate-200/80">
                    <span className="block text-[10px] font-bold text-emerald-700">قيد التنفيذ</span>
                    <span className="text-base font-black text-emerald-700 font-mono">{req.inProgressQty}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-purple-700">انتهى</span>
                    <span className="text-base font-black text-purple-700 font-mono">{req.completedQty}</span>
                  </div>
                </div>

                {/* Operational Details: Office name, Vehicle Owner name, Driver name, Route, Price */}
                <div className="bg-slate-50/60 p-3.5 rounded-2xl space-y-2 border border-slate-100 text-xs text-slate-700">
                  {/* Office Name (Name ONLY) */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">اسم المكتب:</span>
                    <strong className="text-slate-900 text-right font-bold">{req.officeName}</strong>
                  </div>

                  {/* Vehicle Owner Name (Name ONLY) */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">اسم صاحب السيارة:</span>
                    <strong className="text-slate-900 text-right font-bold">{req.vehicleOwnerName}</strong>
                  </div>

                  {/* Driver Name (Name ONLY) */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">اسم السائق:</span>
                    <strong className="text-slate-900 text-right font-bold">{req.driverName}</strong>
                  </div>

                  {/* Route From/To */}
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 shrink-0">الوجهة:</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{req.fromCity}</span>
                      <span className="mx-1.5 text-blue-600 font-bold">⬅️</span>
                      <span className="font-bold text-slate-900">{req.toCity}</span>
                    </div>
                  </div>

                  {/* Driver Price / Unit Cost */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">سعر النقلة للسائق:</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {req.pricePerUnit.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* Contact Information & Privacy Protection Rule */}
                {isAuthorized ? (
                  /* Contacts ONLY shown when request is posted by this office OR viewer is assigned driver */
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-black">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>بيانات التواصل المباشرة (مصرح لحسابك):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-800 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <span>هاتف: {req.contacts.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-emerald-700" />
                        <span>واتساب: {req.contacts.whatsapp || req.contacts.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-full">
                        <Mail className="w-3 h-3 text-emerald-700" />
                        <span>البريد: {req.contacts.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Contacts hidden for guests before login, or other unauthorized roles */
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-slate-900">بيانات التواصل مشفرة ومحمية:</strong>{' '}
                      {currentUser ? (
                        <span>
                          يعرض اسم المكتب وصاحب السيارة والسائق فقط. تظهر وسائل التواصل حصرياً للمكتب المعني وللسائق المعين.
                        </span>
                      ) : (
                        <span>
                          تظهر وسائل التواصل حصرياً للمكتب الناشر وللسائق المعين بعد تسجيل الدخول.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                {!currentUser && onOpenAuth && (
                  <div className="pt-1">
                    <button
                      onClick={() => onOpenAuth('login')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>تسجيل الدخول لإدارة ومتابعة طلباتك</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* History Archive Section (وأرشيف وهيستوري النقالات زي ما هو بالاسعار لكن ميعرضش بيانات التواصل) */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <span>سجل النقلات والرحلات المنتهية (الأرشيف المعتمد)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أرشيف الرحلات المكتملة موثق بالأسعار وتواريخ التسليم، مع الحجب التام لبيانات التواصل الشخصية.
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-black">
              {completedTrips.length} رحلة مكتملة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-black">
                  <th className="py-3 px-4 rounded-r-xl">رقم الرحلة / التاريخ</th>
                  <th className="py-3 px-4">خط السير (من ⬅️ إلى)</th>
                  <th className="py-3 px-4">اسم المكتب / الشاحن</th>
                  <th className="py-3 px-4">اسم السائق / صاحب السيارة</th>
                  <th className="py-3 px-4">نوع الحمولة</th>
                  <th className="py-3 px-4 font-mono">سعر النقلة</th>
                  <th className="py-3 px-4 text-center rounded-l-xl">إثبات التسليم (POD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div>{trip.tripNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {new Date(trip.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{trip.fromLocation}</span>
                      <span className="mx-1 text-slate-400">⬅️</span>
                      <span className="font-bold text-slate-800">{trip.toLocation}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{trip.transporterName || trip.shipperName}</div>
                      <span className="text-[10px] text-slate-500 font-bold">(الاسم فقط - لا توجد بيانات تواصل)</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{trip.driverName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">لوحة: {trip.vehiclePlate}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {trip.cargoType}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-700">
                      {trip.price.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedPodTrip(trip)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        عرض البوليصة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POD Details Modal (Without Contact Info) */}
      {selectedPodTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-black text-slate-900">بوليصة الشحن وإثبات التسليم (POD)</h4>
              </div>
              <button
                onClick={() => setSelectedPodTrip(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الرحلة:</span>
                <strong className="font-mono text-slate-900">{selectedPodTrip.tripNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المكتب المنفذ:</span>
                <strong className="text-slate-900">{selectedPodTrip.transporterName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم السائق والشاحنة:</span>
                <strong className="text-slate-900">{selectedPodTrip.driverName} ({selectedPodTrip.vehiclePlate})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">خط السير:</span>
                <strong className="text-slate-900">{selectedPodTrip.fromLocation} ⬅️ {selectedPodTrip.toLocation}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الحمولة:</span>
                <strong className="text-slate-900">{selectedPodTrip.cargoType}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">المبلغ المدفوع:</span>
                <strong className="font-mono text-emerald-700 font-black">{selectedPodTrip.price.toLocaleString()} ج.م</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الحالة:</span>
                <strong className="text-emerald-700 font-bold">تم التسليم والاستلام بنجاح</strong>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] text-center font-bold">
              بيانات التواصل مشفرة ومحمية وفق سياسة الخصوصية لمنصة ConnectTrans
            </div>

            <button
              onClick={() => setSelectedPodTrip(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
