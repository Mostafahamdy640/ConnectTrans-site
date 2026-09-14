import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, Clock, Check, ArrowDownRight, 
  Layers, Phone, Mail, UserCheck, AlertTriangle, Send, 
  MapPin, DollarSign, RefreshCw, ChevronDown
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { TransportRequest, RequestAcceptance } from '../types';

export const RequestLifecycleManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [acceptQuantity, setAcceptQuantity] = useState<number>(1);
  const [acceptorType, setAcceptorType] = useState<'office' | 'vehicle_owner'>('office');
  const [acceptorId, setAcceptorId] = useState<string>('office-delta-transport');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Request Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCargo, setNewCargo] = useState('بضائع تصدير عامة');
  const [newTruck, setNewTruck] = useState('تريلا فرش / سطحة (Flatbed)');
  const [newQty, setNewQty] = useState(3);
  const [newPrice, setNewPrice] = useState(3500);
  const [newFromGov, setNewFromGov] = useState('القاهرة');
  const [newFromCity, setNewFromCity] = useState('العاشر من رمضان');
  const [newToGov, setNewToGov] = useState('الإسكندرية');
  const [newToCity, setNewToCity] = useState('ميناء الإسكندرية');

  const refreshData = () => {
    setDb(ctStorage.getDatabase());
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    ctStorage.createTransportRequest({
      creatorId: 'comp-el-araby-ind',
      creatorType: 'company',
      creatorName: 'مجموعة الصناعات الهندسية والتجارية',
      creatorGovernorate: newFromGov,
      creatorCity: newFromCity,
      requestType: 'marketplace',
      fromGovernorate: newFromGov,
      fromCity: newFromCity,
      toGovernorate: newToGov,
      toCity: newToCity,
      pickupLocation: 'مستودعات الشحن المركزية',
      dropoffLocation: 'منطقة التسليم والموانئ',
      truckType: newTruck,
      cargoType: newCargo,
      weightTons: 25,
      pricePerUnit: newPrice,
      requiredQuantity: Number(newQty),
      contacts: {
        phone: '01011223344',
        email: 'shipping@industries-eg.com',
        whatsapp: '01011223344'
      }
    });
    refreshData();
    setShowNewModal(false);
    setMessage({ text: 'تم إنشاء ونشر طلب النقل بنجاح!', type: 'success' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExecuteAcceptance = (request: TransportRequest) => {
    const acceptorName = acceptorType === 'office' 
      ? db.offices.find(o => o.id === acceptorId)?.officeName || 'مكتب النقل'
      : db.vehicleOwners.find(v => v.id === acceptorId)?.ownerName || 'صاحب السيارة';

    const result = ctStorage.acceptRequest({
      requestId: request.id,
      acceptedByUserId: acceptorId,
      acceptedByUserName: acceptorName,
      acceptedByUserType: acceptorType,
      acceptedQuantity: Number(acceptQuantity),
      acceptorContacts: {
        phone: '01234567891',
        email: 'transporter.contact@connecttrans.eg',
        whatsapp: '01234567891'
      },
      actorRole: acceptorType
    });

    if (result.success) {
      refreshData();
      setSelectedRequest(null);
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
            : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>نظام طلبات النقل والكميات والقبولات التلقائية</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            إدارة الكميات (المطلوبة، المقبولة، المتبقية) مع إغلاق الطلب وتحرير بيانات التواصل عند القبول فقط.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>إضافة طلب نقل جديد</span>
          </button>
          <button
            onClick={refreshData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-white">إضافة طلب نقل جديد</h4>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع البضاعة المنقولة:</label>
                <input
                  type="text"
                  value={newCargo}
                  onChange={(e) => setNewCargo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع الشاحنة:</label>
                  <select
                    value={newTruck}
                    onChange={(e) => setNewTruck(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>تريلا فرش / سطحة (Flatbed)</option>
                    <option>تريلا جوانب وستارة (Curtainsider)</option>
                    <option>سيارة جامبو نقل متوسط (Jumbo)</option>
                    <option>ثلاجة مبردة ومجمدة (Reefer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الكمية المطلوبة (عدد النقلات):</label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعر النقلة الواحدة (ج.م):</label>
                  <input
                    type="number"
                    min="100"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">من (محافظة / مدينة):</label>
                  <input
                    type="text"
                    value={newFromCity}
                    onChange={(e) => setNewFromCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">إلى (محافظة / مدينة):</label>
                <input
                  type="text"
                  value={newToCity}
                  onChange={(e) => setNewToCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  نشر الطلب بالمنظومة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {db.requests.map((req) => {
          const isClosed = req.status === 'closed' || req.remainingQuantity === 0;

          return (
            <div 
              key={req.id} 
              className={`p-5 rounded-3xl border transition-all ${
                isClosed 
                  ? 'bg-slate-900/60 border-slate-800/80 opacity-80' 
                  : 'bg-slate-900 border-slate-700 shadow-md'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-black">{req.requestNumber}</span>
                    <span className="text-white font-black text-sm">{req.cargoType}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">صاحب الطلب: {req.creatorName}</p>
                </div>

                <div>
                  {isClosed ? (
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold border border-slate-700">
                      مكتمل ومغلق (0 متبقي)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/40 animate-pulse">
                      متاح للقبول
                    </span>
                  )}
                </div>
              </div>

              {/* Quantities Metric Badge */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-center mb-4">
                <div className="border-l border-slate-800">
                  <span className="block text-[10px] text-slate-400">الكمية المطلوبة</span>
                  <span className="text-sm font-black text-white font-mono">{req.requiredQuantity}</span>
                </div>
                <div className="border-l border-slate-800">
                  <span className="block text-[10px] text-emerald-400">المقبولة</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">{req.acceptedQuantity}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-amber-400">المتبقية</span>
                  <span className={`text-sm font-black font-mono ${req.remainingQuantity === 0 ? 'text-slate-500' : 'text-amber-400'}`}>
                    {req.remainingQuantity}
                  </span>
                </div>
              </div>

              {/* Route & Pricing details */}
              <div className="space-y-1 text-xs text-slate-300 mb-4 bg-slate-950/40 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-500">مسار النقل:</span>
                  <span className="text-white font-bold">{req.fromCity} ⬅️ {req.toCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع الشاحنة:</span>
                  <span className="text-blue-300">{req.truckType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سعر النقلة:</span>
                  <span className="font-mono text-emerald-400 font-bold">{req.pricePerUnit.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Contacts Policy: Confidential until acceptance */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl mb-4 text-xs">
                <div className="flex items-center gap-2 mb-1 text-slate-400">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">سياسة الأمان والاتصال:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  بيانات التواصل والهاتف مشفرة ومحجوبة ومحمية، ويتم كشفها وإرسالها للطرفين تلقائياً فقط بعد قبول الرحلة.
                </p>
              </div>

              {/* Accept Action */}
              {!isClosed ? (
                <div>
                  {selectedRequest?.id === req.id ? (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-3 animate-fadeIn">
                      <h5 className="text-xs font-black text-amber-400">تأكيد قبول كمية من الطلب:</h5>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">الطرف القابل:</label>
                          <select
                            value={acceptorType}
                            onChange={(e) => {
                              const t = e.target.value as any;
                              setAcceptorType(t);
                              if (t === 'office') setAcceptorId('office-delta-transport');
                              else setAcceptorId('owner-ahmed-mansour');
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                          >
                            <option value="office">مكتب نقل معتمد</option>
                            <option value="vehicle_owner">صاحب شاحنة / سيارة</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">الكمية المقبولة (الحد الأقصى {req.remainingQuantity}):</label>
                          <input
                            type="number"
                            min="1"
                            max={req.remainingQuantity}
                            value={acceptQuantity}
                            onChange={(e) => setAcceptQuantity(Math.min(req.remainingQuantity, Math.max(1, Number(e.target.value))))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExecuteAcceptance(req)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
                        >
                          تأكيد القبول وتحرير بيانات التواصل
                        </button>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setAcceptQuantity(1);
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      قبول حمولة من هذا الطلب (متبقي {req.remainingQuantity})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-2 text-xs font-bold text-slate-500 bg-slate-950/60 rounded-xl">
                  تم استيفاء جميع النقلات المطلوبة وإغلاق الطلب تلقائياً
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Acceptances & Released Contacts Table */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-black text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>سجل القبولات وبيانات التواصل المحررة للطرفين</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">رقم الطلب</th>
                <th className="py-3 px-3">الطرف القابل</th>
                <th className="py-3 px-3">الكمية</th>
                <th className="py-3 px-3">بيانات اتصال المنشئ (المحررة)</th>
                <th className="py-3 px-3">بيانات اتصال القابل (المحررة)</th>
                <th className="py-3 px-3">العمولة</th>
                <th className="py-3 px-3">وقت القبول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {db.acceptances.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-amber-400 font-bold">{acc.requestNumber}</td>
                  <td className="py-3 px-3 text-white font-bold">{acc.acceptedByUserName}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{acc.acceptedQuantity} نقلة</td>
                  <td className="py-3 px-3 text-slate-300">
                    <div className="font-mono text-[11px] text-blue-300">📞 {acc.releasedContacts.creatorContacts.phone}</div>
                    <div className="text-[10px] text-slate-400">✉️ {acc.releasedContacts.creatorContacts.email}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div className="font-mono text-[11px] text-emerald-400">📞 {acc.releasedContacts.acceptorContacts.phone}</div>
                    <div className="text-[10px] text-slate-400">✉️ {acc.releasedContacts.acceptorContacts.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[11px] font-bold">
                      {acc.connectTransCommission === 0 ? '0 ج.م (تجريبي)' : `${acc.connectTransCommission} ج.م`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">
                    {new Date(acc.acceptedAt).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
