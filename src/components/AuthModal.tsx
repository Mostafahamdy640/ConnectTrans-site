import React, { useState } from 'react';
import { X, LogIn, UserPlus, Building2, Truck, Briefcase, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (userData: { name: string; role: UserRole }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode: initialMode,
  initialRole = 'company',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyOrLicence, setCompanyOrLicence] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSuccess({
        name: fullName || (mode === 'login' ? 'مستخدم تجريبي' : 'عضو مسجل حديثاً'),
        role
      });
      setSubmitted(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black">
                {mode === 'login' ? 'تسجيل الدخول إلى ConnectTrans' : 'إنشاء حساب جديد في ConnectTrans'}
              </h3>
              <p className="text-xs text-slate-300">
                {mode === 'login' ? 'أهلاً بعودتك! تابع شحناتك ورحلاتك' : 'انضم الآن واستفد من عمولة مجانية 100%'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Mode Switcher */}
        <div className="p-6">
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تسجيل حساب جديد
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
              <h4 className="text-lg font-black text-slate-900 mb-1">
                {mode === 'login' ? 'تم تسجيل الدخول بنجاح!' : 'تم إنشاء الحساب وتفعيله!'}
              </h4>
              <p className="text-xs text-slate-500">جاري توجيهك إلى لوحة التحكم الخاصة بك...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection (especially on Register) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">فئة الحساب والصلاحيات (4 فئات معتمدة):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRole('company')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'company'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="block text-[11px] font-black">الشركات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('driver')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'driver'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Truck className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span className="block text-[11px] font-black">صاحب سيارة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('office')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'office'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-100'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                    <span className="block text-[11px] font-black">مكتب نقل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-slate-900 border-amber-500 text-amber-400 ring-2 ring-amber-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                    <span className="block text-[11px] font-black">المدير العام</span>
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالكامل أو اسم المنشأة:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: شركة سيراميكا كليوباترا / الأسطى محروس عبد الجواد"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف أو الجوال (مصر):</label>
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
                    {role === 'company' ? 'رقم السجل التجاري المصري:' : role === 'driver' ? 'رقم رخصة القيادة أو لوحة السيارة:' : role === 'admin' ? 'كود المشرف السري المعتمد:' : 'رقم ترخيص مكتب النقل البري:'}
                  </label>
                  <input
                    type="text"
                    value={companyOrLicence}
                    onChange={(e) => setCompanyOrLicence(e.target.value)}
                    placeholder="أدخل الرقم للمصادقة وتفعيل الحساب"
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer mt-2"
              >
                {mode === 'login' ? 'دخول فوري' : 'تأكيد التسجيل المجاني'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
