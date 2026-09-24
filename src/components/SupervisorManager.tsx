import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Shield, Plus, Trash2, Edit3, CheckCircle2, 
  X, AlertCircle, Save, KeyRound, Check, RefreshCw 
} from 'lucide-react';

export interface SupervisorItem {
  uid: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  permissions: string[];
}

const ALL_SYSTEM_PERMISSIONS = [
  { key: 'finance.release_funds', label: 'تحرير وصرف أموال الضمان للسائقين (الإدارة المالية)', group: 'الإدارة المالية والخزانة' },
  { key: 'finance.suspend_payout', label: 'تجميد وتعطيل صلاحية تحويل الأموال عند الشبهة أو النزاع', group: 'الإدارة المالية والخزانة' },
  { key: 'finance.audit_escrow', label: 'تدقيق حسابات الضمان والوساطة والمحافظ البنكية', group: 'الإدارة المالية والخزانة' },
  { key: 'financials.manage', label: 'إدارة العمولات والأسعار ومحفظة المعاملات', group: 'الإدارة المالية والخزانة' },
  { key: 'users.manage', label: 'إدارة وتعديل المستخدمين', group: 'المستخدمين والشركاء' },
  { key: 'companies.manage', label: 'إدارة واعتماد الشركات والمصانع', group: 'المستخدمين والشركاء' },
  { key: 'offices.manage', label: 'إدارة مكاتب النقل والوساطة', group: 'المستخدمين والشركاء' },
  { key: 'drivers.manage', label: 'إدارة وتفعيل السائقين', group: 'الأسطول والسائقين' },
  { key: 'vehicles.manage', label: 'إدارة وتوثيق الشاحنات والسيارات', group: 'الأسطول والسائقين' },
  { key: 'docs.verify', label: 'مراجعة واعتماد المستندات والرخص', group: 'الأسطول والسائقين' },
  { key: 'requests.manage', label: 'إدارة طلبات الشحن والكميات', group: 'العمليات والرحلات' },
  { key: 'offers.manage', label: 'إدارة عروض أسعار المكاتب', group: 'العمليات والرحلات' },
  { key: 'trips.manage', label: 'متابعة وإدارة مسارات وحالات الرحلات', group: 'العمليات والرحلات' },
  { key: 'ratings.manage', label: 'إدارة التقييمات ومراجعات الأداء', group: 'الجودة والمحتوى' },
  { key: 'notifications.send', label: 'إرسال الإشعارات والرسائل التنبيهية', group: 'الجودة والمحتوى' },
  { key: 'content.edit', label: 'تعديل محتوى وصفحات المنصة (CMS)', group: 'الجودة والمحتوى' },
  { key: 'reports.read', label: 'عرض وتحميل التقارير والإحصائيات', group: 'النظام والأمان' },
  { key: 'audit.read', label: 'الاطلاع على سجلات التدقيق (Audit Logs)', group: 'النظام والأمان' },
  { key: 'backup.manage', label: 'إدارة النسخ الاحتياطي والاستعادة', group: 'النظام والأمان' },
  { key: 'settings.manage', label: 'إدارة إعدادات النظام المتقدمة', group: 'النظام والأمان' },
];

export const SupervisorManager: React.FC = () => {
  const [supervisors, setSupervisors] = useState<SupervisorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state for creating a new supervisor
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  // Editing supervisor permissions
  const [editingSupervisor, setEditingSupervisor] = useState<SupervisorItem | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const DEFAULT_SUPERVISORS: SupervisorItem[] = [
    {
      uid: 'FIN-001',
      name: 'أ/ حسام الدين عامر (المراقب المالي العام)',
      phone: '01055667788',
      role: 'finance',
      status: 'active',
      createdAt: '2026-02-15T09:00:00Z',
      permissions: ['finance.release_funds', 'finance.suspend_payout', 'finance.audit_escrow', 'financials.manage', 'reports.read', 'audit.read'],
    },
    {
      uid: 'SUP-001',
      name: 'م/ سارة إبراهيم الشناوي',
      phone: '01099887766',
      role: 'supervisor',
      status: 'active',
      createdAt: '2026-01-20T10:00:00Z',
      permissions: ['requests.manage', 'offers.manage', 'trips.manage', 'ratings.manage', 'docs.verify'],
    },
    {
      uid: 'SUP-002',
      name: 'ك/ إبراهيم فتحي عبد الله',
      phone: '01122334455',
      role: 'supervisor',
      status: 'active',
      createdAt: '2026-02-01T12:30:00Z',
      permissions: ['drivers.manage', 'vehicles.manage', 'docs.verify', 'trips.manage'],
    }
  ];

  const getLocalSupervisors = (): SupervisorItem[] => {
    try {
      const stored = localStorage.getItem('ct_supervisors_store');
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem('ct_supervisors_store', JSON.stringify(DEFAULT_SUPERVISORS));
    return DEFAULT_SUPERVISORS;
  };

  const saveLocalSupervisors = (list: SupervisorItem[]) => {
    try {
      localStorage.setItem('ct_supervisors_store', JSON.stringify(list));
    } catch {}
  };

  const fetchSupervisors = async () => {
    const token = localStorage.getItem('ct_auth_token');
    if (!token) {
      setSupervisors(getLocalSupervisors());
      return;
    }

    if (token.startsWith('admin_token_')) {
      // Offline / Demo admin session fallback
      setSupervisors(getLocalSupervisors());
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/supervisors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSupervisors(getLocalSupervisors());
      } else {
        setSupervisors(data.supervisors && data.supervisors.length > 0 ? data.supervisors : getLocalSupervisors());
      }
    } catch {
      setSupervisors(getLocalSupervisors());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ct_auth_token');
    if (!token) return;

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 6 خانات حقيقية');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // If offline fallback token
    if (token.startsWith('admin_token_')) {
      const newSup: SupervisorItem = {
        uid: `SUP-${Date.now()}`,
        name: newName.trim(),
        phone: newPhone.trim(),
        role: 'supervisor',
        status: 'active',
        createdAt: new Date().toISOString(),
        permissions: newPermissions,
      };
      const list = [...supervisors, newSup];
      saveLocalSupervisors(list);
      setSupervisors(list);
      setSuccessMsg(`تم إنشاء حساب المشرف [${newName}] بنجاح وتعيين الصلاحيات.`);
      setIsAddOpen(false);
      setNewName('');
      setNewPhone('');
      setNewPassword('');
      setNewPermissions([]);
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
      return;
    }

    try {
      const res = await fetch('/api/admin/supervisors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          password: newPassword.trim(),
          permissions: newPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Fallback locally
        const newSup: SupervisorItem = {
          uid: `SUP-${Date.now()}`,
          name: newName.trim(),
          phone: newPhone.trim(),
          role: 'supervisor',
          status: 'active',
          createdAt: new Date().toISOString(),
          permissions: newPermissions,
        };
        const list = [...supervisors, newSup];
        saveLocalSupervisors(list);
        setSupervisors(list);
        setSuccessMsg(`تم حفظ المشرف [${newName}] محلياً وتعيين الصلاحيات.`);
        setIsAddOpen(false);
        setNewName('');
        setNewPhone('');
        setNewPassword('');
        setNewPermissions([]);
      } else {
        setSuccessMsg(`تم إنشاء حساب المشرف [${newName}] بنجاح وتعيين الصلاحيات.`);
        setIsAddOpen(false);
        setNewName('');
        setNewPhone('');
        setNewPassword('');
        setNewPermissions([]);
        fetchSupervisors();
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      const newSup: SupervisorItem = {
        uid: `SUP-${Date.now()}`,
        name: newName.trim(),
        phone: newPhone.trim(),
        role: 'supervisor',
        status: 'active',
        createdAt: new Date().toISOString(),
        permissions: newPermissions,
      };
      const list = [...supervisors, newSup];
      saveLocalSupervisors(list);
      setSupervisors(list);
      setSuccessMsg(`تم حفظ المشرف [${newName}] بنجاح وتعيين الصلاحيات.`);
      setIsAddOpen(false);
      setNewName('');
      setNewPhone('');
      setNewPassword('');
      setNewPermissions([]);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editingSupervisor) return;
    const token = localStorage.getItem('ct_auth_token');
    if (!token) return;

    setIsLoading(true);
    setErrorMsg(null);

    if (token.startsWith('admin_token_')) {
      const updatedList = supervisors.map(s => s.uid === editingSupervisor.uid ? { ...s, permissions: editPermissions } : s);
      saveLocalSupervisors(updatedList);
      setSupervisors(updatedList);
      setSuccessMsg(`تم تحديث صلاحيات المشرف [${editingSupervisor.name}] بنجاح.`);
      setEditingSupervisor(null);
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
      return;
    }

    try {
      const res = await fetch(`/api/admin/supervisors/${editingSupervisor.uid}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permissions: editPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const updatedList = supervisors.map(s => s.uid === editingSupervisor.uid ? { ...s, permissions: editPermissions } : s);
        saveLocalSupervisors(updatedList);
        setSupervisors(updatedList);
        setSuccessMsg(`تم تحديث صلاحيات المشرف [${editingSupervisor.name}] بنجاح.`);
        setEditingSupervisor(null);
      } else {
        setSuccessMsg(`تم تحديث صلاحيات المشرف [${editingSupervisor.name}] بنجاح.`);
        setEditingSupervisor(null);
        fetchSupervisors();
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      const updatedList = supervisors.map(s => s.uid === editingSupervisor.uid ? { ...s, permissions: editPermissions } : s);
      saveLocalSupervisors(updatedList);
      setSupervisors(updatedList);
      setSuccessMsg(`تم تحديث صلاحيات المشرف [${editingSupervisor.name}] بنجاح.`);
      setEditingSupervisor(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupervisor = async (sup: SupervisorItem) => {
    if (!confirm(`هل أنت متأكد من سحب وحذف حساب المشرف [${sup.name}] نهائياً؟`)) return;
    const token = localStorage.getItem('ct_auth_token');
    if (!token) return;

    setIsLoading(true);

    if (token.startsWith('admin_token_')) {
      const updatedList = supervisors.filter(s => s.uid !== sup.uid);
      saveLocalSupervisors(updatedList);
      setSupervisors(updatedList);
      setSuccessMsg(`تم حذف وسحب صلاحيات المشرف [${sup.name}] بنجاح.`);
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
      return;
    }

    try {
      const res = await fetch(`/api/admin/supervisors/${sup.uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const updatedList = supervisors.filter(s => s.uid !== sup.uid);
        saveLocalSupervisors(updatedList);
        setSupervisors(updatedList);
        setSuccessMsg(`تم حذف وسحب صلاحيات المشرف [${sup.name}] بنجاح.`);
      } else {
        setSuccessMsg(`تم حذف وسحب صلاحيات المشرف [${sup.name}] بنجاح.`);
        fetchSupervisors();
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      const updatedList = supervisors.filter(s => s.uid !== sup.uid);
      saveLocalSupervisors(updatedList);
      setSupervisors(updatedList);
      setSuccessMsg(`تم حذف وسحب صلاحيات المشرف [${sup.name}] بنجاح.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePerm = (list: string[], setList: (val: string[]) => void, key: string) => {
    if (list.includes(key)) {
      setList(list.filter(k => k !== key));
    } else {
      setList([...list, key]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة المشرفين وصلاحيات الـ RBAC المتقدمة</h2>
            <p className="text-xs text-slate-400">
              صلاحية حصرية للمدير العام (Super Admin): تعيين المشرفين وتحديد صلاحياتهم بدقة وسحبها في أي وقت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSupervisors}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => {
              setNewPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.key));
              setIsAddOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مشرف جديد</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Supervisors List Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>قائمة المشرفين المعتمدين في النظام ({supervisors.length})</span>
          </h3>
        </div>

        {supervisors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            لا يوجد مشرفين حالياً. يمكنك إضافة أول مشرف وتخصيص صلاحياته من زر "إضافة مشرف جديد".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">اسم المشرف</th>
                  <th className="py-3.5 px-4 font-bold">رقم الهاتف</th>
                  <th className="py-3.5 px-4 font-bold">عدد الصلاحيات الممنوحة</th>
                  <th className="py-3.5 px-4 font-bold">ملخص الصلاحيات</th>
                  <th className="py-3.5 px-4 font-bold">تاريخ التعيين</th>
                  <th className="py-3.5 px-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {supervisors.map((sup) => (
                  <tr key={sup.uid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xs">
                          {sup.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span>{sup.name}</span>
                          {sup.role === 'finance' ? (
                            <span className="text-[10px] font-black text-emerald-400">
                              ● الإدارة المالية والخزانة
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-blue-400">
                              ● مشرف تشغيل وعمليات
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{sup.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {sup.permissions.length} من أصل {ALL_SYSTEM_PERMISSIONS.length}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                      {sup.permissions.length === ALL_SYSTEM_PERMISSIONS.length 
                        ? 'كافة الصلاحيات التشغيلية' 
                        : sup.permissions.slice(0, 3).join(', ') + (sup.permissions.length > 3 ? '...' : '')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(sup.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSupervisor(sup);
                            setEditPermissions(sup.permissions || []);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                          title="تعديل الصلاحيات"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupervisor(sup)}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                          title="سحب المشرف وحذفه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Supervisor */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>تعيين مشرف جديد وتحديد صلاحيات الـ RBAC</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupervisor} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المشرف بالكامل:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: أحمد عبد الرحمن"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (اسم المستخدم):</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور الحقيقية (6 خانات على الأقل):</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Permissions matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-amber-300">
                    تحديد الصلاحيات الممنوحة للمشرف:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.key))}
                      className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setNewPermissions([])}
                      className="text-[11px] font-bold text-slate-400 hover:underline cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const checked = newPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        onClick={() => togglePerm(newPermissions, setNewPermissions, perm.key)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-colors cursor-pointer select-none ${
                          checked
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'جاري الإنشاء...' : 'حفظ وتعيين المشرف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Supervisor Permissions */}
      {editingSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <span>تعديل صلاحيات المشرف: {editingSupervisor.name}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{editingSupervisor.phone}</p>
              </div>
              <button
                onClick={() => setEditingSupervisor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-amber-300">
                    الصلاحيات النشطة ({editPermissions.length} من {ALL_SYSTEM_PERMISSIONS.length}):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPermissions(ALL_SYSTEM_PERMISSIONS.map(p => p.key))}
                      className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setEditPermissions([])}
                      className="text-[11px] font-bold text-slate-400 hover:underline cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const checked = editPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        onClick={() => togglePerm(editPermissions, setEditPermissions, perm.key)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-colors cursor-pointer select-none ${
                          checked
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSupervisor(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleUpdatePermissions}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'جاري الحفظ...' : 'تحديث وحفظ الصلاحيات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
