import React, { useState } from 'react';
import { 
  Building2, Briefcase, Truck, CheckCircle2, AlertTriangle, 
  Layers, Phone, Mail, UserCheck, Send, MapPin, DollarSign, 
  RefreshCw, ChevronDown, Check, ArrowRight, ShieldCheck, 
  Clock, Award, Star, MessageSquare, Plus, FileText, CheckCircle
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { TransportRequest, TransportOfficeOffer, RequestAcceptance, Trip } from '../types';

export const ConnectTransWorkflowManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'flow' | 'companies' | 'offices' | 'vehicle_owners' | 'trips_ratings'>('flow');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 1. Company Cooperation Request Form State
  const [compName, setCompName] = useState('');
  const [compPerson, setCompPerson] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compGov, setCompGov] = useState('السويس');
  const [compCity, setCompCity] = useState('العين السخنة');
  const [compVolume, setCompVolume] = useState<number>(400);
  const [compCoopType, setCompCoopType] = useState<'long_term_contract' | 'dedicated_fleet' | 'spot_shipments' | 'factory_integration'>('long_term_contract');
  const [compNotes, setCompNotes] = useState('');

  // 2. Transport Office Offer Form State
  const [selectedReqForOffer, setSelectedReqForOffer] = useState<TransportRequest | null>(null);
  const [offerOfficeId, setOfferOfficeId] = useState<string>('office-delta-transport');
  const [offerPrice, setOfferPrice] = useState<number>(3700);
  const [offerAvailableQty, setOfferAvailableQty] = useState<number>(3);
  const [offerTruckType, setOfferTruckType] = useState<string>('تريلا فرش / سطحة مع أحزمة تثبيت');
  const [offerNotes, setOfferNotes] = useState<string>('جاهزية فورية مع تتبع مسار وتأمين شامل');

  // 3. Vehicle Owner Acceptance State
  const [selectedOfferForAccept, setSelectedOfferForAccept] = useState<TransportOfficeOffer | null>(null);
  const [ownerId, setOwnerId] = useState<string>('owner-ahmed-mansour');
  const [ownerAcceptQty, setOwnerAcceptQty] = useState<number>(1);
  const [driverName, setDriverName] = useState<string>('أسامة فؤاد السقا');
  const [driverPhone, setDriverPhone] = useState<string>('01511224466');
  const [vehiclePlate, setVehiclePlate] = useState<string>('ط ع ص ٩١٨٢');

  // 4. Rating State
  const [selectedTripForRating, setSelectedTripForRating] = useState<Trip | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('خدمة ممتازة، التزام تام بمواعيد الشحن والتفريغ وسلامة البضائع.');

  const refreshData = () => {
    setDb(ctStorage.getDatabase());
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handler: Company direct inquiry / cooperation
  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compPhone) {
      showMsg('يرجى ملء اسم الشركة ورقم الهاتف للتواصل', 'error');
      return;
    }

    ctStorage.submitCompanyInquiry({
      companyName: compName,
      contactPerson: compPerson || 'مسؤول اللوجستيات',
      phone: compPhone,
      email: compEmail || `${compPhone}@company-eg.com`,
      governorate: compGov,
      city: compCity,
      monthlyCargoVolumeTons: Number(compVolume) || 100,
      truckTypesNeeded: ['تريلا فرش / سطحة (Flatbed)', 'جامبو مقفلة'],
      cooperationType: compCoopType,
      notes: compNotes || 'طلب شراكة وتنسيق نقل مباشر'
    });

    refreshData();
    setCompName('');
    setCompPerson('');
    setCompPhone('');
    setCompEmail('');
    setCompNotes('');
    showMsg('تم تسجيل طلب تعاون الشركة بنجاح والتواصل المباشر مع إدارة ConnectTrans!', 'success');
  };

  // Handler: Transport Office submits offer
  const handleOfficeOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForOffer) return;

    const office = db.offices.find(o => o.id === offerOfficeId) || db.offices[0];

    const result = ctStorage.submitOfficeOffer({
      requestId: selectedReqForOffer.id,
      officeId: office.id,
      officeName: office.officeName,
      officeCity: office.city,
      offeredPricePerUnit: Number(offerPrice),
      availableQuantity: Number(offerAvailableQty),
      truckTypesAvailable: offerTruckType,
      notes: offerNotes,
      officeContacts: {
        phone: office.contacts.phone,
        email: office.contacts.email,
        whatsapp: office.contacts.whatsapp
      }
    });

    if (result.success) {
      refreshData();
      setSelectedReqForOffer(null);
      showMsg(result.message, 'success');
    } else {
      showMsg(result.message, 'error');
    }
  };

  // Handler: Vehicle owner accepts office offer
  const handleOwnerAcceptOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferForAccept) return;

    const owner = db.vehicleOwners.find(v => v.id === ownerId) || db.vehicleOwners[0];

    const result = ctStorage.acceptOfficeOfferByVehicleOwner({
      offerId: selectedOfferForAccept.id,
      vehicleOwnerId: owner.id,
      vehicleOwnerName: owner.ownerName,
      acceptedQuantity: Number(ownerAcceptQty),
      driverName,
      driverPhone,
      vehiclePlate,
      ownerContacts: {
        phone: owner.contacts.phone,
        email: owner.contacts.email,
        whatsapp: owner.contacts.whatsapp
      }
    });

    if (result.success) {
      refreshData();
      setSelectedOfferForAccept(null);
      showMsg(result.message, 'success');
    } else {
      showMsg(result.message, 'error');
    }
  };

  // Handler: Complete Trip
  const handleCompleteTrip = (tripId: string) => {
    const success = ctStorage.updateTripStatus(tripId, 'completed', {
      id: 'admin',
      name: 'إدارة العمليات ConnectTrans',
      role: 'admin'
    }, 'تم تأكيد التفريغ واستلام بوليصة الشحن بنجاح');

    if (success) {
      refreshData();
      showMsg('تم إتمام الرحلة بنجاح! تم تفعيل إمكانية التقييم للطرفين وتسجيل العملية بالسجل.', 'success');
    }
  };

  // Handler: Submit Rating
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForRating) return;

    const result = ctStorage.submitRating({
      tripId: selectedTripForRating.id,
      fromUserId: selectedTripForRating.shipperId,
      fromUserName: selectedTripForRating.shipperName,
      fromUserRole: selectedTripForRating.shipperRole as any,
      toUserId: selectedTripForRating.transporterId,
      toUserName: selectedTripForRating.transporterName,
      toUserRole: selectedTripForRating.transporterRole as any,
      rating: ratingStars,
      comment: ratingComment
    });

    if (result.success) {
      refreshData();
      setSelectedTripForRating(null);
      showMsg(result.message, 'success');
    } else {
      showMsg(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-lg ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
            : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-xs sm:text-sm font-bold">{notification.text}</span>
        </div>
      )}

      {/* Main Workflow Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl border border-blue-900/60 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full shadow-xs">
                ConnectTrans Core Workflow
              </span>
              <span className="text-xs text-blue-300 font-mono">دورة نقل متكاملة 100%</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              منظومة التعاون بين الشركات، مكاتب النقل، وأصحاب السيارات
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              تسجيل بيانات الشركات والتواصل مباشرة مع ConnectTrans ⬅️ مكاتب النقل تستقبل الطلبات وتقدم العروض بالسعر والكمية ⬅️ أصحاب السيارات يطلعون ويقبلون العرض ⬅️ إنشاء الرحلة وتحديث المتبقي وفتح بيانات التواصل فوراً ⬅️ إتمام الرحلة والتقييم وتسجيل العمليات.
            </p>
          </div>

          <button
            onClick={refreshData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث البيانات الحية</span>
          </button>
        </div>

        {/* 4 Interactive Flow Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveWorkflowTab('flow')}
            className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeWorkflowTab === 'flow' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>نظرة عامة على الدورة</span>
          </button>

          <button
            onClick={() => setActiveWorkflowTab('companies')}
            className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeWorkflowTab === 'companies' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. الشركات والتعاون</span>
          </button>

          <button
            onClick={() => setActiveWorkflowTab('offices')}
            className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeWorkflowTab === 'offices' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. عروض مكاتب النقل</span>
          </button>

          <button
            onClick={() => setActiveWorkflowTab('vehicle_owners')}
            className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeWorkflowTab === 'vehicle_owners' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. قبول أصحاب السيارات</span>
          </button>

          <button
            onClick={() => setActiveWorkflowTab('trips_ratings')}
            className={`p-3 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer col-span-2 md:col-span-1 ${
              activeWorkflowTab === 'trips_ratings' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>4. الرحلات والتقييمات</span>
          </button>
        </div>
      </div>

      {/* ================= STAGE 0: VISUAL FLOW OVERVIEW ================= */}
      {activeWorkflowTab === 'flow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-black flex items-center justify-center text-sm border border-emerald-500/30">
                1
              </div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>الشركات والمصانع</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تسجيل بيانات الشركة، طلب التعاون المباشر مع ConnectTrans، وطرح طلبات النقل بالكمية المحددة.
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {db.companyInquiries.length} طلب تعاون مسجل
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-mono font-black flex items-center justify-center text-sm border border-amber-500/30">
                2
              </div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>مكاتب النقل</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تستقبل طلبات النقل الواردة، وتقدم عروضها التنافسية متضمنة السعر المقترح والكمية المتاحة لديها.
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {db.officeOffers.length} عرض مكتب متاح
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-black flex items-center justify-center text-sm border border-cyan-500/30">
                3
              </div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>أصحاب السيارات</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يطلعون على عروض المكاتب ويقبلون العرض المناسب حسب الكمية والمسار، مع إنشاء الرحلة وتحديث المتبقي.
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  {db.acceptances.length} قبول تم بنجاح
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-mono font-black flex items-center justify-center text-sm border border-purple-500/30">
                4
              </div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>التواصل والتقييمات</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                كشف بيانات التواصل لكافة الأطراف فور القبول، إتمام الرحلة، تقييم الأطراف، وتسجيل كافة العمليات.
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-purple-400 font-bold">
                  {db.trips.length} رحلة و {db.ratings.length} تقييم
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="block text-xs text-slate-400 mb-1">الشركات المعتمدة</span>
              <span className="text-xl font-black text-white font-mono">{db.companies.length}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="block text-xs text-slate-400 mb-1">مكاتب النقل المعتمدة</span>
              <span className="text-xl font-black text-amber-400 font-mono">{db.offices.length}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="block text-xs text-slate-400 mb-1">أصحاب السيارات والمركبات</span>
              <span className="text-xl font-black text-cyan-400 font-mono">{db.vehicleOwners.length} ({db.vehicles.length} شاحنة)</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="block text-xs text-slate-400 mb-1">طلبات النقل الجارية</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{db.requests.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 1: COMPANIES & DIRECT INQUIRIES ================= */}
      {activeWorkflowTab === 'companies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Cooperation Form */}
          <div className="lg:col-span-1 bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>تسجيل شركة وطلب تعاون مباشر</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تواصل مباشر مع إدارة ConnectTrans لعقود النقل واللوجستيات
              </p>
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الشركة / المصنع:</label>
                <input
                  type="text"
                  placeholder="مثال: شركة النيل للتصنيع الغذائي"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المسؤول / صفة الاتصال:</label>
                <input
                  type="text"
                  placeholder="مثال: م/ أيمن حسني (مدير اللوجستيات)"
                  value={compPerson}
                  onChange={(e) => setCompPerson(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف / واتساب:</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    placeholder="logistics@company.eg"
                    value={compEmail}
                    onChange={(e) => setCompEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                  <select
                    value={compGov}
                    onChange={(e) => setCompGov(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>القاهرة</option>
                    <option>الجيزة</option>
                    <option>الإسكندرية</option>
                    <option>السويس</option>
                    <option>الشرقية</option>
                    <option>المنوفية</option>
                    <option>بورسعيد</option>
                    <option>الدقهلية</option>
                    <option>أسيوط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المدينة / المنطقة:</label>
                  <input
                    type="text"
                    value={compCity}
                    onChange={(e) => setCompCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع التعاون المطلوب:</label>
                <select
                  value={compCoopType}
                  onChange={(e) => setCompCoopType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="long_term_contract">عقد تعاون وشحن سنوي / دوري</option>
                  <option value="dedicated_fleet">تخصيص أسطول شاحنات مكرس لمصانعنا</option>
                  <option value="spot_shipments">شحنات فورية حسب الطلب (Spot Shipments)</option>
                  <option value="factory_integration">ربط لوجستي كامل مع مستودعات وموانئ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ملاحظات واحتياجات الشحن:</label>
                <textarea
                  rows={2}
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  placeholder="عدد الشاحنات الشهرية المتوقعة، نوع البضاعة..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال طلب التعاون والتواصل المباشر</span>
              </button>
            </form>
          </div>

          {/* Registered Company Requests List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <h3 className="text-base font-black text-white mb-3 flex items-center justify-between">
                <span>طلبات التعاون المباشرة للشركات ({db.companyInquiries.length})</span>
                <span className="text-xs text-slate-400 font-mono">ConnectTrans Direct</span>
              </h3>

              <div className="space-y-3">
                {db.companyInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{inq.companyName}</h4>
                        <span className="text-xs text-slate-400">
                          المسؤول: {inq.contactPerson} — 📍 {inq.city} ({inq.governorate})
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
                        {inq.status === 'new' ? 'طلب جديد مباشر' : 'تم التواصل'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-500">نوع الشراكة:</span>{' '}
                        <span className="font-bold text-blue-400">
                          {inq.cooperationType === 'long_term_contract' ? 'عقد طويل الأجل' :
                           inq.cooperationType === 'dedicated_fleet' ? 'أسطول مخصص' : 'شحنات فورية'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">الحجم الشهري التقديري:</span>{' '}
                        <span className="font-bold text-amber-400 font-mono">{inq.monthlyCargoVolumeTons || 300} طن</span>
                      </div>
                    </div>

                    {inq.notes && (
                      <p className="text-xs text-slate-400 italic">
                        "{inq.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-500 font-mono">
                        {new Date(inq.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-mono font-bold">📞 {inq.phone}</span>
                        <span className="text-slate-400 font-mono">{inq.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Shippers / Companies list */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <h4 className="text-sm font-black text-white mb-3">الشركات الصناعية المعتمدة بالمنظومة ({db.companies.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {db.companies.map((comp) => (
                  <div key={comp.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                    <div className="font-bold text-white">{comp.displayName}</div>
                    <div className="text-slate-400 text-[11px]">📍 {comp.city} ({comp.governorate})</div>
                    <div className="text-slate-400 text-[11px]">مسؤول الاتصال: {comp.contactPerson}</div>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 font-mono">
                      <span>س.ت: {comp.commercialRegister}</span>
                      <span className="text-emerald-400 font-bold">معتمد وجاهز</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 2: TRANSPORT OFFICES SUBMIT OFFERS ================= */}
      {activeWorkflowTab === 'offices' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <span>طلبات النقل المعروضة لتقديم عروض مكاتب النقل</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يقوم مكتب النقل بتقديم عرضه بالسعر المناسب والكمية المتوفرة لديه لكل طلب نقل
                </p>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 font-bold">
                عروض مكاتب الشحن
              </span>
            </div>

            {/* Requests for offices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {db.requests.map((req) => {
                const isClosed = req.status === 'closed' || req.remainingQuantity <= 0;
                const offersOnThis = db.officeOffers.filter(o => o.requestId === req.id);

                return (
                  <div key={req.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-amber-400 font-bold">{req.requestNumber}</span>
                        <h4 className="text-sm font-black text-white mt-0.5">{req.cargoType}</h4>
                        <span className="text-xs text-slate-400">الشركة: {req.creatorName}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                        isClosed ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {isClosed ? 'مغلق' : `متبقي ${req.remainingQuantity} من ${req.requiredQuantity}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-500">مسار الشحن:</span>
                        <div className="font-bold text-white">{req.fromCity} ⬅️ {req.toCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">السعر المبدئي:</span>
                        <div className="font-bold text-emerald-400 font-mono">{req.pricePerUnit.toLocaleString()} ج.م / نقلة</div>
                      </div>
                    </div>

                    {/* Existing offers on this request */}
                    {offersOnThis.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] text-amber-400 font-bold block">
                          العروض المقدمة من المكاتب ({offersOnThis.length}):
                        </span>
                        {offersOnThis.map(off => (
                          <div key={off.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white">{off.officeName}</span>
                              <span className="text-slate-400 block text-[10px]">
                                سعر العرض: <strong className="text-emerald-400 font-mono">{off.offeredPricePerUnit} ج.م</strong> | متاح: <strong className="text-amber-400 font-mono">{off.remainingQuantity} نقلة</strong>
                              </span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold">
                              {off.status === 'active' ? 'نشط' : off.status === 'exhausted' ? 'مستوفى' : 'مقبول جزئياً'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isClosed && (
                      <div>
                        {selectedReqForOffer?.id === req.id ? (
                          <form onSubmit={handleOfficeOfferSubmit} className="p-3 bg-slate-900 rounded-xl border border-amber-500/40 space-y-2 text-xs animate-fadeIn">
                            <h5 className="font-bold text-amber-400">تقديم عرض مكتب النقل على {req.requestNumber}:</h5>
                            
                            <div>
                              <label className="block text-slate-400 mb-1">المكتب مقدم العرض:</label>
                              <select
                                value={offerOfficeId}
                                onChange={(e) => setOfferOfficeId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                              >
                                {db.offices.map(o => (
                                  <option key={o.id} value={o.id}>{o.officeName} - {o.city}</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-slate-400 mb-1">سعر النقلة المقترح (ج.م):</label>
                                <input
                                  type="number"
                                  min="500"
                                  value={offerPrice}
                                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-slate-400 mb-1">الكمية المتاحة لدينا (نقلات):</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={req.remainingQuantity}
                                  value={offerAvailableQty}
                                  onChange={(e) => setOfferAvailableQty(Number(e.target.value))}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-400 mb-1">مواصفات الشاحنات / ملاحظات:</label>
                              <input
                                type="text"
                                value={offerTruckType}
                                onChange={(e) => setOfferTruckType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg cursor-pointer shadow-md"
                              >
                                نشر العرض لأصحاب الشاحنات
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedReqForOffer(null)}
                                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReqForOffer(req);
                              setOfferPrice(req.pricePerUnit);
                              setOfferAvailableQty(Math.min(3, req.remainingQuantity));
                            }}
                            className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl border border-amber-500/40 cursor-pointer text-xs transition-colors"
                          >
                            + تقديم عرض سعر وكمية من مكتب نقل
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 3: VEHICLE OWNERS VIEW & ACCEPT OFFERS ================= */}
      {activeWorkflowTab === 'vehicle_owners' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <span>عروض مكاتب النقل المتاحة لأصحاب السيارات</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  أصحاب السيارات يطلعون على العروض ويقبلون العرض المناسب حسب الكمية والمسار
                </p>
              </div>
              <span className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 font-bold">
                حجز وقبول أصحاب الشاحنات
              </span>
            </div>

            {/* Active Offers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {db.officeOffers.map((offer) => {
                const req = db.requests.find(r => r.id === offer.requestId);
                const isExhausted = offer.remainingQuantity <= 0 || offer.status === 'exhausted';

                return (
                  <div key={offer.id} className={`p-5 rounded-3xl border ${
                    isExhausted ? 'bg-slate-950/60 border-slate-800/80 opacity-70' : 'bg-slate-950 border-cyan-500/30 shadow-md'
                  } space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400 font-bold">{offer.requestNumber}</span>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                            عرض مكتب معتمد
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white mt-1">{offer.officeName}</h4>
                        <span className="text-xs text-slate-400">📍 {offer.officeCity}</span>
                      </div>

                      <div className="text-left">
                        <span className="text-base font-black text-emerald-400 font-mono block">
                          {offer.offeredPricePerUnit.toLocaleString()} ج.م
                        </span>
                        <span className="text-[10px] text-slate-400">لكل نقلة</span>
                      </div>
                    </div>

                    {req && (
                      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">البضاعة:</span>
                          <span className="text-white font-bold">{req.cargoType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">خط السير:</span>
                          <span className="text-blue-300 font-bold">{req.fromCity} ⬅️ {req.toCity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">مواصفات الشاحنة:</span>
                          <span className="text-cyan-300">{offer.truckTypesAvailable}</span>
                        </div>
                      </div>
                    )}

                    {/* Quantity badges */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 text-center text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400">كمية العرض الأصلية</span>
                        <span className="font-mono font-bold text-white">{offer.availableQuantity}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-emerald-400">تم قبولها</span>
                        <span className="font-mono font-bold text-emerald-400">{offer.acceptedQuantity}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-amber-400">المتبقي للحجز</span>
                        <span className={`font-mono font-bold ${isExhausted ? 'text-slate-500' : 'text-amber-400'}`}>
                          {offer.remainingQuantity}
                        </span>
                      </div>
                    </div>

                    {offer.notes && (
                      <p className="text-xs text-slate-400 italic">
                        "{offer.notes}"
                      </p>
                    )}

                    {/* Accept Offer Action */}
                    {!isExhausted ? (
                      <div>
                        {selectedOfferForAccept?.id === offer.id ? (
                          <form onSubmit={handleOwnerAcceptOffer} className="p-3 bg-slate-900 rounded-xl border border-cyan-500/50 space-y-3 text-xs animate-fadeIn">
                            <h5 className="font-bold text-cyan-400">تأكيد قبول عرض مكتب {offer.officeName}:</h5>

                            <div>
                              <label className="block text-slate-400 mb-1">صاحب السيارة / الأسطول القابل:</label>
                              <select
                                value={ownerId}
                                onChange={(e) => setOwnerId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                              >
                                {db.vehicleOwners.map(v => (
                                  <option key={v.id} value={v.id}>{v.ownerName} ({v.city})</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-slate-400 mb-1">الكمية المقبولة (الحد الأقصى {offer.remainingQuantity}):</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={offer.remainingQuantity}
                                  value={ownerAcceptQty}
                                  onChange={(e) => setOwnerAcceptQty(Math.min(offer.remainingQuantity, Math.max(1, Number(e.target.value))))}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-slate-400 mb-1">رقم لوحة الشاحنة:</label>
                                <input
                                  type="text"
                                  value={vehiclePlate}
                                  onChange={(e) => setVehiclePlate(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-slate-400 mb-1">اسم السائق المعين:</label>
                                <input
                                  type="text"
                                  value={driverName}
                                  onChange={(e) => setDriverName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-slate-400 mb-1">هاتف السائق:</label>
                                <input
                                  type="text"
                                  value={driverPhone}
                                  onChange={(e) => setDriverPhone(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                                  required
                                />
                              </div>
                            </div>

                            <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-lg text-[11px] text-blue-300">
                              ⚡ فور تأكيد القبول سيتم: إنشاء أمر الرحلة، تحديث الكميات المتبقية تلقائياً، وفتح بيانات التواصل الكاملة للأطراف الثلاثة (الشركة، مكتب النقل، وصاحب السيارة).
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="submit"
                                className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg cursor-pointer shadow-md"
                              >
                                تأكيد القبول وإنشاء الرحلة وفتح التواصل
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedOfferForAccept(null)}
                                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOfferForAccept(offer);
                              setOwnerAcceptQty(1);
                            }}
                            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-md transition-all"
                          >
                            قبول هذا العرض حسب الكمية المتاحة (متبقي {offer.remainingQuantity})
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs font-bold text-slate-500 bg-slate-900 rounded-xl">
                        تم قبول كامل كمية هذا العرض بالكامل
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 4: TRIPS, CONTACT RELEASE & RATINGS ================= */}
      {activeWorkflowTab === 'trips_ratings' && (
        <div className="space-y-6">
          {/* Active / Created Trips */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <span>الرحلات المنشأة بعد القبول وتحديث الكميات ({db.trips.length})</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">ConnectTrans Trips & Ratings</span>
            </h3>

            <div className="space-y-4">
              {db.trips.map((trip) => {
                const isCompleted = trip.status === 'completed';

                return (
                  <div key={trip.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400 font-black">{trip.tripNumber}</span>
                          <span className="text-white font-black text-sm">{trip.cargoType}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          الشركة الشاحنة: <strong className="text-white">{trip.shipperName}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isCompleted 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                        }`}>
                          {isCompleted ? 'تمت الرحلة بنجاح ✅' : 'جارية قيد التنفيذ 🚚'}
                        </span>
                      </div>
                    </div>

                    {/* Parties and Contacts (Disclosed post-acceptance) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-500 block">الشركة الشاحنة:</span>
                        <span className="font-bold text-white block">{trip.shipperName}</span>
                        <span className="font-mono text-emerald-400 text-[11px]">📞 01122334455</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">مكتب النقل الوسيط:</span>
                        <span className="font-bold text-amber-300 block">{trip.intermediaryOfficeName || 'مكتب معتمد'}</span>
                        <span className="font-mono text-amber-400 text-[11px]">📞 01234567891</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">الناقل / السائق:</span>
                        <span className="font-bold text-cyan-300 block">{trip.transporterName}</span>
                        <span className="font-mono text-cyan-400 text-[11px]">
                          السائق: {trip.driverName} ({trip.vehiclePlate})
                        </span>
                      </div>
                    </div>

                    {/* Route & Pricing */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500">مسار الرحلة:</span>{' '}
                        <span className="font-bold text-white">{trip.fromLocation} ⬅️ {trip.toLocation}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono">
                        <span>إجمالي القيمة: <strong className="text-emerald-400">{trip.price.toLocaleString()} ج.م</strong></span>
                        <span>العمولة: <strong className="text-amber-400">{trip.commission === 0 ? '0 ج.م (فترة تجريبية)' : `${trip.commission} ج.م`}</strong></span>
                      </div>
                    </div>

                    {/* Actions: Complete & Rate */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                      {!isCompleted ? (
                        <button
                          onClick={() => handleCompleteTrip(trip.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-md flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>إتمام وتفريغ الرحلة وتأكيد الوصول</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-purple-300 font-bold">تم إتمام الرحلة بالكامل</span>
                          {(!trip.ratedByShipper || !trip.ratedByTransporter) && (
                            <button
                              onClick={() => {
                                setSelectedTripForRating(trip);
                                setRatingStars(5);
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>تقييم الرحلة والطرف الآخر</span>
                            </button>
                          )}
                        </div>
                      )}

                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(trip.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    {/* Rating Modal for this trip */}
                    {selectedTripForRating?.id === trip.id && (
                      <form onSubmit={handleRatingSubmit} className="p-4 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-3 text-xs animate-fadeIn">
                        <h5 className="font-bold text-amber-400">تقييم الرحلة {trip.tripNumber}:</h5>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-bold">التقييم بالنجوم:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingStars(star)}
                                className={`text-lg cursor-pointer ${star <= ratingStars ? 'text-amber-400' : 'text-slate-600'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <span className="text-amber-400 font-mono font-bold">({ratingStars} من 5)</span>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">تعليق التقييم والملاحظات:</label>
                          <textarea
                            rows={2}
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white resize-none"
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-md"
                          >
                            إرسال وتوثيق التقييم
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedTripForRating(null)}
                            className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Ratings Table */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>سجل التقييمات المعتمدة بعد إتمام الرحلات ({db.ratings.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {db.ratings.map((rate) => (
                <div key={rate.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-bold">{rate.tripNumber}</span>
                    <span className="text-amber-400 font-bold">{'★'.repeat(rate.rating)}{'☆'.repeat(5 - rate.rating)}</span>
                  </div>
                  <div className="text-slate-300 font-bold">
                    من: {rate.fromUserName} ⬅️ إلى: {rate.toUserName}
                  </div>
                  <p className="text-slate-400 text-[11px] italic bg-slate-900/60 p-2 rounded-lg">
                    "{rate.comment}"
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    {new Date(rate.createdAt).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>سجل العمليات والتدقيق الشامل (Audit Trail)</span>
            </h4>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 text-xs">
              {db.auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
                  <div>
                    <span className="font-bold text-amber-400">[{log.action}]</span>{' '}
                    <span className="text-white font-bold">{log.actorName}</span>{' '}
                    <span className="text-slate-400">({log.actorRole}):</span>{' '}
                    <span className="text-slate-300">{log.newValue || log.oldValue || 'تعديل بالمنظومة'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 mr-2">
                    {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
