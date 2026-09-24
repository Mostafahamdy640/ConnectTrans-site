import React, { useState } from 'react';
import { 
  CreditCard, Wallet, ShieldCheck, ArrowDownLeft, ArrowUpRight, 
  Lock, CheckCircle2, Clock, Building2, Truck, AlertCircle, 
  QrCode, Printer, RefreshCw, FileText, Check, X, ChevronRight, 
  Info, Sparkles, Smartphone, BadgePercent, ArrowRight, HelpCircle,
  Eye, Landmark
} from 'lucide-react';
import { UserAccount } from '../types';

export interface PaymentTransactionItem {
  id: string;
  tripNumber: string;
  type: 'escrow_lock' | 'commission_deduction' | 'driver_payout' | 'instant_withdrawal';
  payerName: string;
  receiverName: string;
  grossAmount: number;
  commissionAmount: number;
  netDriverAmount: number;
  paymentMethod: 'visa_mastercard' | 'meeza' | 'instapay' | 'vodafone_cash' | 'bank_transfer';
  date: string;
  status: 'held_in_escrow' | 'pending_finance' | 'paid_to_wallet' | 'withdrawn';
  referenceNumber: string;
  notes?: string;
}

const INITIAL_TRANSACTIONS: PaymentTransactionItem[] = [
  {
    id: 'TXN-8821',
    tripNumber: 'TRIP-CAIRO-ALX-482',
    type: 'escrow_lock',
    payerName: 'مكتب النيل لخدمات النقل البري',
    receiverName: 'كابتن أسامة فؤاد السقا',
    grossAmount: 4000,
    commissionAmount: 500,
    netDriverAmount: 3500,
    paymentMethod: 'visa_mastercard',
    date: 'اليوم، 10:30 صباحاً',
    status: 'pending_finance',
    referenceNumber: 'CBE-REF-994821',
    notes: 'تم فحص البوليصة والتصريح بصرف الأجر، بانتظار تحرير الإدارة المالية النهائي'
  },
  {
    id: 'TXN-8815',
    tripNumber: 'TRIP-SUZ-SOK-304',
    type: 'instant_withdrawal',
    payerName: 'محفظة ConnectTrans المركزية',
    receiverName: 'كابتن محمود سيد الشافعي',
    grossAmount: 4600,
    commissionAmount: 0,
    netDriverAmount: 4600,
    paymentMethod: 'instapay',
    date: 'أمس، 04:15 مساءً',
    status: 'withdrawn',
    referenceNumber: 'IPN-TR-772910',
    notes: 'سحب لحظي عبر إنستاباي إلى عنوان الدفع mahmoud@instapay (الرسوم 0 ج.م)'
  },
  {
    id: 'TXN-8790',
    tripNumber: 'TRIP-DAMIETTA-MNF-119',
    type: 'driver_payout',
    payerName: 'مكتب الصفا للنقل والخدمات',
    receiverName: 'كابتن خالد ناصر التوني',
    grossAmount: 3800,
    commissionAmount: 450,
    netDriverAmount: 3350,
    paymentMethod: 'vodafone_cash',
    date: 'منذ يومين',
    status: 'paid_to_wallet',
    referenceNumber: 'VF-CASH-44912',
    notes: 'تم التحرير والصرف لمحفظة السائق بعد اعتماد الإدارة المالية'
  },
  {
    id: 'TXN-8762',
    tripNumber: 'TRIP-OCT-SADAT-081',
    type: 'escrow_lock',
    payerName: 'شركة الدلتا للصناعات الغذائية',
    receiverName: 'مكتب الإخلاص للنقل الثقيل',
    grossAmount: 6200,
    commissionAmount: 700,
    netDriverAmount: 5500,
    paymentMethod: 'meeza',
    date: 'منذ 3 أيام',
    status: 'held_in_escrow',
    referenceNumber: 'MEEZA-POS-33819',
    notes: 'الشاحنة في طريقها للتفريغ؛ المبلغ محجوز في حساب الضمان المشفر بالبنك'
  }
];

interface PaymentOperationsManagerProps {
  currentUser?: UserAccount | null;
  onClose?: () => void;
  defaultSubTab?: 'flow' | 'pay_checkout' | 'driver_payout' | 'ledger' | 'faqs';
}

export const PaymentOperationsManager: React.FC<PaymentOperationsManagerProps> = ({
  currentUser,
  onClose,
  defaultSubTab = 'flow'
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'pay_checkout' | 'driver_payout' | 'ledger' | 'faqs'>(defaultSubTab);
  
  // Interactive Simulator State
  const [simGross, setSimGross] = useState<number>(4000);
  const [simCommissionRate, setSimCommissionRate] = useState<number>(12.5); // %
  const simCommission = Math.round(simGross * (simCommissionRate / 100));
  const simNetDriver = Math.max(0, simGross - simCommission);

  // Pay Freight Form State
  const [checkoutGross, setCheckoutGross] = useState<number>(4500);
  const [checkoutTripNumber, setCheckoutTripNumber] = useState('TRIP-CAIRO-ALX-551');
  const [checkoutMethod, setCheckoutMethod] = useState<'visa_mastercard' | 'meeza' | 'instapay' | 'vodafone_cash' | 'bank_transfer'>('visa_mastercard');
  const [checkoutDriverName, setCheckoutDriverName] = useState('كابتن أحمد رشاد المنشاوي');
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutReceipt, setCheckoutReceipt] = useState<PaymentTransactionItem | null>(null);

  // Payout Form State (Drivers & Vehicle Owners)
  const [payoutAmount, setPayoutAmount] = useState<number>(3500);
  const [payoutChannel, setPayoutChannel] = useState<'instapay' | 'vodafone_cash' | 'bank'>('instapay');
  const [payoutDestination, setPayoutDestination] = useState('osama@instapay');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

  // Filter & Ledger State
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>(INITIAL_TRANSACTIONS);
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'held_in_escrow' | 'pending_finance' | 'paid_to_wallet' | 'withdrawn'>('all');
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<PaymentTransactionItem | null>(null);

  // Handle Pay Freight Action
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    
    // Calculate Commission (fixed 500 or 12%)
    const commission = Math.round(checkoutGross * 0.12);
    const netDriver = checkoutGross - commission;

    try {
      const token = localStorage.getItem('ct_auth_token');
      const res = await fetch('/api/wallet/escrow/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          grossPrice: checkoutGross,
          commissionAmount: commission,
          paymentMethod: checkoutMethod,
          tripId: checkoutTripNumber,
          driverName: checkoutDriverName,
          requestId: 'REQ-LIVE-PORTAL'
        })
      });

      const data = await res.json();
      
      const newTxn: PaymentTransactionItem = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        tripNumber: checkoutTripNumber,
        type: 'escrow_lock',
        payerName: currentUser?.name || 'مكتب النقل المعتمد',
        receiverName: checkoutDriverName,
        grossAmount: checkoutGross,
        commissionAmount: commission,
        netDriverAmount: netDriver,
        paymentMethod: checkoutMethod,
        date: 'الآن (مباشر)',
        status: 'held_in_escrow',
        referenceNumber: `CBE-${Date.now().toString().slice(-6)}`,
        notes: 'تم تأمين النولون وإيداع صافي أجر السائق في حساب الضمان المشفر بالبنك المركزي'
      };

      setTransactions(prev => [newTxn, ...prev]);
      setCheckoutReceipt(newTxn);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  // Handle Withdrawal Action
  const handleConfirmWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) return;

    setIsWithdrawing(true);
    try {
      const token = localStorage.getItem('ct_auth_token');
      const res = await fetch('/api/wallet/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: payoutAmount,
          bankName: payoutChannel === 'instapay' ? 'InstaPay IPN' : payoutChannel === 'vodafone_cash' ? 'Vodafone Cash' : 'البنك الأهلي المصري',
          accountNumber: payoutDestination,
        })
      });

      const newTxn: PaymentTransactionItem = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        tripNumber: 'سحب أرباح شخصي',
        type: 'instant_withdrawal',
        payerName: 'محفظة ConnectTrans المركزية',
        receiverName: currentUser?.name || 'كابتن الشاحنة',
        grossAmount: payoutAmount,
        commissionAmount: 0,
        netDriverAmount: payoutAmount,
        paymentMethod: payoutChannel === 'instapay' ? 'instapay' : payoutChannel === 'vodafone_cash' ? 'vodafone_cash' : 'bank_transfer',
        date: 'الآن (لحظي)',
        status: 'withdrawn',
        referenceNumber: `IPN-${Date.now().toString().slice(-6)}`,
        notes: `تم السحب الفوري بنجاح إلى: ${payoutDestination}`
      };

      setTransactions(prev => [newTxn, ...prev]);
      setWithdrawalSuccess(`تم تحويل ${payoutAmount.toLocaleString()} ج.م فورياً إلى ${payoutDestination} عبر شبكة إنستاباي اللحظية.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (ledgerFilter === 'all') return true;
    return t.status === ledgerFilter;
  });

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 rounded-3xl border border-blue-900/50 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                حسابات الضمان المالي المشفر (Escrow Protection System)
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                معتمد وفق ضوابط البنك المركزي المصري (CBE)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              منظومة المدفوعات والضمان المالي (ConnectTrans Escrow)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              عمليات دفع منظمة، شفافة، ومحمية بالكامل: <strong className="text-amber-400">لا ضياع للأموال ولا مماطلة في الأجور</strong>. يدفع مكتب النقل إجمالي النقلة إلكترونياً، تقتطع المنصة عمولتها الرسمية، ويُحجز صافي أجر السائق في الضمان حتى تسليم البضاعة وتدقيق الإدارة المالية، ثم يُصرف فورياً لمحفظة السائق.
            </p>
          </div>

          {/* Quick Balance & Status Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shrink-0 min-w-[260px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">الرصيد المتاح للسحب:</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {(currentUser?.walletBalance || 4850).toLocaleString()} <span className="text-sm font-cairo">ج.م</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>التحويل اللحظي (InstaPay):</span>
              <strong className="text-blue-400 font-mono">فوري (0% رسوم)</strong>
            </div>
          </div>
        </div>

        {/* 4 Key Pillars Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 relative z-10 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">نسبة الأمان المالي</span>
            <strong className="text-emerald-400 font-mono text-sm sm:text-base font-black">100% مشفر</strong>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">سرعة تحويل الأجر</span>
            <strong className="text-blue-400 font-mono text-sm sm:text-base font-black">خلال 15 ثانية</strong>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">بوابات الدفع المدعومة</span>
            <strong className="text-amber-400 font-mono text-sm sm:text-base font-black">ميزة • فيزا • كاش</strong>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">حوكمة صرف الأجور</span>
            <strong className="text-purple-400 font-mono text-sm sm:text-base font-black">اعتماد مالي ثلاثي</strong>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200">
        <button
          onClick={() => setActiveTab('flow')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'flow'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>1. دورة حياة الدفع التفاعلية</span>
        </button>

        <button
          onClick={() => setActiveTab('pay_checkout')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'pay_checkout'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. سداد وتأمين نولون رحلة</span>
        </button>

        <button
          onClick={() => setActiveTab('driver_payout')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'driver_payout'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>3. سحب الأرباح الفوري (السائقين)</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. سجل المعاملات والإيصالات</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'faqs'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>5. الضمانات والأسئلة الشائعة</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THE 6-STEP PAYMENT LIFECYCLE & LIVE SIMULATOR                      */}
      {/* ========================================================================= */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          {/* Visual Step-by-Step Flow */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>دورة حياة حركة الأموال من لحظة الدفع حتى الصرف الفوري</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  كيف تنتقل الأموال بأمان مطلق وتضمن كل طرف حقه القانوني والمالي في منظومة ConnectTrans
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200">
                6 مراحل محكمة وآلية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-xs">
                  1
                </div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>سداد إجمالي النولون</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يقوم مكتب النقل بسداد إجمالي سعر النقلة المتفق عليه (مثلاً <strong>4,000 ج.م</strong>) إلكترونياً بالفيزا أو كارت ميزة أو إنستاباي أو فودافون كاش.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-blue-700">
                  المسؤول: مكتب النقل / الشاحن
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-mono font-black flex items-center justify-center text-sm shadow-xs">
                  2
                </div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-amber-500" />
                  <span>اقتطاع عمولة المنصة</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يقتطع النظام تلقائياً عمولة المنصة المقررة (مثلاً <strong>500 ج.م</strong>) لتغطية مصاريف التأمين، خدمات التتبع بالأقمار، والدعم الفني 24/7.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-amber-700">
                  المسؤول: خوارزمية المنصة المؤتمتة
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-xs">
                  3
                </div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>حجز أجر السائق في الضمان</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يُحجز باقي المبلغ بالكامل (<strong>3,500 ج.م</strong>) في حساب بنكي وسيط مشفر (Escrow)، ولا يمكن لأي طرف سحبه أو إلغاؤه منفرداً.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-emerald-700">
                  المسؤول: الخزينة والبنك الوسيط
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-xs">
                  4
                </div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span>التسليم وتصريح المكتب</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تصل الشاحنة لموقع التفريغ، ويتم توقيع إيصال الاستلام (POD). يقوم مكتب النقل بفحص البوليصة والضغط على زر "مصرح بالسداد للسائق".
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-purple-700">
                  المسؤول: السائق ومكتب النقل
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-xs">
                  5
                </div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>تدقيق وتحرير الإدارة المالية</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تطابق الإدارة المالية أوزان البوالص ومطابقة الرحلة، ثم تعتمد التحرير النهائي للأموال من خزانة الضمان أو تجميدها عند وجود شبهة عجز أو نزاع.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-rose-700">
                  المسؤول: الإدارة المالية المركزية
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-xs">
                  6
                </div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-indigo-600" />
                  <span>الصرف والسحب اللحظي</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يصل المبلغ فوراً لمحفظة السائق، ويستطيع سحبه بضغطة زر إلى حسابه البنكي أو عنوان إنستاباي أو فودافون كاش خلال 15 ثانية فقط وبدون رسوم.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-indigo-700">
                  المسؤول: شبكة InstaPay IPN والمحفظة
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Calculator / Simulator */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
                  <BadgePercent className="w-5 h-5 text-amber-400" />
                  <span>محاكي الحسبة المالية التفاعلية (Live Financial Calculator)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  جرب إدخال أي قيمة لترى بالضبط توزيع الأموال بالقرش بين المكتب والمنصة والسائق
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">قيم سريعة:</span>
                {[3000, 4000, 6500, 10000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimGross(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      simGross === val ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Control */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    إجمالي نولون الرحلة (ما يدفعه المكتب):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      step={100}
                      value={simGross}
                      onChange={(e) => setSimGross(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-black text-amber-400 focus:outline-hidden focus:border-amber-400"
                    />
                    <span className="absolute left-4 top-3 text-sm text-slate-400">ج.م</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>نسبة عمولة المنصة:</span>
                    <span className="font-mono text-amber-300 font-bold">{simCommissionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={0.5}
                    value={simCommissionRate}
                    onChange={(e) => setSimCommissionRate(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Formula Display */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* 1. Paid By Office */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-blue-500/40 text-center space-y-1">
                  <span className="text-[11px] text-blue-300 font-bold block">1. يدفعها مكتب النقل:</span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {simGross.toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">بالفيزا أو ميزة أو إنستاباي</span>
                </div>

                {/* 2. Platform Commission */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 text-center space-y-1">
                  <span className="text-[11px] text-amber-300 font-bold block">2. عمولة المنصة ({simCommissionRate}%):</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {simCommission.toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">تأمين وتتبع وبوالص</span>
                </div>

                {/* 3. Driver Net Escrow */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/50 text-center space-y-1 shadow-lg shadow-emerald-950/40">
                  <span className="text-[11px] text-emerald-400 font-bold block">3. صافي أجر السائق (الضمان):</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {simNetDriver.toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                  <span className="text-[10px] text-emerald-300/80 block">يصل كاملاً لمحفظته بعد التسليم</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>معادلة الشفافية المطلقة:</strong> لا توجد أي خصومات إضافية خفية على السائق؛ المبلغ الصافي المحسوب هو ما يصل لمحفظته بالتمام والكمال.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAY FREIGHT & ESCROW CHECKOUT (مكاتب النقل والشركات)                */}
      {/* ========================================================================= */}
      {activeTab === 'pay_checkout' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>بوابة سداد وتأمين نولون رحلة جديدة (Escrow Checkout)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                سداد رسمي مشفر ومطابق لتعليمات البنك المركزي المصري عبر Paymob وشركاء الدفع المعتمدين
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>دفع آمن 256-bit SSL</span>
            </div>
          </div>

          {checkoutReceipt ? (
            /* Electronic Official Receipt */
            <div className="p-6 bg-slate-950 text-white rounded-3xl border border-emerald-500/40 space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">إيصال سداد وتأمين رحلة رسمي</h4>
                    <span className="text-xs text-slate-400 font-mono">مرجع العملية: {checkoutReceipt.referenceNumber}</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-lg border border-emerald-500/30">
                    تم التأمين بنجاح
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">رقم الرحلة:</span>
                  <strong className="text-amber-400 font-mono text-sm">{checkoutReceipt.tripNumber}</strong>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">إجمالي المدفوع:</span>
                  <strong className="text-white font-mono text-sm">{checkoutReceipt.grossAmount.toLocaleString()} ج.م</strong>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">عمولة المنصة:</span>
                  <strong className="text-slate-300 font-mono text-sm">{checkoutReceipt.commissionAmount.toLocaleString()} ج.م</strong>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 block text-[11px] font-bold">المحتجز بالضمان للسائق:</span>
                  <strong className="text-emerald-400 font-mono text-sm">{checkoutReceipt.netDriverAmount.toLocaleString()} ج.م</strong>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span>السائق المستحق:</span>
                  <strong className="text-white">{checkoutReceipt.receiverName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>طريقة السداد:</span>
                  <strong className="text-blue-300">{checkoutReceipt.paymentMethod}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>حالة الضمان:</span>
                  <strong className="text-emerald-400 font-bold">محجوز في خزانة البنك لحين تسليم البضاعة</strong>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الإيصال الإلكتروني</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutReceipt(null)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>إجراء سداد جديد</span>
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleConfirmPayment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الرحلة / الشحنة:</label>
                  <input
                    type="text"
                    required
                    value={checkoutTripNumber}
                    onChange={(e) => setCheckoutTripNumber(e.target.value)}
                    placeholder="مثال: TRIP-CAIRO-ALX-551"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم السائق المستحق للأجر:</label>
                  <input
                    type="text"
                    required
                    value={checkoutDriverName}
                    onChange={(e) => setCheckoutDriverName(e.target.value)}
                    placeholder="اسم السائق الثلاثي"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Price & Calculation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي نولون النقلة:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={100}
                        required
                        value={checkoutGross}
                        onChange={(e) => setCheckoutGross(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base font-mono font-black text-slate-900 focus:outline-hidden focus:border-emerald-600"
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400">ج.م</span>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[11px] text-amber-800 font-bold block">عمولة المنصة (12%):</span>
                    <span className="text-lg font-black text-amber-700 font-mono">
                      {Math.round(checkoutGross * 0.12).toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[11px] text-emerald-800 font-bold block">المحتجز بالضمان للسائق:</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">
                      {Math.max(0, checkoutGross - Math.round(checkoutGross * 0.12)).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">اختر وسيلة الدفع الإلكتروني المعتمدة:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'visa_mastercard', label: 'فيزا وماستركارد', sub: 'البطاقات البنكية الائتمانية', icon: CreditCard, color: 'text-blue-600' },
                    { id: 'meeza', label: 'كارت ميزة الوطني', sub: 'بطاقة الدفع المصرية', icon: Landmark, color: 'text-emerald-600' },
                    { id: 'instapay', label: 'إنستاباي (InstaPay IPN)', sub: 'تحويل لحظي بالـ IPA', icon: Smartphone, color: 'text-purple-600' },
                    { id: 'vodafone_cash', label: 'فودافون كاش والمحافظ', sub: 'محافظ المحمول الإلكترونية', icon: Wallet, color: 'text-rose-600' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = checkoutMethod === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCheckoutMethod(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-5 h-5 ${item.color}`} />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <div>
                          <strong className="text-xs font-black text-slate-900 block">{item.label}</strong>
                          <span className="text-[10px] text-slate-500 block">{item.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Note */}
              <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>حماية Escrow:</strong> لا يستطيع السائق استلام المبلغ إلا بعد إتمام النقل والتسليم ورفع إيصال الاستلام وموافقة الإدارة المالية.
                </span>
              </div>

              <button
                type="submit"
                disabled={isPaying}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isPaying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري معالجة الدفع وحجز الضمان في البنك...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>تأكيد سداد {checkoutGross.toLocaleString()} ج.م وحجز الضمان</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INSTANT DRIVER PAYOUT WITHDRAWAL (سحب أرباح السائقين)                 */}
      {/* ========================================================================= */}
      {activeTab === 'driver_payout' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-purple-600" />
                <span>سحب الأرباح الفوري لمحفظة السائق (Instant Driver Payout)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                حول أرباحك ومستحقاتك المحررة فورياً إلى حسابك البنكي أو عنوان إنستاباي أو محفظتك الذكية
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl text-right">
              <span className="text-[11px] text-purple-800 font-bold block">الرصيد المتاح للسحب الآن:</span>
              <span className="text-xl font-black text-purple-900 font-mono">
                {(currentUser?.walletBalance || 4850).toLocaleString()} ج.م
              </span>
            </div>
          </div>

          {withdrawalSuccess ? (
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-3xl text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-purple-950">تم تحويل الأرباح بنجاح!</h4>
              <p className="text-xs text-purple-900 max-w-md mx-auto">{withdrawalSuccess}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawalSuccess(null)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  إجراء سحب آخر
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmWithdrawal} className="space-y-5 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المراد سحبه (ج.م):</label>
                <div className="relative">
                  <input
                    type="number"
                    min={50}
                    max={currentUser?.walletBalance || 4850}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-lg font-mono font-black text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(currentUser?.walletBalance || 4850)}
                    className="absolute left-3 top-2.5 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg hover:bg-purple-200 cursor-pointer"
                  >
                    سحب الرصيد كاملاً
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر وجهة التحويل:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'instapay', label: 'إنستاباي (InstaPay)', time: 'لحظي (15 ثانية)', free: 'بدون رسوم' },
                    { id: 'vodafone_cash', label: 'فودافون كاش والمحافظ', time: 'فوري', free: 'رسوم المحفظة' },
                    { id: 'bank', label: 'تحويل لحساب بنكي', time: 'نفس اليوم', free: 'بدون رسوم' },
                  ].map(chan => (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => setPayoutChannel(chan.id as any)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        payoutChannel === chan.id
                          ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <strong className="text-xs font-black block">{chan.label}</strong>
                      <span className="text-[10px] text-emerald-600 font-bold block">{chan.time}</span>
                      <span className="text-[9px] text-slate-500 block">{chan.free}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {payoutChannel === 'instapay' ? 'عنوان الدفع اللحظي (IPA) أو رقم الهاتف المسجل في إنستاباي:' :
                   payoutChannel === 'vodafone_cash' ? 'رقم محفظة فودافون / أورنج / وي كاش:' : 'رقم الحساب البنكي أو الـ IBAN:'}
                </label>
                <input
                  type="text"
                  required
                  value={payoutDestination}
                  onChange={(e) => setPayoutDestination(e.target.value)}
                  placeholder={payoutChannel === 'instapay' ? 'username@instapay أو 010xxxxxxxx' : '01xxxxxxxxx'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl text-xs text-purple-900 flex items-center justify-between">
                <span>المبلغ المحول لحسابك بالتمام:</span>
                <span className="font-mono font-black text-purple-900 text-sm">
                  {payoutAmount.toLocaleString()} ج.م (0% خصم)
                </span>
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || payoutAmount <= 0}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري إرسال الحوالة اللحظية عبر إنستاباي...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>تأكيد السحب الفوري لـ {payoutAmount.toLocaleString()} ج.م</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRANSACTIONS & ESCROW LEDGER (سجل العمليات المالية الشفاف)            */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-900" />
                <span>سجل العمليات المالية والإيصالات الرقمية (Transactions Ledger)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                سجل تدقيق مالي شفاف يوثق كل إيداع، عمولة مقتطعة، تحرير ضمان، وسحب أرباح
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pending_finance', label: 'بانتظار تحرير المالية' },
                { id: 'held_in_escrow', label: 'محجوز بالضمان' },
                { id: 'paid_to_wallet', label: 'محرر للمحفظة' },
                { id: 'withdrawn', label: 'مسحوب' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLedgerFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    ledgerFilter === f.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">رقم المعاملة / الرحلة</th>
                  <th className="py-3 px-4">نوع العملية</th>
                  <th className="py-3 px-4">الدافع ➔ المستلم</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">التفصيل المالي (ج.م)</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإيصال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(txn => {
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-slate-900 block">{txn.id}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{txn.tripNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {txn.type === 'escrow_lock' && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                            تأمين نولون بالضمان
                          </span>
                        )}
                        {txn.type === 'driver_payout' && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                            تحرير مستحقات سائق
                          </span>
                        )}
                        {txn.type === 'instant_withdrawal' && (
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px]">
                            سحب أرباح فوري
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block truncate max-w-[140px]">{txn.payerName}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">➔ {txn.receiverName}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {txn.paymentMethod === 'visa_mastercard' ? 'فيزا بنكية' :
                         txn.paymentMethod === 'meeza' ? 'كارت ميزة' :
                         txn.paymentMethod === 'instapay' ? 'إنستاباي IPN' :
                         txn.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'تحويل بنكي'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {txn.grossAmount.toLocaleString()} ج.م
                        </div>
                        {txn.commissionAmount > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            عمولة: {txn.commissionAmount} | صافي: {txn.netDriverAmount}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {txn.status === 'held_in_escrow' && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" />
                            محجوز بالضمان
                          </span>
                        )}
                        {txn.status === 'pending_finance' && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px] flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3" />
                            بانتظار اعتماد المالية
                          </span>
                        )}
                        {txn.status === 'paid_to_wallet' && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            تم الصرف للمحفظة
                          </span>
                        )}
                        {txn.status === 'withdrawn' && (
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px] flex items-center gap-1 w-max">
                            <ArrowDownLeft className="w-3 h-3" />
                            تم السحب بنجاح
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptForView(txn)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PAYMENT FAQS & ESCROW GUARANTEES                                   */}
      {/* ========================================================================= */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>الضمانات المالية والأسئلة الشائعة حول عمليات الدفع</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              كل ما تحتاج لمعرفته حول أمان الأموال، حساب الضمان في البنك، وحل النزاعات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>كيف تضمن المنصة حق السائق في استلام أجره؟</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                بمجرد أن يبدأ السائق الرحلة، يكون مكتب النقل قد سدد إجمالي النولون بالفعل والمبلغ محجوز في حساب الضمان البنكي التابع للمنصة. لا يمكن للمكتب سحب المبلغ أو إلغاؤه؛ وبمجرد تسليم البضاعة وتوقيع البوليصة يُصرف أجر السائق مباشرة.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>كيف يضمن مكتب النقل وصول البضاعة سليمة؟</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                الأموال لا تُصرف للسائق إلا بعد أن يؤكد مكتب النقل والمستلم وصول البضاعة كاملة ومطابقة للأوزان المذكورة في بوليصة الشحن (POD)، دون أي تلف أو عجز.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>ما هو دور الإدارة المالية في تحرير أو تجميد الصرف؟</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                الإدارة المالية هي صمام الأمان؛ حتى بعد موافقة المكتب، تراجع المالية أرقام البوالص وصحة الإيصالات. في حالة حدوث أي نزاع أو بلاغ تلفيات، تمتلك الإدارة المالية صلاحية حصرية لتجميد صرف المبلغ حتى انتهاء التحقيق وحماية الطرف المتضرر.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>كم تستغرق عملية سحب الأرباح عبر إنستاباي؟</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                التحويل يتم بصورة لحظية وفورية (في خلال 15 ثانية) على مدار 24 ساعة طوال أيام الأسبوع بما في ذلك الإجازات الرسمية، وبدون أي مصاريف أو عمولات إضافية على السائق.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>ما هي وسائل الدفع المتاحة للمكاتب والشركات؟</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                ندعم بطاقة ميزة الوطنية، بطاقات فيزا وماستركارد البنكية، شبكة إنستاباي (InstaPay IPN)، ومحافظ المحمول (فودافون كاش، أورنج، وي، اتصالات)، بالإضافة إلى التحويلات البنكية المباشرة عبر حساباتنا في البنك الأهلي وبنك مصر.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-rose-600" />
                <span>هل توجد أي رسوم أو خصومات خفية؟</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                إطلاقاً؛ نظام ConnectTrans مبني على الشفافية المطلقة. تقتطع عمولة المنصة الثابتة فقط من النولون الإجمالي، وما تبقى هو حق خالص للسائق يُصرف له كاملاً دون أي استقطاعات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP: DETAILED ELECTRONIC RECEIPT VIEWER                                 */}
      {/* ========================================================================= */}
      {selectedReceiptForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">إيصال مالي إلكتروني معتمد</h4>
                  <span className="text-[11px] text-slate-400 font-mono">رقم المعاملة: {selectedReceiptForView.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptForView(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">المرجع البنكي الرسمي:</span>
                <span className="font-mono font-bold text-amber-400">{selectedReceiptForView.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">رقم الرحلة:</span>
                <span className="font-mono font-bold text-white">{selectedReceiptForView.tripNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">الطرف الدافع:</span>
                <span className="font-bold text-white">{selectedReceiptForView.payerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">الطرف المستلم:</span>
                <span className="font-bold text-blue-300">{selectedReceiptForView.receiverName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">إجمالي المبلغ:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {selectedReceiptForView.grossAmount.toLocaleString()} ج.م
                </span>
              </div>
              {selectedReceiptForView.commissionAmount > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">عمولة المنصة:</span>
                  <span className="font-mono font-bold text-slate-300">
                    {selectedReceiptForView.commissionAmount.toLocaleString()} ج.م
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">صافي المستحق للسائق:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {selectedReceiptForView.netDriverAmount.toLocaleString()} ج.م
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">تاريخ وساعة القيد:</span>
                <span className="text-slate-300">{selectedReceiptForView.date}</span>
              </div>

              {selectedReceiptForView.notes && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold block mb-0.5">ملاحظات الحساب:</span>
                  <span>{selectedReceiptForView.notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptForView(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
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
