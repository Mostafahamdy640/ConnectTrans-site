import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Database, 
  Wifi, 
  RefreshCw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  Code2,
  Terminal,
  HelpCircle
} from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'sync' | 'publish'>('android');
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if running as installed standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!installPromptEvent) {
      alert('لتثبيت التطبيق على جهازك، اضغط على زر خيارات المتصفح (⋮) في أعلى المتصفح ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
      return;
    }

    setIsInstalling(true);
    try {
      await installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    } finally {
      setIsInstalling(false);
      setInstallPromptEvent(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header with App Brand */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">تطبيق ConnectTrans للهواتف الذكية</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    مزامنة سحابية حية
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  تطبيق متكامل لأندرويد وآيفون يعمل بنفس بيانات الموقع لحظياً
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-0 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('android')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'android'
                  ? 'border-amber-400 text-amber-300 font-black'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <span>أندرويد (Google Play)</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'border-amber-400 text-amber-300 font-black'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <span>آيفون (Apple App Store)</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'sync'
                  ? 'border-amber-400 text-amber-300 font-black'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>كيف تُسحب البيانات من الموقع؟</span>
            </button>

            <button
              onClick={() => setActiveTab('publish')}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'publish'
                  ? 'border-amber-400 text-amber-300 font-black'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>دليل النشر والرفع للمتاجر</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* TAB 1: ANDROID & GOOGLE PLAY */}
          {activeTab === 'android' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900">تحميل تطبيق ConnectTrans لأجهزة أندرويد</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      يعمل التطبيق على جميع هواتف أندرويد (سامسونج، شاومي، هواوي، أوبو، إلخ) ويتصل بقاعدة بيانات المنصة مباشرة لمتابعة الشحنات والرحلات لحظة بلحظة.
                    </p>
                  </div>
                </div>

                {/* Google Play Store Badge / Download Button */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="#download-google-play"
                    onClick={(e) => {
                      e.preventDefault();
                      handleInstallPWA();
                    }}
                    className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400">متاح الآن على</span>
                      <span className="block text-xs font-black text-white">Google Play Store</span>
                    </div>
                  </a>

                  <button
                    onClick={handleInstallPWA}
                    disabled={isInstalling}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl shadow-md font-black text-xs transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isInstalled ? 'التطبيق مثبت بالفعل على جهازك' : 'تثبيت فوري مباشر (PWA Web App)'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions for Android Users */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h5 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>طريقتان سهلتان لتشغيل التطبيق على هاتفك:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="font-black text-blue-700 block">1. عبر متجر Google Play:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      يتم تنزيل حزمة التطبيق (APK/AAB) وتثبيتها مباشرة، مع استقبال إشعارات الرحلات الفورية وصوت التنبيهات.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="font-black text-emerald-700 block">2. تثبيت مباشر وتلقائي للتطبيق (PWA):</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      افتح الموقع من هاتف الأندرويد في متصفح Chrome، واضغط «تثبيت التطبيق» لتجده فوراً على شاشة هاتفك مع شاشة كاملة وبدون استهلاك للذاكرة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLE APP STORE (iOS) */}
          {activeTab === 'ios' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 border border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0 border border-white/20 shadow-md">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white">تطبيق ConnectTrans لأجهزة iPhone و iPad</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      تطبيق مصمم خصيصاً لنظام iOS بتوافق كامل، يمنحك تجربة سلسة وسريعة على هواتف آبل مع أمان فائق.
                    </p>
                  </div>
                </div>

                {/* App Store Badge Button */}
                <div className="mt-5">
                  <a
                    href="#download-apple-store"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('لتثبيت التطبيق على الآيفون: اضغط زر المشاركة (Share) أسفل متصفح Safari، ثم اختر «إضافة إلى الشاشة الرئيسية Add to Home Screen».');
                    }}
                    className="inline-flex items-center gap-3 bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-2xl shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer font-black text-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 font-bold">متوفر قريباً على</span>
                      <span className="block text-xs font-black text-slate-900">Apple App Store</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Step-by-Step for iOS Safari Users */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
                <h5 className="text-xs font-black text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>خطوات تثبيت التطبيق على الآيفون فوراً (بدون انتظار المتجر):</span>
                </h5>
                <ol className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>افتح موقع ConnectTrans على هاتفك في متصفح <strong>Safari</strong> الرسمي.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      اضغط على أيقونة <strong>المشاركة</strong>
                      <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                      الموجودة في الشريط السفلي للمتصفح.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      مرر للأسفل واضغط على <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" />
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span>اضغط <strong>«إضافة» (Add)</strong> بأعلى اليمين؛ ستجد أيقونة ConnectTrans ظهرت على شاشة هاتفك مثل أي تطبيق من الآب ستور وتعمل بكامل الشاشة وبنفس بياناتك!</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: DATA SYNCHRONIZATION ARCHITECTURE */}
          {activeTab === 'sync' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-200" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">كيف تُسحب البيانات من الموقع إلى برنامج الهاتف؟</h4>
                    <span className="text-xs text-blue-300 font-bold">بنية سحابية موحدة ومتزامنة لحظياً (Single Source of Truth)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  تطبيق الهاتف (سواء أندرويد أو آيفون) والموقع الإلكتروني على الكمبيوتر لا يعملان بشكل منفصل، بل يتصلان بنفس خادم الـ API وقاعدة بيانات PostgreSQL المركزية:
                </p>

                {/* Architecture Sync Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/80">
                    <span className="block font-black text-amber-300 mb-1">1. موقع الويب (الكمبيوتر)</span>
                    <p className="text-[11px] text-slate-300">
                      الشركات ومكاتب النقل تضيف طلبات الشحن وتتابع العروض وإصدار البوالص.
                    </p>
                  </div>

                  <div className="bg-blue-900/60 p-3.5 rounded-xl border border-blue-500/40">
                    <Database className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <span className="block font-black text-white mb-1">2. السيرفر وقاعدة البيانات</span>
                    <p className="text-[11px] text-blue-200 font-mono">
                      PostgreSQL + Express REST API
                    </p>
                  </div>

                  <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/80">
                    <span className="block font-black text-emerald-300 mb-1">3. تطبيق الهاتف (أندرويد وآيفون)</span>
                    <p className="text-[11px] text-slate-300">
                      السائق يستقبل إشعار الطلب فورياً، يقبل الحمولة، ويحدث حالة التوصيل من الطريق.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guarantee points */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
                <h5 className="font-black text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>نتائج المزامنة الفورية للمستخدمين:</span>
                </h5>
                <ul className="space-y-1.5 text-slate-700 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span><strong>حساب واحد مشترك:</strong> يمكنك تسجيل الدخول بنفس رقم الهاتف وكلمة المرور من الموقع أو التطبيق في أي وقت.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span><strong>مزامنة فورية للرحلات:</strong> أي تعديل يجريه السائق من هاتفه (مثل «بدء الرحلة» أو «تم التسليم») يظهر فوراً على شاشة الشركة في الموقع.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span><strong>المحفظة والعمولات:</strong> رصيد الحساب والعمولات موحدة ومحمية على السيرفر المركزي.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLISHING GUIDE FOR PLATFORM OWNER */}
          {activeTab === 'publish' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">الدليل التقني الكامل: تحويل المنصة لتطبيق ورفعه على Google Play و App Store</h4>
                    <p className="text-xs text-slate-400">ربط مباشر بنسبة 100% مع نفس الموقع وقاعدة البيانات المركزية</p>
                  </div>
                </div>

                {/* Conceptual Strategy Card */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-blue-500/30 text-xs space-y-2">
                  <span className="font-black text-blue-400 block text-sm">💡 كيف يرتبط التطبيق بالموقع مباشرة دون الحاجة لبرمجة تطبيقين منفصلين؟</span>
                  <p className="text-slate-300 leading-relaxed">
                    باستخدام تقنية <strong>Capacitor Native Bridge</strong> أو <strong>TWA (Trusted Web Activity)</strong>، يتم تغليف كود الويب داخل غلاف أصلي (Native Shell) معتمد رسمياً من Google و Apple.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-emerald-400 block mb-1">النمط الحي (Live Server Sync):</strong>
                      <span className="text-slate-400">التطبيق يفتح عنوان موقعك المباشر؛ أي تعديل تبرمجه في الموقع ينعكس تلقائياً في هواتف المستخدمين دون الحاجة لإعادة رفع التطبيق للمتجر كل مرة!</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-purple-400 block mb-1">الوصول للمزايا الأصلية (Native APIs):</strong>
                      <span className="text-slate-400">الوصول الكامل لكاميرا الهاتف لتصوير البوالص، نظام الإشعارات المنبثقة (Push Notifications)، ونظام الـ GPS لتتبع حركة الشاحنات.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Step 1: Android & Google Play Console */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-emerald-400 text-sm">1. خطوات تجهيز ورفع تطبيق Google Play (أندرويد)</h5>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono">ملف Android App Bundle (.aab)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      1. فتح حساب مطور على <strong>Google Play Console</strong> (رسوم تدفع لمرة واحدة 25$).<br/>
                      2. تثبيت أداة Capacitor وتشغيل الأوامر التالية داخل مجلد المشروع:
                    </p>
                    <pre className="bg-black/90 p-3 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto text-left dir-ltr">
{`# تثبيت الحزم الأساسية
npm install @capacitor/core @capacitor/cli @capacitor/android

# تهيئة التطبيق باسم وهوية ConnectTrans
npx cap init ConnectTrans com.connecttrans.app --web-dir dist

# إضافة منصة الأندرويد وبناء المشروع
npm run build
npx cap add android
npx cap sync`}
                    </pre>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                      <span className="text-amber-400 font-bold block">ملف الإعدادات (capacitor.config.json):</span>
                      <pre className="bg-black/70 p-2.5 rounded-lg text-blue-300 font-mono text-[10px] overflow-x-auto text-left dir-ltr">
{`{
  "appId": "com.connecttrans.app",
  "appName": "ConnectTrans",
  "webDir": "dist",
  "server": {
    "url": "https://your-domain.com",
    "cleartext": false
  }
}`}
                      </pre>
                      <span className="text-[10px] text-slate-400 block">
                        * بوضع رابط موقعك في خانة <code>server.url</code>، سيتصل التطبيق بالموقع مباشرة وتكون كل التحديثات والبيانات متطابقة لحظياً.
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      3. فتح المشروع في <strong>Android Studio</strong> عبر الأمر <code>npx cap open android</code>.<br/>
                      4. اختيار <strong>Build ➔ Generate Signed Bundle / APK ➔ Android App Bundle (.aab)</strong>.<br/>
                      5. رفع ملف <code>.aab</code> في مسار الإصدار بـ Google Play Console، وإدخال وصف التطبيق ولقطات الشاشة وسياسة الخصوصية.
                    </p>
                  </div>

                  {/* Step 2: iOS & Apple App Store */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-blue-400 text-sm">2. خطوات تجهيز ورفع تطبيق Apple App Store (آيفون)</h5>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-mono">مشروع Xcode (.xcarchive)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      1. الاشتراك في برنامج مطوري آبل <strong>Apple Developer Program</strong> (99$ سنوياً).<br/>
                      2. تشغيل الأوامر التالية على جهاز Mac:
                    </p>
                    <pre className="bg-black/90 p-3 rounded-xl text-blue-400 font-mono text-[11px] overflow-x-auto text-left dir-ltr">
{`# تثبيت دعم iOS
npm install @capacitor/ios
npx cap add ios
npx cap sync

# فتح المشروع داخل بيئة Xcode
npx cap open ios`}
                    </pre>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      3. في Xcode: تحديد حسابك المطور في تبويب <strong>Signing & Capabilities</strong> وتفعيل خيارات <strong>Push Notifications</strong> و <strong>Background Modes (Location)</strong> لتتبع الشاحنات.<br/>
                      4. الضغط على <strong>Product ➔ Archive</strong> ثم <strong>Distribute App</strong> لرفع النسخة لـ <strong>TestFlight</strong> ثم إرسالها لمراجعة متجر آبل.<br/>
                      5. اجتياز شروط آبل (Guideline 4.2): يتيح التطبيق تجربة مستخدم كاملة وخدمات حقيقية للمستخدمين والتتبع الميداني مما يضمن قبوله السريع.
                    </p>
                  </div>

                  {/* Step 3: Shared Database & Real-Time Sync */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                    <h5 className="font-black text-amber-400 text-sm">3. كيف تتصل جميع الأطراف بقاعدة البيانات المشتركة؟</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <strong className="text-white block mb-1">تسجيل الدخول الموحد (JWT):</strong>
                        حساب واحد يعمل في الويب، الأندرويد، والآيفون بنفس رقم الهاتف وكلمة المرور.
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <strong className="text-white block mb-1">الخزانة والمحفظة (Escrow):</strong>
                        العمليات المالية تُحسم وتُضاف على نفس الخادم المركزي لمنع أي تكرار أو ازدواجية.
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <strong className="text-white block mb-1">الإشعارات اللحظية (Push):</strong>
                        ربط Firebase Cloud Messaging (FCM) لإرسال تنبيه صوتي للسائق فور نشر طلب شحن جديد.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام آمن ومشفر 100% معتمد من ConnectTrans</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
