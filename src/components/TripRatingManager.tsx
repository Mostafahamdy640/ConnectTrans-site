import React, { useState } from 'react';
import { 
  Truck, Star, CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  MapPin, User, MessageSquare, Send, Check
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { Trip, TripStatus } from '../types';

export const TripRatingManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [ratingModalTrip, setRatingModalTrip] = useState<Trip | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const refreshData = () => {
    setDb(ctStorage.getDatabase());
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

      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>الرحلات والربط بين الأطراف والتقييم بعد الإتمام</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ربط كل رحلة بالشاحنة والناقل والعميل، وإتاحة التقييم فقط فور اكتمال الرحلة بنجاح.
          </p>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {db.trips.map((trip) => {
          const isCompleted = trip.status === 'completed';

          return (
            <div key={trip.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs text-amber-400 font-black">{trip.tripNumber}</span>
                  <h4 className="text-white font-black text-sm mt-0.5">{trip.cargoType}</h4>
                  <p className="text-xs text-slate-400">{trip.fromLocation} ⬅️ {trip.toLocation}</p>
                </div>
                <div>
                  {isCompleted ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/40">
                      مكتملة بنجاح
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/40">
                      قيد التنفيذ ({trip.progressPercent}%)
                    </span>
                  )}
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
                  <span className="text-[10px] text-slate-500 block">الجهة الناقلة:</span>
                  <span className="text-emerald-400 font-bold block">{trip.transporterName}</span>
                  <span className="text-[10px] text-slate-400">{trip.transporterRole === 'vehicle_owner' ? 'صاحب سيارة' : 'مكتب شحن'}</span>
                </div>
              </div>

              {/* Driver & Plate */}
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 px-3 py-2 rounded-xl">
                <span>السائق: <strong className="text-white">{trip.driverName || 'معين بالمنظومة'}</strong></span>
                <span>اللوحة: <strong className="text-amber-300 font-mono">{trip.vehiclePlate || 'ط ع ص ٩١٨٢'}</strong></span>
              </div>

              {/* Controls */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                {!isCompleted ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'in_progress')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      بدء التحرك
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'completed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      إتمام الرحلة والتسليم
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      الرحلة مسجلة كمكتملة
                    </span>
                    <button
                      onClick={() => setRatingModalTrip(trip)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>تقييم التجربة الآن</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ratings History Section */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>سجل التقييمات المعتمدة (بعد إتمام الرحلات فقط)</span>
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
