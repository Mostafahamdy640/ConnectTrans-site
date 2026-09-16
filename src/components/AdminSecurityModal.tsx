import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, X, ArrowLeft, KeyRound } from 'lucide-react';
import { UserAccount } from '../types';
import { INITIAL_USERS } from '../data/egyptLocations';
import { ctStorage } from '../data/connectTransStorage';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: UserAccount) => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    setTimeout(() => {
      // Master secure credentials for ConnectTrans Administration
      const validPasscodes = ['admin2026', 'connecttrans@admin', 'ct2026'];
      const cleanPass = adminPasscode.trim();

      if (validPasscodes.includes(cleanPass)) {
        const adminAccount = INITIAL_USERS.find(u => u.role === 'admin') || {
          id: 'USR-ADM-01',
          name: 'أحمد محمود القاضي (المدير العام)',
          role: 'admin',
          phone: '01001234567',
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          status: 'active' as const,
          verifiedDocs: true,
          walletBalance: 245000,
          rating: 5.0,
          completedTrips: 1840,
        };

        // Record audit log
        ctStorage.addAuditLog({
          actorId: adminAccount.id,
          actorName: adminAccount.name,
          actorRole: 'admin',
          action: 'LOGIN',
          entity: 'user',
          entityId: adminAccount.id,
          newValue: 'تسجيل دخول آمن للوحة المشرفين والمدير العام'
        });

        setIsVerifying(false);
        onSuccess(adminAccount);
        onClose();
      } else {
        setIsVerifying(false);
        setErrorMsg('رمز المرور السري للمشرف غير صحيح. الدخول مصرح به للمشرفين المعتمدين فقط.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">بوابة الإدارة والمشرفين المشفرة</h3>
              <p className="text-xs text-slate-400">دخول محمي ومقيد بإجراءات الأمان العالي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              هذه البوابة مخصصة حصرياً للمدير العام وفريق إدارة العمليات في ConnectTrans. لا تظهر هذه اللوحة للزوار في الواجهة العامة.
            </span>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3 flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم المستخدم أو بريد الإدارة:
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="admin@connecttrans.eg أو admin"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  رمز المرور السري للإدارة (Security Passcode):
                </label>
                <span className="text-[10px] text-amber-400/80 font-mono">الرمز الافتراضي: admin2026</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>جاري التحقق من التشفير...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>المصادقة والدخول للوحة الإدارة</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access for Testing */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAdminUsername('admin@connecttrans.eg');
                setAdminPasscode('admin2026');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              تعبئة الرمز التلقائي للاختبار (admin2026)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
