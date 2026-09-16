import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Building2, Truck, Briefcase, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { UserRole, UserAccount } from '../types';
import { INITIAL_USERS } from '../data/egyptLocations';
import { ctStorage } from '../data/connectTransStorage';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (userData: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode: initialMode,
  initialRole = 'company',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Default to company, office, or driver (never admin in public auth modal)
  const [role, setRole] = useState<'company' | 'office' | 'driver'>(
    initialRole === 'admin' ? 'company' : (initialRole as 'company' | 'office' | 'driver')
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyOrLicence, setCompanyOrLicence] = useState('');
  const [governorate, setGovernorate] = useState('السويس');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    if (initialRole && initialRole !== 'admin') {
      setRole(initialRole as 'company' | 'office' | 'driver');
    }
  }, [initialMode, initialRole]);

  if (!isOpen) return null;

  // Category configs
  const categoryDetails = {
    company: {
      name: 'بوابة الشركات والمصانع',
      subtext: 'طلب شاحنات فورية ومجدولة ومتابعة البوالص',
      icon: Building2,
      color: 'emerald',
      bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-500',
      recordLabel: 'رقم السجل التجاري والبطاقة الضريبية:',
      recordPlaceholder: 'مثال: سجل تجاري 88219 / سويس',
      demoUsers: INITIAL_USERS.filter(u => u.role === 'company')
    },
    office: {
      name: 'بوابة مكاتب النقل والوساطة',
      subtext: 'تقديم عروض الأسعار، إدارة الأسطول والقبولات',
      icon: Briefcase,
      color: 'amber',
      bgLight: 'bg-amber-50 text-amber-800 border-amber-300',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50 border-amber-500',
      recordLabel: 'رقم ترخيص مكتب النقل البري:',
      recordPlaceholder: 'مثال: ترخيص 44102 / نقل بضائع',
      demoUsers: INITIAL_USERS.filter(u => u.role === 'office')
    },
    driver: {
      name: 'بوابة أصحاب السيارات والسائقين',
      subtext: 'تصفح عروض المكاتب، قبول الحمولات، وتجنب العودة فارغاً',
      icon: Truck,
      color: 'blue',
      bgLight: 'bg-blue-50 text-blue-800 border-blue-300',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50 border-blue-500',
      recordLabel: 'رقم رخصة القيادة ونوع الشاحنة:',
      recordPlaceholder: 'مثال: رخصة درجة أولى / تريلا فرش 30 طن',
      demoUsers: INITIAL_USERS.filter(u => u.role === 'driver')
    }
  };

  const currentCat = categoryDetails[role];

  const handleQuickDemoLogin = (demoUser: UserAccount) => {
    setSubmitted(true);
    setTimeout(() => {
      // Record in audit log
      ctStorage.addAuditLog({
        actorId: demoUser.id,
        actorName: demoUser.name,
        actorRole: demoUser.role,
        action: 'LOGIN',
        entity: 'user',
        entityId: demoUser.id,
        newValue: `تسجيل دخول سريع بحساب معتمد (${demoUser.name})`
      });

      onSuccess(demoUser);
      setSubmitted(false);
      onClose();
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    setTimeout(() => {
      // Create or locate account
      const newAccount: UserAccount = {
        id: `USR-${role.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
        name: fullName.trim() || (role === 'company' ? 'شركة صناعية جديدة' : role === 'office' ? 'مكتب نقليات معتمد' : 'سائق شاحنة حر'),
        role: role,
        phone: phone.trim() || '01012345678',
        governorate: governorate,
        city: 'المنطقة الرئيسية',
        status: 'active',
        verifiedDocs: true,
        commercialRecordOrLicense: companyOrLicence || (role === 'company' ? 'سجل تجاري 55431' : 'ترخيص 1189'),
        walletBalance: 0,
        rating: 5.0,
        completedTrips: 0,
        truckType: role === 'driver' ? 'تريلا فرش / سطحة' : undefined
      };

      // Record audit log
      ctStorage.addAuditLog({
        actorId: newAccount.id,
        actorName: newAccount.name,
        actorRole: newAccount.role,
        action: mode === 'login' ? 'LOGIN' : 'REGISTER',
        entity: 'user',
        entityId: newAccount.id,
        newValue: `${mode === 'login' ? 'تسجيل دخول' : 'إنشاء حساب جديد'} كـ [${role}]`
      });

      onSuccess(newAccount);
      setSubmitted(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
              role === 'company' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              role === 'office' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            }`}>
              <currentCat.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                {mode === 'login' ? `تسجيل الدخول - ${currentCat.name}` : `تسجيل حساب جديد - ${currentCat.name}`}
              </h3>
              <p className="text-xs text-slate-300">{currentCat.subtext}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Category Tabs (Strictly 3 Commercial Categories) */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر فئة حسابك للوصول المخصص:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('company')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  role === 'company'
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <Building2 className={`w-5 h-5 mb-1.5 ${role === 'company' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="block text-xs font-black">الشركات والمصانع</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">شاحن بضائع</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('office')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  role === 'office'
                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <Briefcase className={`w-5 h-5 mb-1.5 ${role === 'office' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="block text-xs font-black">مكاتب النقل</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">تقديم العروض والأسطول</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  role === 'driver'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-950 ring-2 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <Truck className={`w-5 h-5 mb-1.5 ${role === 'driver' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="block text-xs font-black">أصحاب السيارات</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">قبول الحمولات والسائقين</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Preloaded Logins for Testing */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>دخول سريع بحسابات معتمدة لاختبار هذه الفئة:</span>
              </span>
              <span className="text-[10px] text-slate-500">نقرة واحدة للمصادقة</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentCat.demoUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(user)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-blue-400"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
              <h4 className="text-lg font-black text-slate-900 mb-1">
                {mode === 'login' ? 'تم تسجيل الدخول بنجاح!' : 'تم إنشاء الحساب بنجاح!'}
              </h4>
              <p className="text-xs text-slate-500">جاري توجيهك إلى لوحة عمليات {currentCat.name}...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {role === 'company' ? 'اسم الشركة أو المصنع الرسمي:' : role === 'office' ? 'اسم مكتب النقل والوساطة:' : 'اسم صاحب السيارة أو السائق:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      role === 'company' ? 'مثال: شركة النصر للكيماويات' :
                      role === 'office' ? 'مثال: مكتب الإسكندرية الدولي لنقل البضائع' :
                      'مثال: الأسطى محروس عبد الجواد'
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف أو الجوال (مصر):
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx أو 011xxxxxxxx أو 012xxxxxxxx"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {currentCat.recordLabel}
                  </label>
                  <input
                    type="text"
                    value={companyOrLicence}
                    onChange={(e) => setCompanyOrLicence(e.target.value)}
                    placeholder={currentCat.recordPlaceholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                  role === 'company' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  role === 'office' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>{mode === 'login' ? `دخول فوري إلى ${currentCat.name}` : `تأكيد تسجيل ${currentCat.name}`}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
