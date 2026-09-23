import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, Clock, Check, ArrowDownRight, 
  Layers, Phone, Mail, UserCheck, AlertTriangle, Send, 
  MapPin, DollarSign, RefreshCw, ChevronDown, Lock, Eye, Building2, ShieldCheck,
  Edit3, Trash2, X, Save
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { TransportRequest, RequestAcceptance, UserAccount } from '../types';

interface RequestLifecycleManagerProps {
  currentUser?: UserAccount | null;
}

export const RequestLifecycleManager: React.FC<RequestLifecycleManagerProps> = ({ currentUser }) => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [editRequestModal, setEditRequestModal] = useState<TransportRequest | null>(null);
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
    setDb({ ...ctStorage.getDatabase() });
  };

  const handleDeleteRequest = (reqId: string, reqNumber: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف طلب النقل (${reqNumber}) نهائياً؟`)) return;
    ctStorage.deleteTransportRequest(reqId);
    refreshData();
    setMessage({ text: `تم حذف طلب النقل (${reqNumber}) بنجاح`, type: 'success' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleToggleRequestStatus = (req: TransportRequest) => {
    const newStatus = req.status === 'closed' ? 'open' : 'closed';
    const updated = {
      ...req,
      status: newStatus as any,
      remainingQuantity: newStatus === 'closed' ? 0 : Math.max(1, req.requiredQuantity - (req.acceptedQuantity || 0))
    };
    ctStorage.updateTransportRequestDetails(updated);
    refreshData();
    setMessage({ text: `تم تغيير حالة الطلب إلى [${newStatus === 'closed' ? 'مغلق' : 'مفتوح'}] بنجاح`, type: 'success' });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSaveRequestEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRequestModal) return;
    ctStorage.updateTransportRequestDetails(editRequestModal);
    refreshData();
    setEditRequestModal(null);
    setMessage({ text: 'تم حفظ وتحديث تفاصيل طلب النقل بنجاح!', type: 'success' });
    setTimeout(() => setMessage(null), 4000);
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

      {/* Company Dedicated Notice Banner */}
      {currentUser?.role === 'company' && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-3xl p-5 text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>تنبيه للشركات والمصانع (قراءة ومتابعة فقط)</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/30 text-emerald-300">Read-Only</span>
              </h4>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                استعراض الطلبات والرحلات هو للقراءة والمتابعة فقط. للتعاقد وطلب شحنات جديدة، تقتصر وسائل الاتصال حصرياً على إدارة منصة ConnectTrans:
                <strong className="text-amber-300 mr-1.5 font-mono">هاتف 01001234567</strong> | 
                <strong className="text-amber-300 mx-1 font-mono">واتساب 01001234567</strong> | 
                <strong className="text-amber-300 mx-1 font-mono">admin@connecttrans.eg</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {db.requests.map((req) => {
          const isClosed = req.status === 'closed' || req.remainingQuantity === 0;

          // Compute 4 core lifecycle metrics
          const remainingQty = req.remainingQuantity;
          const acceptedQty = req.acceptedQuantity;
          const inProgressQty = req.inProgressQuantity ?? Math.max(0, req.acceptedQuantity - (req.completedQuantity || 0));
          const completedQty = req.completedQuantity ?? 0;

          // Strict Role-Based Access Control (RBAC) Logic:
          // Admin: full access
          // Office: full access ONLY IF it is their own request (otherwise read-only, office name only)
          // Driver/Owner: full access ONLY IF assigned to their vehicle (otherwise read-only, office name only)
          // Company: strictly read-only, office name only
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
          const isCompany = currentUser?.role === 'company';
          const displayOfficeName = req.officeName || req.creatorName;

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
                  
                  {/* Office Name Only (Confidential Contact Protection) */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-300">
                      <strong className="text-amber-400">اسم المكتب فقط:</strong> {displayOfficeName}
                    </span>
                    {!isFullyAuthorized && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        قراءة فقط
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {isClosed ? (
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold border border-slate-700">
                      مكتمل ومغلق (0 متبقي)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/40 animate-pulse">
                      متاح للطلب
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Quantities Metric Grid: المتبقي، ما تم قبوله، قيد التنفيذ، انتهى */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-center mb-4">
                <div className="border-l border-slate-800">
                  <span className="block text-[10px] text-amber-400 font-bold">المتبقي</span>
                  <span className="text-sm font-black text-amber-300 font-mono">{remainingQty}</span>
                </div>
                <div className="border-l border-slate-800">
                  <span className="block text-[10px] text-blue-400 font-bold">ما تم قبوله</span>
                  <span className="text-sm font-black text-blue-300 font-mono">{acceptedQty}</span>
                </div>
                <div className="border-l border-slate-800">
                  <span className="block text-[10px] text-emerald-400 font-bold">قيد التنفيذ</span>
                  <span className="text-sm font-black text-emerald-300 font-mono">{inProgressQty}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-purple-400 font-bold">انتهى</span>
                  <span className="text-sm font-black text-purple-300 font-mono">{completedQty}</span>
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

              {/* Contacts Policy Display according to RBAC */}
              {isFullyAuthorized ? (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl mb-4 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>بيانات التواصل الكاملة (مصرح لك):</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-300">
                    <span>📞 {req.contacts.phone}</span>
                    <span>💬 {req.contacts.whatsapp || req.contacts.phone}</span>
                    <span>✉️ {req.contacts.email || 'dispatch@office.eg'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl mb-4 text-xs">
                  <div className="flex items-center gap-2 mb-1 text-amber-400 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>بيانات التواصل محجوبة ومحمية:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    يعرض اسم المكتب فقط. بيانات الاتصال الشخصية محجوبة للتأمين اللوجستي، وتتم جميع التنسيقات حصرياً عبر إدارة ConnectTrans.
                  </p>
                </div>
              )}

              {/* Action Area based on Role */}
              {isCompany ? (
                <div className="text-center py-2.5 px-3 text-xs font-bold text-emerald-300 bg-emerald-950/40 rounded-xl border border-emerald-800/40 flex items-center justify-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>لوحة الشركة للقراءة والمتابعة — تواصل مع الإدارة: 01001234567</span>
                </div>
              ) : !isFullyAuthorized && (currentUser?.role === 'office' || currentUser?.role === 'driver') ? (
                <div className="text-center py-2.5 px-3 text-xs font-bold text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>معروض للقراءة فقط — {currentUser?.role === 'office' ? 'طلب تابع لمكتب آخر' : 'معروض للمكاتب والأسطول'}</span>
                </div>
              ) : !isClosed ? (
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

              {/* Admin Advanced Controls Bar */}
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditRequestModal({ ...req })}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="تعديل تفاصيل الطلب"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(req.id, req.requestNumber)}
                    className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                    title="حذف الطلب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => handleToggleRequestStatus(req)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      isClosed 
                        ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white' 
                        : 'bg-amber-600/80 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {isClosed ? 'إعادة فتح الطلب' : 'إغلاق الطلب يدوياً'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Request Modal */}
      {editRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>تعديل بيانات طلب النقل {editRequestModal.requestNumber}</span>
              </h4>
              <button onClick={() => setEditRequestModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequestEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع البضاعة / الحمولة:</label>
                <input
                  type="text"
                  value={editRequestModal.cargoType}
                  onChange={(e) => setEditRequestModal({ ...editRequestModal, cargoType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع الشاحنة:</label>
                  <input
                    type="text"
                    value={editRequestModal.truckType}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, truckType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الوزن التقريبي (طن):</label>
                  <input
                    type="number"
                    value={editRequestModal.weightTons || 25}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, weightTons: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">من (مدينة / محافظة):</label>
                  <input
                    type="text"
                    value={editRequestModal.fromCity}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, fromCity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">إلى (مدينة / محافظة):</label>
                  <input
                    type="text"
                    value={editRequestModal.toCity}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, toCity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السعر (ج.م):</label>
                  <input
                    type="number"
                    value={editRequestModal.pricePerUnit}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, pricePerUnit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الكمية الكلية:</label>
                  <input
                    type="number"
                    min={1}
                    value={editRequestModal.requiredQuantity}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, requiredQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الكمية المتبقية:</label>
                  <input
                    type="number"
                    min={0}
                    value={editRequestModal.remainingQuantity}
                    onChange={(e) => setEditRequestModal({ ...editRequestModal, remainingQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">حالة الطلب:</label>
                <select
                  value={editRequestModal.status}
                  onChange={(e) => setEditRequestModal({ ...editRequestModal, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="open">مفتوح للقبول (Open)</option>
                  <option value="has_offers">يوجد عروض (Has Offers)</option>
                  <option value="partially_accepted">مقبول جزئياً (Partially Accepted)</option>
                  <option value="closed">مغلق (Closed)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRequestModal(null)}
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
