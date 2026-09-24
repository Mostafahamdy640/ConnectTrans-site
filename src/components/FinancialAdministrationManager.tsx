import React, { useState } from 'react';
import { 
  DollarSign, ShieldCheck, Lock, CheckCircle2, AlertTriangle, 
  ArrowDownLeft, Clock, UserCheck, RefreshCw, X, FileText, 
  CreditCard, Ban, Check, Building2, Truck
} from 'lucide-react';
import { UserAccount } from '../types';

export interface EscrowReleaseItem {
  id: string;
  tripNumber: string;
  requestId: string;
  officeName: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  route: string;
  cargoType: string;
  grossAmount: number;
  commissionAmount: number;
  netDriverAmount: number;
  paymentMethod: string;
  officeAuthorizedAt: string;
  officeNotes?: string;
  status: 'pending_finance_release' | 'finance_suspended' | 'paid_out';
  financeSuspensionReason?: string;
  financeAuditor?: string;
  releasedAt?: string;
}

const INITIAL_ESCROW_QUEUE: EscrowReleaseItem[] = [
  {
    id: 'escrow-q-101',
    tripNumber: 'TRIP-CAIRO-ALX-482',
    requestId: 'REQ-9012',
    officeName: 'مكتب النيل لخدمات النقل البري',
    driverId: 'drv-osama-saka',
    driverName: 'أسامة فؤاد السقا',
    driverPhone: '01511224466',
    route: 'ميناء الإسكندرية ⬅ العاشر من رمضان',
    cargoType: 'بضائع مصنعة ومواد أولية (30 طن)',
    grossAmount: 4000,
    commissionAmount: 500,
    netDriverAmount: 3500,
    paymentMethod: 'فيزا وماستركارد البنكية',
    officeAuthorizedAt: 'اليوم، 10:30 صباحاً',
    officeNotes: 'تم استلام البضاعة وفحص بوليصة الشحن بسلام، مصرح للسائق بصرف المستحقات.',
    status: 'pending_finance_release',
  },
  {
    id: 'escrow-q-102',
    tripNumber: 'TRIP-SUZ-SOK-304',
    requestId: 'REQ-8831',
    officeName: 'مكتب الدلتا لوجستيك للنقل الثقيل',
    driverId: 'drv-mahmoud-sayed',
    driverName: 'محمود سيد الشافعي',
    driverPhone: '01033445566',
    route: 'العين السخنة ⬅ السادس من أكتوبر',
    cargoType: 'سيراميك وبورسلين (25 طن)',
    grossAmount: 5200,
    commissionAmount: 600,
    netDriverAmount: 4600,
    paymentMethod: 'إنستاباي (InstaPay IPN)',
    officeAuthorizedAt: 'أمس، 06:15 مساءً',
    officeNotes: 'تم التفريغ بالكامل وتوقيع إيصال الاستلام، نرجو تحرير المبلغ.',
    status: 'pending_finance_release',
  },
  {
    id: 'escrow-q-103',
    tripNumber: 'TRIP-DAMIETTA-MNF-119',
    requestId: 'REQ-7420',
    officeName: 'مكتب الصفا للنقل والخدمات',
    driverId: 'drv-khalid-nasser',
    driverName: 'خالد ناصر التوني',
    driverPhone: '01244556677',
    route: 'ميناء دمياط ⬅ شبين الكوم',
    cargoType: 'أخشاب زان وألواح (28 طن)',
    grossAmount: 3800,
    commissionAmount: 450,
    netDriverAmount: 3350,
    paymentMethod: 'فودافون كاش',
    officeAuthorizedAt: 'منذ يومين',
    officeNotes: 'تم التسليم.',
    status: 'paid_out',
    releasedAt: '2026-09-23 14:00',
    financeAuditor: 'المراقب المالي / حسام الدين عامر',
  }
];

interface FinancialAdministrationManagerProps {
  currentUser?: UserAccount | null;
}

export const FinancialAdministrationManager: React.FC<FinancialAdministrationManagerProps> = ({
  currentUser
}) => {
  const [items, setItems] = useState<EscrowReleaseItem[]>(INITIAL_ESCROW_QUEUE);
  const [selectedItemForSuspend, setSelectedItemForSuspend] = useState<EscrowReleaseItem | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Finance Release Action
  const handleRelease = async (item: EscrowReleaseItem) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ct_auth_token');
      const res = await fetch('/api/wallet/escrow/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          escrowId: item.id,
          driverId: item.driverId,
          amount: item.netDriverAmount,
          tripNumber: item.tripNumber,
          notes: 'اعتماد وتدقيق الإدارة المالية النهائي'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(prev => prev.map(i => i.id === item.id ? {
          ...i,
          status: 'paid_out',
          releasedAt: new Date().toLocaleTimeString('ar-EG'),
          financeAuditor: currentUser?.name || 'الإدارة المالية المركزية'
        } : i));
        showToast(`تم تحرير واعتماد صرف مبلغ ${item.netDriverAmount.toLocaleString()} ج.م للسائق بنجاح!`, 'success');
      } else {
        showToast(data.error || 'فشل تحرير المستحقات', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ بالاتصال بالسيرفر', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Finance Suspend Action
  const handleConfirmSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForSuspend || !suspendReasonInput.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('ct_auth_token');
      const res = await fetch('/api/wallet/escrow/finance-suspend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          escrowId: selectedItemForSuspend.id,
          reason: suspendReasonInput.trim(),
          tripNumber: selectedItemForSuspend.tripNumber,
          driverId: selectedItemForSuspend.driverId,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(prev => prev.map(i => i.id === selectedItemForSuspend.id ? {
          ...i,
          status: 'finance_suspended',
          financeSuspensionReason: suspendReasonInput.trim()
        } : i));
        showToast(`تم تجميد وتعليق صرف المستحقات للرحلة ${selectedItemForSuspend.tripNumber} بنجاح.`, 'success');
        setSelectedItemForSuspend(null);
        setSuspendReasonInput('');
      } else {
        showToast(data.error || 'فشل تعليق العملية', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تجميد الصرف', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsuspend back to pending
  const handleUnsuspend = (item: EscrowReleaseItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? {
      ...i,
      status: 'pending_finance_release',
      financeSuspensionReason: undefined
    } : i));
    showToast(`تم إلغاء تجميد الرحلة ${item.tripNumber} وإعادتها لقائمة انتظار التحرير المالي.`, 'success');
  };

  // Aggregated Stats
  const pendingCount = items.filter(i => i.status === 'pending_finance_release').length;
  const suspendedCount = items.filter(i => i.status === 'finance_suspended').length;
  const paidCount = items.filter(i => i.status === 'paid_out').length;
  const pendingAmount = items
    .filter(i => i.status === 'pending_finance_release')
    .reduce((sum, i) => sum + i.netDriverAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                هيكل الإدارة الثلاثي: المالك (المدير العام) • المشرفين • الإدارة المالية
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              الإدارة المالية والخزانة (Financial Administration & Escrow Treasury)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              وفقاً للقواعد المالية الصارمة لمنصة ConnectTrans: <strong className="text-amber-400">الإدارة المالية هي الجهة الحصرية المخولة بتحرير وصرف الأموال أو تعطيل صلاحية التحويل</strong>. حتى بعد تصريح وموافقة مكتب النقل للسائق باستلام الأموال، <strong className="text-amber-300">تظل عملية الصرف معلقة في خزانة الضمان</strong> حتى تقوم الإدارة المالية بالتدقيق والتحرير النهائي.
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center shrink-0">
            <span className="block text-[11px] text-slate-400 font-bold">أموال معلقة بالضمان:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {pendingAmount.toLocaleString()} ج.م
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">في انتظار تحرير الإدارة المالية</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-300">معلقة بانتظار تحرير المالية:</span>
                <span className="text-[10px] text-slate-500">حتى مع موافقة المكتب</span>
              </div>
            </div>
            <span className="text-lg font-black text-amber-400 font-mono">{pendingCount}</span>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-300">معطلة / مجمدة بقرار مالي:</span>
                <span className="text-[10px] text-slate-500">صلاحية التحويل موقوفة</span>
              </div>
            </div>
            <span className="text-lg font-black text-rose-400 font-mono">{suspendedCount}</span>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-300">محررة ومصروفة للسائقين:</span>
                <span className="text-[10px] text-slate-500">تم التحويل لمحفظة السائق</span>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-400 font-mono">{paidCount}</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Financial Queue List */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>طابور المراجعة والتحرير المالي لمستحقات السائقين</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              جميع العمليات المصرح بها من المكاتب تتطلب تدقيق واعتماد الإدارة المالية قبل الصرف
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const isPending = item.status === 'pending_finance_release';
            const isSuspended = item.status === 'finance_suspended';
            const isPaid = item.status === 'paid_out';

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPending 
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-xs' 
                    : isSuspended 
                    ? 'bg-rose-950/20 border-rose-600/40' 
                    : 'bg-slate-900/40 border-slate-800 opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Trip & Amounts Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                        {item.tripNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-400">({item.route})</span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          معلقة بانتظار تحرير الإدارة المالية
                        </span>
                      )}
                      {isSuspended && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          معطلة / مجمدة بقرار مالي
                        </span>
                      )}
                      {isPaid && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          تم التحرير والصرف لمحفظة السائق
                        </span>
                      )}
                    </div>

                    {/* Parties and Financial Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs pt-1">
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">مكتب النقل المصرح:</span>
                        <strong className="text-white truncate block">{item.officeName}</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">السائق المستحق:</span>
                        <strong className="text-blue-300 truncate block">{item.driverName} ({item.driverPhone})</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">تفصيل الحسبة المالية:</span>
                        <strong className="text-slate-300 font-mono block">
                          دفع: {item.grossAmount} | عمولة: {item.commissionAmount} ج.م
                        </strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-emerald-400 block font-bold">صافي أجر السائق:</span>
                        <strong className="text-emerald-400 text-sm font-mono block">
                          {item.netDriverAmount.toLocaleString()} ج.م
                        </strong>
                      </div>
                    </div>

                    {/* Office authorization note */}
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-amber-400 font-bold">تصريح المكتب ({item.officeAuthorizedAt}): </span>
                      <span>"{item.officeNotes}"</span>
                    </div>

                    {/* Suspension reason if any */}
                    {isSuspended && item.financeSuspensionReason && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                        <span className="font-bold">سبب التعليق المالي: </span>
                        <span>{item.financeSuspensionReason}</span>
                      </div>
                    )}

                    {/* Released info */}
                    {isPaid && item.financeAuditor && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded-xl border border-emerald-800/30">
                        <span>تم التدقيق والاعتماد المالي بواسطة: <strong>{item.financeAuditor}</strong> في {item.releasedAt}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Finance Controller Exclusive Controls */}
                  <div className="flex sm:flex-col gap-2 shrink-0 justify-center">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleRelease(item)}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>تحرير وصرف {item.netDriverAmount.toLocaleString()} ج.م</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setSelectedItemForSuspend(item);
                            setSuspendReasonInput('مراجعة مطابقة الوزن وبوليصة التفريغ والتأكد من عدم وجود عجز أو تلف');
                          }}
                          className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Ban className="w-4 h-4 text-rose-400" />
                          <span>تعطيل وتجميد الصرف</span>
                        </button>
                      </>
                    )}

                    {isSuspended && (
                      <button
                        type="button"
                        onClick={() => handleUnsuspend(item)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>إلغاء التجميد وإعادة للمراجعة</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suspend Modal */}
      {selectedItemForSuspend && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleConfirmSuspend}
            className="bg-slate-900 border border-rose-700/60 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl text-right"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">تجميد وتعطيل صلاحية تحويل الأموال</h4>
                  <span className="text-[10px] text-slate-400 font-mono">الرحلة: {selectedItemForSuspend.tripNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForSuspend(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              سيتم إيقاف عملية الصرف المالي وحجز الـ <strong className="text-amber-400">{selectedItemForSuspend.netDriverAmount.toLocaleString()} ج.م</strong> بالخزانة لحين حل النزاع أو استكمال المستندات، وإشعار الأطراف بسبب التعليق.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">سبب التعطيل والتعليق المالي:</label>
              <textarea
                rows={3}
                required
                value={suspendReasonInput}
                onChange={(e) => setSuspendReasonInput(e.target.value)}
                placeholder="اكتب سبب التعليق المالي (مثلاً: التحقق من وزن البوليصة أو وجود تلفيات)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>تأكيد تجميد الصرف المالي</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemForSuspend(null)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
