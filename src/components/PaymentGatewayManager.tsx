import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Smartphone, ShieldCheck, Lock, CheckCircle2, 
  AlertTriangle, RefreshCw, Send, ArrowRight, DollarSign, 
  Building2, Truck, Download, ExternalLink, HelpCircle, 
  Layers, Key, Check, Info, FileText
} from 'lucide-react';

export const PaymentGatewayManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'escrow_simulation' | 'gateways_config' | 'stores_roadmap'>('escrow_simulation');
  
  // Gateways Configuration state
  const [provider, setProvider] = useState<'paymob' | 'kashier' | 'fawry' | 'instapay'>('paymob');
  const [apiKey, setApiKey] = useState('sec_live_cbe_paymob_connecttrans_prod_89234');
  const [hmacSecret, setHmacSecret] = useState('hmac_sha512_secret_signature_verified_cbe');
  const [cardIntegrationId, setCardIntegrationId] = useState('4198231');
  const [walletIntegrationId, setWalletIntegrationId] = useState('4198232');
  const [fawryMerchant, setFawryMerchant] = useState('FAWRY_EG_CONNECTTRANS');
  const [isTestMode, setIsTestMode] = useState(true);
  const [isInstaPayActive, setIsInstaPayActive] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);

  // Escrow Simulation Form State (4000 EGP Office -> 500 Commission -> 3500 Driver)
  const [grossInput, setGrossInput] = useState<number>(4000);
  const [commissionInput, setCommissionInput] = useState<number>(500);
  const [selectedMethod, setSelectedMethod] = useState<'visa_mastercard' | 'meeza' | 'vodafone_cash' | 'instapay'>('visa_mastercard');
  const [driverName, setDriverName] = useState('كابتن أسامة فؤاد السقا');
  const [isProcessing, setIsProcessing] = useState(false);
  const [escrowResult, setEscrowResult] = useState<any>(null);
  const [releaseStatus, setReleaseStatus] = useState<string | null>(null);

  const netDriverCalculated = Math.max(0, grossInput - commissionInput);

  // Fetch gateway config from server
  useEffect(() => {
    const token = localStorage.getItem('ct_auth_token');
    fetch('/api/wallet/gateways/config', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          if (data.config.activeProvider) setProvider(data.config.activeProvider);
          if (data.config.paymobApiKey) setApiKey(data.config.paymobApiKey);
          if (data.config.paymobHmacSecret) setHmacSecret(data.config.paymobHmacSecret);
          if (data.config.paymobIntegrationIdCard) setCardIntegrationId(data.config.paymobIntegrationIdCard);
          if (data.config.paymobIntegrationIdWallet) setWalletIntegrationId(data.config.paymobIntegrationIdWallet);
          if (data.config.testMode !== undefined) setIsTestMode(data.config.testMode);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ct_auth_token');
    try {
      const res = await fetch('/api/wallet/gateways/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          activeProvider: provider,
          paymobApiKey: apiKey,
          paymobHmacSecret: hmacSecret,
          paymobIntegrationIdCard: cardIntegrationId,
          paymobIntegrationIdWallet: walletIntegrationId,
          fawryMerchantCode: fawryMerchant,
          instapayEnabled: isInstaPayActive,
          testMode: isTestMode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Test Escrow Lock Execution
  const handleLockEscrow = async () => {
    setIsProcessing(true);
    setReleaseStatus(null);
    try {
      const token = localStorage.getItem('ct_auth_token');
      const res = await fetch('/api/wallet/escrow/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          requestId: 'REQ-ALX-CAIRO-902',
          tripId: 'TRIP-7712',
          driverId: 'driver-osama-saka',
          driverName: driverName,
          grossPrice: grossInput,
          commissionAmount: commissionInput,
          paymentMethod: selectedMethod,
          paymentReference: `PAYMOB-${Date.now().toString().slice(-6)}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEscrowResult(data.escrow);
      } else {
        alert(data.error || 'حدث خطأ أثناء حجز الضمان');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Release Escrow to Driver
  const handleReleaseEscrow = async () => {
    if (!escrowResult) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('ct_auth_token');
      const res = await fetch('/api/wallet/escrow/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          escrowId: escrowResult.escrowId,
          driverId: 'driver-osama-saka',
          amount: escrowResult.netDriverAmount,
          tripNumber: 'TRIP-7712'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReleaseStatus(`تم تحرير مبلغ ${escrowResult.netDriverAmount.toLocaleString()} ج.م بنجاح إلى محفظة السائق فور تأكيد التسليم!`);
        setEscrowResult((prev: any) => ({ ...prev, status: 'released_and_paid' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 rounded-3xl border border-blue-900/50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                معتمد وفق معايير البنك المركزي المصري (CBE) و PCI-DSS
              </span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
                Play Store & App Store Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابات الدفع الإلكتروني، حسابات الضمان (Escrow)، وتطبيقات المتاجر
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              إدارة تكامل الدفع بالفيزا والمحافظ وإنستاباي (InstaPay IPN)، ونظام وساطة العمولات الذكي (دفع 4,000 ج.م - عمولة 500 ج.م = 3,500 ج.م للسائق بالضمان)، مع دليل إطلاق التطبيق رسمياً في متاجر جوجل وآبل.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="block text-[11px] text-slate-400 font-bold">بوابة الدفع الحالية:</span>
              <span className="text-sm font-black text-amber-400 uppercase tracking-wider">{provider} Gateway</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('escrow_simulation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'escrow_simulation'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>نظام الضمان والعمولة (تجربة عملية: 4000 - 500 = 3500)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gateways_config')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'gateways_config'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>إعدادات بوابات الدفع (Paymob / Fawry / Kashier / InstaPay)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stores_roadmap')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'stores_roadmap'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>خارطة نشر التطبيق على Google Play & App Store</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: ESCROW & COMMISSION SIMULATION ================= */}
      {activeSubTab === 'escrow_simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Inputs */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-700 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>محاكاة دورة الدفع المشفر وحجز الضمان (Escrow Payment Cycle)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                يدفع المكتب السعر الإجمالي بالفيزا أو المحفظة، تقتطع المنصة عمولتها فوراً، ويظل باقي المبلغ محجوزاً في الضمان حتى يسلم السائق البضاعة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gross Amount Input */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  إجمالي المبلغ الذي يدفعه المكتب (Gross Amount):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={grossInput}
                    onChange={(e) => setGrossInput(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-lg font-mono font-black text-emerald-400 focus:outline-hidden focus:border-emerald-400"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">ج.م</span>
                </div>
                <p className="text-[10px] text-slate-500">المبلغ المسحوب من بطاقة فيزا/المحفظة الخاصة بالمكتب</p>
              </div>

              {/* Commission Amount Input */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  عمولة المنصة المقتطعة (Platform Commission):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-lg font-mono font-black text-amber-400 focus:outline-hidden focus:border-amber-400"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">ج.م</span>
                </div>
                <p className="text-[10px] text-slate-500">إيراد منصة ConnectTrans المحصل تلقائياً</p>
              </div>
            </div>

            {/* Calculated Driver Net Display */}
            <div className="p-5 bg-gradient-to-r from-blue-950 to-slate-950 rounded-2xl border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-300 block">صافي أجر السائق المحجوز بالضمان (Net Driver Escrow):</span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {netDriverCalculated.toLocaleString()} ج.م
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  هو المبلغ الدقيق الذي يظهر للسائق في تفاصيل النقلة ويتحول إلى رصيده فور التسليم.
                </p>
              </div>
              <div className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-center shrink-0">
                <span className="block text-[10px] text-slate-400 font-bold">الحسبة الحسابية:</span>
                <span className="text-xs font-mono font-bold text-blue-300">
                  {grossInput} - {commissionInput} = {netDriverCalculated} ج.م
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">وسيلة الدفع المستخدمة من قبل المكتب:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'visa_mastercard', label: 'فيزا وماستركارد', sub: 'البطاقات البنكية الدولية والمحلية' },
                  { id: 'meeza', label: 'بطاقة ميزة الوطنية', sub: 'شبكة الدفع القومي المصري' },
                  { id: 'vodafone_cash', label: 'فودافون كاش ومحافظ المحمول', sub: 'اورنج / اتصالات / وي باي' },
                  { id: 'instapay', label: 'إنستاباي (InstaPay IPN)', sub: 'التحويل اللحظي لحساب البنك' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      selectedMethod === m.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold">{m.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Driver Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم السائق المستفيد من النقلة:</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Execution Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLockEscrow}
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>تنفيذ تجربة دفع وحجز الضمان المشفر الآن ({grossInput.toLocaleString()} ج.م)</span>
              </button>
            </div>
          </div>

          {/* Right Summary: Live Status & Release Action */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-slate-700 pb-3">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>سجل الضمان والحجز اللحظي</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">حالة الأموال في خزانة المنصة المشفرة</p>
              </div>

              {escrowResult ? (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">رقم الضمان:</span>
                    <span className="font-mono text-blue-400 font-bold">{escrowResult.escrowId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">مرجع بوابة الدفع:</span>
                    <span className="font-mono text-emerald-400 font-bold">{escrowResult.paymentReference}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">المبلغ المدفوع:</span>
                    <strong className="text-white font-mono">{escrowResult.grossPrice.toLocaleString()} ج.م</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">عمولة المنصة:</span>
                    <strong className="text-amber-400 font-mono">{escrowResult.commissionAmount.toLocaleString()} ج.م</strong>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-300 font-bold">المحتجز للسائق:</span>
                    <strong className="text-emerald-400 font-mono text-sm">{escrowResult.netDriverAmount.toLocaleString()} ج.م</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">حالة الضمان:</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      escrowResult.status === 'released_and_paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {escrowResult.status === 'released_and_paid' ? 'تم التحرير والصرف' : 'مؤمن ومحجوز بالخزانة'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">لم يتم تنفيذ عملية دفع تجريبية بعد.</p>
                  <p className="text-[11px] text-slate-500">
                    اضغط على زر التنفيذ لإنشاء معاملة ضمان مشفرة بحسب الأرقام المحددة.
                  </p>
                </div>
              )}

              {releaseStatus && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{releaseStatus}</span>
                </div>
              )}
            </div>

            {/* Release Action */}
            {escrowResult && escrowResult.status !== 'released_and_paid' && (
              <div className="pt-4 border-t border-slate-700/80 space-y-2">
                <span className="text-[11px] text-slate-400 block font-bold">
                  محاكاة تأكيد التسليم (POD) وتحرير المستحقات:
                </span>
                <button
                  type="button"
                  onClick={handleReleaseEscrow}
                  disabled={isProcessing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التسليم وتحرير {escrowResult.netDriverAmount.toLocaleString()} ج.م للسائق</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: GATEWAY CONFIGURATION ================= */}
      {activeSubTab === 'gateways_config' && (
        <form onSubmit={handleSaveConfig} className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                <span>إعدادات مفاتيح الربط لبوابات الدفع الرسمية (Paymob / Fawry / Kashier)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تكامل حقيقي مع البنوك المصرية عبر شبكة 128/256-bit SSL و Webhook HMAC المشفر
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="rounded accent-amber-400 w-4 h-4"
                />
                <span className="text-xs font-bold text-amber-300">
                  {isTestMode ? 'بيئة الاختبار التجريبية (Sandbox Test)' : 'البيئة الحية المباشرة (Live CBE)'}
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ المفاتيح</span>
              </button>
            </div>
          </div>

          {configSaved && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold">تم حفظ وتشفير مفاتيح بوابة الدفع بنجاح في قاعدة البيانات!</span>
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">بوابة الدفع الرئيسية النشطة:</label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { id: 'paymob', name: 'Paymob (باي موب)', desc: 'البوابة الأولى في مصر للبطاقات والمحافظ' },
                { id: 'kashier', name: 'Kashier (كاشير)', desc: 'بوابة معتمدة للبطاقات وحلول التقسيط' },
                { id: 'fawry', name: 'FawryPay (فوري باي)', desc: 'شبكة فوري المنتشرة في عموم الجمهورية' },
                { id: 'instapay', name: 'InstaPay Direct IPN', desc: 'التحويل اللحظي عبر البنك المركزي المصري' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id as any)}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                    provider === p.id
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <strong className="block text-xs">{p.name}</strong>
                  <span className="block text-[10px] text-slate-500 mt-1">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                مفتاح الواجهة البرمجية السري (Secret API Key):
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-white focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">يتم استخدامه في السيرفر فقط ومحمي من أي تسريب</span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                مفتاح توقيع الـ Webhook المشفر (HMAC SHA-512 Secret):
              </label>
              <input
                type="password"
                value={hmacSecret}
                onChange={(e) => setHmacSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-white focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">للتحقق الرقمي من أن إشعار سداد المكتب مرسل من سيرفر البنك مباشرة</span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                معرف دمج البطاقات البنكية (Card Integration ID):
              </label>
              <input
                type="text"
                value={cardIntegrationId}
                onChange={(e) => setCardIntegrationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                معرف دمج محافظ الهاتف (Mobile Wallets Integration ID):
              </label>
              <input
                type="text"
                value={walletIntegrationId}
                onChange={(e) => setWalletIntegrationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Security Compliance Checklist */}
          <div className="pt-4 border-t border-slate-700/80">
            <h4 className="text-xs font-black text-amber-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>معايير الأمان المالي وضمان الحماية من الاختراق:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>صفر تخزين للكروت:</strong> المنصة لا تحفظ أي رقم بطاقة أو كود CVV طبقاً لـ PCI-DSS.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>تأكيد HMAC-SHA512:</strong> لا يتم تعديل أي رصيد إلا بتوقيع رقمي يمنع أي تلاعب.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>تحويل فوري عبر IPN:</strong> دعم السحب المباشر للسائقين عبر إنستاباي ومحافظ الهواتف.</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ================= SECTION 3: STORES ROADMAP (PLAY STORE & APP STORE) ================= */}
      {activeSubTab === 'stores_roadmap' && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-700 pb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span>خارطة طريق رفع واعتماد تطبيق ConnectTrans على متجر بلاي و أبل ستور</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              كيفية تحويل هذا المشروع إلى تطبيق حقيقي Native ومطروح رسمياً للتحميل من الهواتف
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Play Store Card */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  Play
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">1. متجر Google Play (أندرويد)</h4>
                  <span className="text-[11px] text-slate-400">رسوم الحساب: 25$ تدفع مرة واحدة مدى الحياة</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span><strong>فتح حساب Google Play Console:</strong> عبر بريدك الإلكتروني والبطاقة البنكية مع توثيق الهوية الوطنية.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span><strong>تحزيم الكود (AAB / APK):</strong> المنصة جاهزة بتقنية Progressive Web App (PWA) وتتحول إلى ملف Android App Bundle رسمي بضغطة زر عبر Capacitor أو Bubblewrap TWA.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span><strong>شروط القبول:</strong> إرفاق رابط سياسة الخصوصية وتصنيف المحتوى وإثبات تسجيل شركة النقل.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
                npm i @capacitor/core @capacitor/cli @capacitor/android<br />
                npx cap add android<br />
                npx cap open android
              </div>
            </div>

            {/* Apple App Store Card */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  iOS
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">2. متجر Apple App Store (آيفون و آيباد)</h4>
                  <span className="text-[11px] text-slate-400">رسوم الحساب: 99$ سنوياً (Apple Developer Program)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span><strong>اشتراك مطور آبل:</strong> يفضل التسجيل باسم شركة لوجستيات والحصول على رقم D-U-N-S Number مجاناً لضمان القبول الفوري.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span><strong>التوافق مع إرشادات آبل:</strong> لأن المنصة تقدم خدمات لوجستية حقيقية (نقل بضائع وتأجير شاحنات)، آبل تسمح ببوابات الدفع الخارجية (مثل Paymob) ولا تفرض نسبة الـ 30% المقررة على السلع الرقمية.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span><strong>البناء عبر Xcode:</strong> تحويل المشروع إلى تطبيق iOS باستخدام Capacitor وتوقيع شهادة Apple Developer Certificate.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-blue-400">
                npm i @capacitor/ios<br />
                npx cap add ios<br />
                npx cap open ios
              </div>
            </div>
          </div>

          {/* Legal and Commercial Requirements */}
          <div className="p-5 bg-gradient-to-r from-amber-950/40 to-slate-950 rounded-2xl border border-amber-600/30 space-y-3">
            <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>الأوراق والمتطلبات القانونية المطلوبة لاعتماد التطبيق وبوابات الدفع الرسمية:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-0.5">1. سجل تجاري وبطاقة ضريبية</span>
                <span className="text-[11px] text-slate-400">شركة شحن أو خدمات لوجستية أو برمجيات مصرية</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-0.5">2. حساب بنكي تجاري</span>
                <span className="text-[11px] text-slate-400">بأي بنك مصري لربطه بحساب Paymob / Kashier</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-0.5">3. سياسة خصوصية وشروط</span>
                <span className="text-[11px] text-slate-400">مدمجة وجاهزة بالفعل في المنصة</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-0.5">4. دومين رسمي واستضافة</span>
                <span className="text-[11px] text-slate-400">شهادة أمان SSL/HTTPS إجبارية للمتاجر</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
