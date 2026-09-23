import React, { useState } from 'react';
import { 
  Truck, Star, CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  MapPin, User, MessageSquare, Send, Check, Banknote, FileCheck,
  Edit3, Trash2, X, Save, ArrowRight
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { Trip, TripStatus } from '../types';

export const TripRatingManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [ratingModalTrip, setRatingModalTrip] = useState<Trip | null>(null);
  const [editTripModal, setEditTripModal] = useState<Trip | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const refreshData = () => {
    setDb({ ...ctStorage.getDatabase() });
  };

  const handleUpdateStatus = (tripId: string, status: TripStatus) => {
    ctStorage.updateTripStatus(tripId, status, {
      id: 'admin',
      name: 'مدير العمليات ConnectTrans',
      role: 'admin'
    });
    refreshData();
    setNotification(`تم تحديث حالة الرحلة إلى: ${status}`);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Driver Confirms Delivery
  const handleDriverDeliveryConfirm = (tripId: string) => {
    const res = ctStorage.confirmDriverDelivery(tripId, 'تم تأكيد التوصيل وتسليم كامل الأوراق المطلوبة للعميل');
    refreshData();
    setNotification(res.message);
    setTimeout(() => setNotification(null), 4000);
  };

  // 2. Office Verifies Documents
  const handleOfficeVerifyDocs = (tripId: string, verified: boolean) => {
    const res = ctStorage.verifyOfficeDocuments(tripId, verified, 'تمت مطابقة أوراق الاستلام وبوليصة الشحن بنجاح');
    refreshData();
    setNotification(res.message);
    setTimeout(() => setNotification(null), 4000);
  };

  // 3. Office / Admin Authorizes Payout
  const handleAuthorizePayout = (tripId: string) => {
    const res = ctStorage.authorizeTripPayout(tripId, {
      id: 'admin',
      name: 'إدارة الصرف ConnectTrans',
      role: 'admin'
    });
    refreshData();
    setNotification(res.message);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteTrip = (tripId: string, tripNumber: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الرحلة رقم (${tripNumber}) نهائياً؟`)) {
      return;
    }
    ctStorage.deleteTrip(tripId);
    refreshData();
    setNotification(`تم حذف الرحلة (${tripNumber}) بنجاح`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveTripEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTripModal) return;
    ctStorage.updateTripDetails(editTripModal);
    refreshData();
    setEditTripModal(null);
    setNotification('تم حفظ وتعديل بيانات الرحلة بنجاح!');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalTrip) return;

    const res = ctStorage.submitRating({
      tripId: ratingModalTrip.id,
      fromUserId: ratingModalTrip.shipperId,
      fromUserName: ratingModalTrip.shipperName,
      fromUserRole: ratingModalTrip.shipperRole,
      toUserId: ratingModalTrip.transporterId,
      toUserName: ratingModalTrip.transporterName,
      toUserRole: ratingModalTrip.transporterRole,
      rating: stars,
      comment
    });

    if (res.success) {
      refreshData();
      setRatingModalTrip(null);
      setComment('');
      setNotification(res.message);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Header & Delivery-Payout Guarantee Slogan Banner */}
      <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <span>إدارة الرحلات ودورة تسليم الأوراق وتصريح صرف المستحقات</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              متابعة تسليم السائق للأوراق ⬅️ مطابقة وتأكيد المكتب ⬅️ إصدار تصريح الصرف والتحصيل الفوري ⬅️ إتاحة التقييم
            </p>
          </div>

          <div className="px-3.5 py-2 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-right">
            <span className="text-[11px] text-amber-300 font-black block">قاعدة الصرف الصارمة:</span>
            <span className="text-[10px] text-slate-300 font-bold">لا يتم صرف المبلغ إلا بعد تصريح المكتب وتوصيل الأوراق</span>
          </div>
        </div>

        {/* Highlighted Workflow Explanation Box */}
        <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-slate-200 font-bold">
              توجيه السائق وصاحب السيارة: <span className="text-amber-300">أكد التوصيل</span> ⬅️ <span className="text-sky-300">التأكد والاعتماد من المكتب</span> للأوراق المطلوبة ⬅️ <span className="text-emerald-400 font-black underline">تصريح المكتب بالصرف لتحصيل المبلغ المالي</span>
            </span>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {db.trips.map((trip) => {
          const isCompleted = trip.status === 'completed' || trip.officePayoutAuthorized;
          const isDriverConfirmed = trip.driverDeliveryConfirmed;
          const isOfficeVerified = trip.officeVerifiedDocs;
          const isPayoutAuthorized = trip.officePayoutAuthorized;

          return (
            <div key={trip.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-black">{trip.tripNumber}</span>
                    {trip.payoutAmount ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md">
                        مستحق الصرف: {trip.payoutAmount.toLocaleString()} ج.م
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-md">
                        القيمة: {trip.price ? trip.price.toLocaleString() : '3,200'} ج.م
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-black text-sm mt-1">{trip.cargoType}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{trip.fromLocation} ⬅️ {trip.toLocation}</span>
                  </p>
                </div>

                <div>
                  {isPayoutAuthorized ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5" />
                      تم تصريح الصرف
                    </span>
                  ) : isOfficeVerified ? (
                    <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-lg text-xs font-bold border border-sky-500/40">
                      معتمد من المكتب
                    </span>
                  ) : isDriverConfirmed ? (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold border border-amber-500/40">
                      بانتظار تدقيق الأوراق
                    </span>
                  ) : isCompleted ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/40">
                      مكتملة
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/40">
                      جارية ({trip.progressPercent}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery, Office Verification & Payout Pipeline */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-black text-slate-300 block">دورة تسليم الأوراق وتصريح صرف المدفوعات:</span>
                
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {/* Step 1 */}
                  <div className={`p-2 rounded-xl border ${isDriverConfirmed ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="block font-black mb-1">1. تأكيد السائق</span>
                    {isDriverConfirmed ? (
                      <span className="text-[9px] text-emerald-400 font-bold block">✓ تم تأكيد التسليم</span>
                    ) : (
                      <button
                        onClick={() => handleDriverDeliveryConfirm(trip.id)}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded text-[9px] cursor-pointer"
                      >
                        أكّد التوصيل الآن
                      </button>
                    )}
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2 rounded-xl border ${isOfficeVerified ? 'bg-sky-950/40 border-sky-500/50 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="block font-black mb-1">2. أوراق المكتب</span>
                    {isOfficeVerified ? (
                      <span className="text-[9px] text-sky-400 font-bold block">✓ معتمد ومطابق</span>
                    ) : (
                      <button
                        onClick={() => handleOfficeVerifyDocs(trip.id, true)}
                        className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white font-black rounded text-[9px] cursor-pointer"
                      >
                        اعتماد الأوراق
                      </button>
                    )}
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2 rounded-xl border ${isPayoutAuthorized ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="block font-black mb-1">3. تصريح الصرف</span>
                    {isPayoutAuthorized ? (
                      <span className="text-[9px] text-emerald-300 font-black block">✓ تم الصرف المالي</span>
                    ) : (
                      <button
                        onClick={() => handleAuthorizePayout(trip.id)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded text-[9px] cursor-pointer"
                      >
                        تصريح بالصرف
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Parties Linked */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">صاحب الشحنة:</span>
                  <span className="text-white font-bold block">{trip.shipperName}</span>
                  <span className="text-[10px] text-blue-300">({trip.shipperRole === 'company' ? 'شركة / مصنع' : 'مكتب'})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">الجهة الناقلة / صاحب السيارة:</span>
                  <span className="text-emerald-400 font-bold block">{trip.transporterName}</span>
                  <span className="text-[10px] text-slate-400">{trip.transporterRole === 'vehicle_owner' ? 'صاحب سيارة' : 'مكتب شحن'}</span>
                </div>
              </div>

              {/* Driver & Plate */}
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 px-3 py-2 rounded-xl">
                <span>السائق: <strong className="text-white">{trip.driverName || 'معين بالمنظومة'}</strong></span>
                <span>اللوحة: <strong className="text-amber-300 font-mono">{trip.vehiclePlate || 'ط ع ص ٩١٨٢'}</strong></span>
              </div>

              {/* Controls and Edit Actions */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditTripModal({ ...trip })}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل التفاصيل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id, trip.tripNumber)}
                    className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <button
                      onClick={() => setRatingModalTrip(trip)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>تقييم الرحلة</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'in_progress')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      تحديث المسار
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Trip Modal */}
      {editTripModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>تعديل بيانات الرحلة {editTripModal.tripNumber}</span>
              </h4>
              <button onClick={() => setEditTripModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTripEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع الحمولة / البضاعة:</label>
                <input
                  type="text"
                  value={editTripModal.cargoType}
                  onChange={(e) => setEditTripModal({ ...editTripModal, cargoType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">من (محافظة / مدينة):</label>
                  <input
                    type="text"
                    value={editTripModal.fromLocation}
                    onChange={(e) => setEditTripModal({ ...editTripModal, fromLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">إلى (محافظة / مدينة):</label>
                  <input
                    type="text"
                    value={editTripModal.toLocation}
                    onChange={(e) => setEditTripModal({ ...editTripModal, toLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">أجرة الرحلة (ج.م):</label>
                  <input
                    type="number"
                    value={editTripModal.price || 0}
                    onChange={(e) => setEditTripModal({ ...editTripModal, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">العمولة (ج.م):</label>
                  <input
                    type="number"
                    value={editTripModal.commission || 0}
                    onChange={(e) => setEditTripModal({ ...editTripModal, commission: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم السائق:</label>
                  <input
                    type="text"
                    value={editTripModal.driverName || ''}
                    onChange={(e) => setEditTripModal({ ...editTripModal, driverName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">لوحة الشاحنة:</label>
                  <input
                    type="text"
                    value={editTripModal.vehiclePlate || ''}
                    onChange={(e) => setEditTripModal({ ...editTripModal, vehiclePlate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حالة الرحلة:</label>
                  <select
                    value={editTripModal.status}
                    onChange={(e) => setEditTripModal({ ...editTripModal, status: e.target.value as TripStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="pending">معلقة (Pending)</option>
                    <option value="in_progress">قيد التنفيذ (In Progress)</option>
                    <option value="completed">مكتملة (Completed)</option>
                    <option value="cancelled">ملغاة (Cancelled)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نسبة الإنجاز %:</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editTripModal.progressPercent || 0}
                    onChange={(e) => setEditTripModal({ ...editTripModal, progressPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditTripModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ratings History Section */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>سجل التقييمات المعتمدة (بعد إتمام الرحلات وتصريح الصرف فقط)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.ratings.map((rate) => (
            <div key={rate.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold">{rate.tripNumber}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < rate.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-300 italic">"{rate.comment}"</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                <span>من: {rate.fromUserName}</span>
                <span>إلى: {rate.toUserName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModalTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-white">تقييم الرحلة {ratingModalTrip.tripNumber}</h4>
              <button onClick={() => setRatingModalTrip(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
              <div className="text-center space-y-2">
                <label className="block text-slate-300 font-bold">اختر التقييم بالنجوم:</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setStars(starVal)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star 
                        className={`w-8 h-8 ${starVal <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الملاحظات والتعليق:</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="اكتب انطباعك عن دقة المواعيد، حالة الشاحنة، وسرعة التسليم..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-md"
                >
                  تسجيل التقييم رسمياً
                </button>
                <button
                  type="button"
                  onClick={() => setRatingModalTrip(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
