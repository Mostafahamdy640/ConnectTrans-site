import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, X, KeyRound } from 'lucide-react';
import { UserAccount } from '../types';
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

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passcode: adminPasscode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsVerifying(false);
        setErrorMsg(data.error || 'رمز المرور الأمني غير صحيح أو الدخول غير مصرح به');
        return;
      }

      // Store JWT token safely
      if (data.token) {
        localStorage.setItem('ct_auth_token', data.token);
      }

      const adminAccount: UserAccount = {
        id: data.user.uid,
        name: data.user.name,
        role: 'admin',
        phone: data.user.phone,
        governorate: data.user.governorate || 'القاهرة',
        city: data.user.city || 'مدينة نصر',
        status: 'active',
        verifiedDocs: true,
        walletBalance: data.user.walletBalance || 0,
        rating: data.user.rating || 5.0,
        completedTrips: 1840,
      };

      setIsVerifying(false);
      onSuccess(adminAccount);
      onClose();
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg('تعذر الاتصال بخادم المصادقة. يرجى التحقق من الشبكة.');
    }
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
              هذه البوابة مخصصة حصرياً للمدير العام وفريق إدارة العمليات في ConnectTrans. التحقق يتم عبر خادم التشفير وقاعدة بيانات PostgreSQL.
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
                <span>جاري التحقق عبر خادم التشفير...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>المصادقة والدخول للوحة الإدارة</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
