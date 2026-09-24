import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Percent, Edit3, Settings, 
  CheckCircle2, XCircle, AlertCircle, Plus, Trash2, 
  DollarSign, TrendingUp, Search, Eye, Save, RefreshCw, 
  Building2, Briefcase, Truck, Award, FileText, Check,
  Layers, Database, Star
} from 'lucide-react';
import { CommissionProfile, CommissionTier, UserAccount, SitePageContent, UserRole } from '../types';
import { calculateTripCommission } from '../data/egyptLocations';
import { ctStorage } from '../data/connectTransStorage';
import { ConnectTransEntityManager } from './ConnectTransEntityManager';
import { ConnectTransWorkflowManager } from './ConnectTransWorkflowManager';
import { RequestLifecycleManager } from './RequestLifecycleManager';
import { TripRatingManager } from './TripRatingManager';
import { AuditAndBackupManager } from './AuditAndBackupManager';
import { SupervisorManager } from './SupervisorManager';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { FinancialAdministrationManager } from './FinancialAdministrationManager';
import { UserCheck, CreditCard } from 'lucide-react';

interface AdminPanelProps {
  users: UserAccount[];
  onUpdateUsers: (users: UserAccount[]) => void;
  commissionProfiles: CommissionProfile[];
  onUpdateCommissionProfiles: (profiles: CommissionProfile[]) => void;
  siteContent: SitePageContent;
  onUpdateSiteContent: (content: SitePageContent) => void;
  onNavigateToHome?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  onUpdateUsers,
  commissionProfiles,
  onUpdateCommissionProfiles,
  siteContent,
  onUpdateSiteContent,
  onNavigateToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'entities' | 'requests' | 'trips' | 'commission' | 'users' | 'supervisors' | 'finance' | 'backup' | 'cms' | 'gateways'>('workflow');
  
  // Commission Profiles state
  const [profiles, setProfiles] = useState<CommissionProfile[]>(commissionProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    commissionProfiles.find(p => p.active)?.id || commissionProfiles[0]?.id || ''
  );
  const [multiplierInput, setMultiplierInput] = useState<number>(1);
  const [testTripPrice, setTestTripPrice] = useState<number>(4500);

  // Users state
  const [userList, setUserList] = useState<UserAccount[]>(users);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);

  // Sync users from PostgreSQL backend if admin is authenticated
  useEffect(() => {
    const token = localStorage.getItem('ct_auth_token');
    if (token) {
      fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.users && Array.isArray(data.users)) {
          const mapped: UserAccount[] = data.users.map((u: any) => ({
            id: u.uid || u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            governorate: u.governorate || 'القاهرة',
            city: u.city || '',
            rating: u.rating || 5,
            reviewsCount: 0,
            verifiedDocs: u.verifiedDocs ?? (u.status === 'approved' || u.status === 'active'),
            status: u.status === 'approved' ? 'active' : u.status,
            createdAt: u.createdAt || new Date().toISOString(),
          }));
          setUserList(mapped);
          onUpdateUsers(mapped);
        }
      })
      .catch(() => {});
    }
  }, []);

  // Site CMS state
  const [cmsContent, setCmsContent] = useState<SitePageContent>(siteContent);
  const [cmsSavedAlert, setCmsSavedAlert] = useState(false);
  const [commissionSavedAlert, setCommissionSavedAlert] = useState(false);

  const currentProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  // Handler: Set active commission profile
  const handleActivateProfile = (id: string) => {
    const updated = profiles.map(p => ({
      ...p,
      active: p.id === id
    }));
    setProfiles(updated);
    setSelectedProfileId(id);
    onUpdateCommissionProfiles(updated);
  };

  // Handler: Update multiplier for current profile
  const handleUpdateMultiplier = (val: number) => {
    const updated = profiles.map(p => {
      if (p.id === currentProfile.id) {
        return { ...p, multiplier: val };
      }
      return p;
    });
    setProfiles(updated);
    onUpdateCommissionProfiles(updated);
  };

  // Handler: Update a tier in current profile
  const handleUpdateTier = (tierId: string, updates: Partial<CommissionTier>) => {
    const updated = profiles.map(p => {
      if (p.id === currentProfile.id) {
        return {
          ...p,
          tiers: p.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t)
        };
      }
      return p;
    });
    setProfiles(updated);
    onUpdateCommissionProfiles(updated);
  };

  // Handler: Add new tier to current profile
  const handleAddNewTier = () => {
    const lastTier = currentProfile.tiers[currentProfile.tiers.length - 1];
    const newMin = lastTier ? lastTier.maxPrice + 1 : 0;
    const newTier: CommissionTier = {
      id: `tier-${Date.now()}`,
      minPrice: newMin,
      maxPrice: newMin + 20000,
      type: 'fixed',
      shipperFee: 50,
      transporterFee: 75,
      label: `شريحة جديدة من ${newMin.toLocaleString()} إلى ${(newMin + 20000).toLocaleString()} ج.م`
    };

    const updated = profiles.map(p => {
      if (p.id === currentProfile.id) {
        return { ...p, tiers: [...p.tiers, newTier] };
      }
      return p;
    });
    setProfiles(updated);
    onUpdateCommissionProfiles(updated);
  };

  // Handler: Remove tier
  const handleRemoveTier = (tierId: string) => {
    if (currentProfile.tiers.length <= 1) {
      alert('يجب الإبقاء على شريحة واحدة على الأقل');
      return;
    }
    const updated = profiles.map(p => {
      if (p.id === currentProfile.id) {
        return { ...p, tiers: p.tiers.filter(t => t.id !== tierId) };
      }
      return p;
    });
    setProfiles(updated);
    onUpdateCommissionProfiles(updated);
  };

  // Handler: Save Commission Profiles
  const handleSaveCommission = () => {
    onUpdateCommissionProfiles(profiles);
    setCommissionSavedAlert(true);
    setTimeout(() => setCommissionSavedAlert(false), 3000);
  };

  // Handler: Update user status or verification
  const handleToggleUserVerification = (userId: string) => {
    let targetVerified = false;
    const updated = userList.map(u => {
      if (u.id === userId) {
        targetVerified = !u.verifiedDocs;
        return { 
          ...u, 
          verifiedDocs: !u.verifiedDocs,
          status: (!u.verifiedDocs ? 'active' : 'pending_verification') as any 
        };
      }
      return u;
    });
    setUserList(updated);
    onUpdateUsers(updated);

    const token = localStorage.getItem('ct_auth_token');
    if (token) {
      fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ verifiedDocs: targetVerified })
      }).catch(() => {});
    }
  };

  const handleUpdateUserStatus = (userId: string, newStatus: 'active' | 'pending_verification' | 'suspended') => {
    const updated = userList.map(u => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUserList(updated);
    onUpdateUsers(updated);

    const token = localStorage.getItem('ct_auth_token');
    if (token) {
      fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});
    }
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    const updated = userList.map(u => u.id === selectedUserForEdit.id ? selectedUserForEdit : u);
    setUserList(updated);
    onUpdateUsers(updated);
    setSelectedUserForEdit(null);
  };

  // Handler: Save CMS content
  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteContent(cmsContent);
    setCmsSavedAlert(true);
    setTimeout(() => setCmsSavedAlert(false), 3000);
  };

  // Filtered users
  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                          u.phone.includes(userSearchTerm) ||
                          u.city.includes(userSearchTerm) ||
                          u.governorate.includes(userSearchTerm);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate live commission test calculation
  const calculatedTest = calculateTripCommission(testTripPrice, currentProfile);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">لوحة الإدارة والمشرفين (ConnectTrans مصر)</h1>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-md border border-amber-500/30">
                  صلاحيات كاملة Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">التحكم في بروفايلات العمولات، إدارة بيانات الفئات الـ 4، وتعديل محتوى المنصة</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToHome && (
              <button
                onClick={onNavigateToHome}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                العودة للواجهة الرئيسية
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'workflow'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>منظومة ConnectTrans الكاملة (شركات - مكاتب - سيارات)</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'entities'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>إدارة الحسابات والمركبات</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>مستخدمو النظام الأساسيون</span>
          </button>

          <button
            onClick={() => setActiveTab('supervisors')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'supervisors'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>المشرفين وصلاحيات الـ RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'finance'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>الإدارة المالية وتحرير الأموال (Treasury & Escrow)</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>طلبات النقل والكميات والقبول</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'trips'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>الرحلات والتقييمات</span>
          </button>

          <button
            onClick={() => setActiveTab('commission')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'commission'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>العمولات والرسوم (الفترة التجريبية)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>الحفظ الدائم والـ Backup وسجل العمليات</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'cms'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span>نصوص وصفحات الموقع (CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'gateways'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>بوابات الدفع ومتجر التطبيقات (Stores & CBE Pay)</span>
          </button>
        </div>

        {/* ================= TAB: CONNECTTRANS WORKFLOW ================= */}
        {activeTab === 'workflow' && (
          <ConnectTransWorkflowManager />
        )}

        {/* ================= TAB: CONNECTTRANS ENTITIES ================= */}
        {activeTab === 'entities' && (
          <ConnectTransEntityManager />
        )}

        {/* ================= TAB: REQUESTS & ACCEPTANCE ================= */}
        {activeTab === 'requests' && (
          <RequestLifecycleManager />
        )}

        {/* ================= TAB: TRIPS & RATINGS ================= */}
        {activeTab === 'trips' && (
          <TripRatingManager />
        )}

        {/* ================= TAB: BACKUP & AUDIT LOGS ================= */}
        {activeTab === 'backup' && (
          <AuditAndBackupManager />
        )}

        {/* ================= TAB 1: COMMISSION SYSTEM ================= */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            
            {commissionSavedAlert && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold">تم حفظ وتحديث بروفايل العمولات وتطبيقه فوراً على كافة المعاملات والرحلات!</span>
              </div>
            )}

            {/* Profile Selector and Multiplier Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Selection */}
              <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-white">اختيار البروفايل النشط للعمولات</h3>
                  </div>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                    البروفايل المفعل الآن: {currentProfile.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {profiles.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleActivateProfile(p.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between ${
                        p.id === currentProfile.id
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg ring-1 ring-amber-400/30'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black">{p.name}</span>
                          {p.active && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{p.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold border-t border-slate-700/60 pt-2 text-amber-400">
                        <span>مضاعف البروفايل: {p.multiplier}x</span>
                        <span className="text-xs text-slate-300">{p.tiers.length} شرائح</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multiplier & Quick Profile Multiplier Actions */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-white font-black">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span>مضاعفة أو تخفيض العمولات فورياً (Multiplier)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    يمكنك مضاعفة عمولة البروفايل بالكامل (مثلاً 2x في المواسم أو 0.5x للتخفيض الترويجي) بضغطة زر دون تعديل كل شريحة يدوياً.
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    {[0, 0.5, 1.0, 1.5, 2.0, 3.0].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleUpdateMultiplier(m)}
                        className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                          currentProfile.multiplier === m
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {m === 0 ? '0% مجاني' : `${m}x`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-700/60 rounded-2xl text-xs">
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>المضاعف الفعلي الآن:</span>
                    <span className="text-amber-400 font-black">{currentProfile.multiplier}x</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    يتم ضرب جميع مبالغ ونسب الشرائح في هذا العامل تلقائياً قبل الحسم من العميل وصاحب السيارة.
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Commission Tiers Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">شرائح تسعير العمولة (من 0 إلى 5,000 ج.م، ومن 5,000 إلى 20,000 ج.م، إلخ)</h3>
                  <p className="text-xs text-slate-400">
                    حدد عمولة المصنع/الشركة وعمولة السائق بشكل مستقل سواء كانت مبالغ ثابتة (Fixed EGP) أو نسب مئوية (%) أو صفرية
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddNewTier}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>إضافة شريحة تسعير جديدة</span>
                  </button>

                  <button
                    onClick={handleSaveCommission}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ واعتماد البروفايل</span>
                  </button>
                </div>
              </div>

              {/* Tiers List */}
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-700 font-black">
                      <th className="p-3">وصف الشريحة</th>
                      <th className="p-3">الحد الأدنى للسعر (ج.م)</th>
                      <th className="p-3">الحد الأقصى للسعر (ج.م)</th>
                      <th className="p-3">نوع الخصم</th>
                      <th className="p-3 text-emerald-400">عمولة الشركة / الشاحن</th>
                      <th className="p-3 text-blue-400">عمولة السائق / الناقل</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {currentProfile.tiers.map((tier, idx) => (
                      <tr key={tier.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="p-3">
                          <input
                            type="text"
                            value={tier.label}
                            onChange={(e) => handleUpdateTier(tier.id, { label: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={tier.minPrice}
                            onChange={(e) => handleUpdateTier(tier.id, { minPrice: Number(e.target.value) })}
                            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={tier.maxPrice}
                            onChange={(e) => handleUpdateTier(tier.id, { maxPrice: Number(e.target.value) })}
                            className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={tier.type}
                            onChange={(e) => handleUpdateTier(tier.id, { type: e.target.value as any })}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 focus:outline-hidden"
                          >
                            <option value="fixed">مبلغ ثابت (ج.م)</option>
                            <option value="percentage">نسبة مئوية (%)</option>
                            <option value="zero">مجاني 0%</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              value={tier.shipperFee}
                              onChange={(e) => handleUpdateTier(tier.id, { shipperFee: Number(e.target.value) })}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-bold text-xs focus:border-amber-400 focus:outline-hidden"
                            />
                            <span className="text-slate-400">{tier.type === 'percentage' ? '%' : 'ج'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              value={tier.transporterFee}
                              onChange={(e) => handleUpdateTier(tier.id, { transporterFee: Number(e.target.value) })}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-blue-400 font-bold text-xs focus:border-amber-400 focus:outline-hidden"
                            />
                            <span className="text-slate-400">{tier.type === 'percentage' ? '%' : 'ج'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(tier.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="حذف الشريحة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Interactive Commission Simulator */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">محاكي حساب العمولة التفاعلي المباشر (Live Calculator)</h3>
                </div>
                <span className="text-xs text-slate-400">تأكد فوراً من ناتج البروفايل قبل اعتماده</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">أدخل قيمة مشوار تجريبي (ج.م):</label>
                  <input
                    type="number"
                    step="500"
                    value={testTripPrice}
                    onChange={(e) => setTestTripPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-black focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="p-4 bg-slate-950/60 border border-emerald-500/30 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block mb-1">عمولة المصنع / الشركة:</span>
                  <span className="text-xl font-black text-emerald-400">{calculatedTest.shipperFee.toLocaleString()} ج.م</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">تُخصم من إجمالي الفاتورة</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-blue-500/30 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block mb-1">عمولة صاحب السيارة / السائق:</span>
                  <span className="text-xl font-black text-blue-400">{calculatedTest.transporterFee.toLocaleString()} ج.م</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">تُخصم من مستحقات الشحنة</span>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl">
                  <span className="text-[11px] text-amber-300 block mb-1">إجمالي إيراد المنصة:</span>
                  <span className="text-2xl font-black text-amber-400">{calculatedTest.totalCommission.toLocaleString()} ج.م</span>
                  <span className="text-[10px] text-amber-300/80 block mt-0.5">الشريحة المطبقة: {calculatedTest.tierLabel}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: USER MANAGEMENT (4 ROLES) ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="ابحث بالاسم، رقم الهاتف، المحافظة، المدينة، أو نوع الشاحنة..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Role Switcher Filter */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'كافة الفئات' },
                    { id: 'admin', label: 'المديرون' },
                    { id: 'company', label: 'المصانع والشركات' },
                    { id: 'office', label: 'مكاتب النقل' },
                    { id: 'driver', label: 'أصحاب السيارات' },
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRoleFilter(r.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        roleFilter === r.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-700 font-black">
                      <th className="p-4">كود المستخدم والاسم</th>
                      <th className="p-4">الفئة الصلاحية</th>
                      <th className="p-4">المحافظة والمركز / القرية</th>
                      <th className="p-4">الهاتف والسجل/الرخصة</th>
                      <th className="p-4">حالة الحساب والتوثيق</th>
                      <th className="p-4">رصيد المحفظة</th>
                      <th className="p-4 text-center">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {filteredUsers.map(user => {
                      const isVerified = user.verifiedDocs;
                      return (
                        <tr key={user.id} className="hover:bg-slate-750/50 transition-colors">
                          <td className="p-4">
                            <div className="font-black text-white text-sm">{user.name}</div>
                            <span className="font-mono text-[10px] text-slate-400">{user.id}</span>
                            {user.truckType && (
                              <div className="text-[11px] text-amber-300/90 font-bold mt-0.5">
                                الشاحنة: {user.truckType} ({user.plateNumber})
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {user.role === 'admin' && (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                مدير / مشرف
                              </span>
                            )}
                            {user.role === 'company' && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                شركة / مصنع
                              </span>
                            )}
                            {user.role === 'office' && (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                مكتب وساطة نقل
                              </span>
                            )}
                            {user.role === 'driver' && (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                                صاحب سيارة / سائق
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-slate-200 font-bold">{user.governorate}</div>
                            <div className="text-[11px] text-slate-400">{user.city}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-mono text-slate-300 font-bold">{user.phone}</div>
                            {user.commercialRecordOrLicense && (
                              <div className="text-[10px] text-slate-400">{user.commercialRecordOrLicense}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                user.status === 'active' 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : user.status === 'suspended'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {user.status === 'active' ? 'مفعل نشط' : user.status === 'suspended' ? 'موقوف' : 'بانتظار الفحص'}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => handleToggleUserVerification(user.id)}
                                title="تبديل حالة فحص الأوراق والتوثيق"
                                className={`text-[11px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                                  isVerified 
                                    ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                              >
                                {isVerified ? '✓ تم التحقق' : 'فحص الأوراق'}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-slate-200 font-mono text-sm">
                              {user.walletBalance.toLocaleString()} ج.م
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedUserForEdit(user)}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                تعديل البيانات
                              </button>
                              
                              {user.status !== 'suspended' ? (
                                <button
                                  onClick={() => handleUpdateUserStatus(user.id, 'suspended')}
                                  className="px-2 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg text-[11px] transition-colors cursor-pointer"
                                  title="إيقاف مؤقت"
                                >
                                  إيقاف
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateUserStatus(user.id, 'active')}
                                  className="px-2 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-lg text-[11px] transition-colors cursor-pointer"
                                  title="تفعيل"
                                >
                                  تفعيل
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Edit User Data */}
            {selectedUserForEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
                <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h4 className="text-base font-black">تعديل بيانات الحساب ({selectedUserForEdit.name})</h4>
                    <button
                      onClick={() => setSelectedUserForEdit(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الاسم / اسم المنشأة:</label>
                      <input
                        type="text"
                        value={selectedUserForEdit.name}
                        onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">الفئة الصلاحية:</label>
                        <select
                          value={selectedUserForEdit.role}
                          onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, role: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                        >
                          <option value="admin">مدير / مشرف</option>
                          <option value="company">شركة / مصنع</option>
                          <option value="office">مكتب نقل</option>
                          <option value="driver">صاحب سيارة / سائق</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">رقم الهاتف:</label>
                        <input
                          type="text"
                          value={selectedUserForEdit.phone}
                          onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                        <input
                          type="text"
                          value={selectedUserForEdit.governorate}
                          onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, governorate: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">المركز / القرية / العنوان:</label>
                        <input
                          type="text"
                          value={selectedUserForEdit.city}
                          onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, city: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">رصيد المحفظة (ج.م):</label>
                        <input
                          type="number"
                          value={selectedUserForEdit.walletBalance}
                          onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, walletBalance: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">حالة الحساب:</label>
                        <select
                          value={selectedUserForEdit.status}
                          onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, status: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                        >
                          <option value="active">نشط ومفعل</option>
                          <option value="pending_verification">تحت الفحص</option>
                          <option value="suspended">موقوف</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForEdit(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                      >
                        حفظ التعديلات
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB: SUPERVISORS & RBAC MANAGEMENT ================= */}
        {activeTab === 'supervisors' && (
          <SupervisorManager />
        )}

        {/* ================= TAB: FINANCIAL ADMINISTRATION & TREASURY ================= */}
        {activeTab === 'finance' && (
          <FinancialAdministrationManager currentUser={users.find(u => u.role === 'admin')} />
        )}

        {/* ================= TAB 3: PAGE CONTENT & CMS ================= */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            
            {cmsSavedAlert && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold">تم حفظ محتوى الصفحات وتحديثه على الموقع فوراً!</span>
              </div>
            )}

            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">تعديل نصوص وعناوين صفحات الموقع (CMS)</h3>
                  <p className="text-xs text-slate-400">تعديل العنوان الرئيسي، الإعلانات الشريطية، أرقام الطوارئ، والبيانات الرسمية</p>
                </div>

                <button
                  type="submit"
                  form="cms-form"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ ونشر التعديلات</span>
                </button>
              </div>

              <form id="cms-form" onSubmit={handleSaveCMS} className="space-y-5 text-xs">
                
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">عنوان المنصة الرئيسي (Title):</label>
                  <input
                    type="text"
                    value={cmsContent.title}
                    onChange={(e) => setCmsContent({ ...cmsContent, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">المانشيت البارز (Hero Headline):</label>
                  <input
                    type="text"
                    value={cmsContent.heroHeadline}
                    onChange={(e) => setCmsContent({ ...cmsContent, heroHeadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">النص التوضيحي للعنوان البارز (Hero Subheadline):</label>
                  <textarea
                    rows={3}
                    value={cmsContent.heroSubheadline}
                    onChange={(e) => setCmsContent({ ...cmsContent, heroSubheadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white leading-relaxed focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">شريط التنبيهات والإعلانات أعلى الموقع:</label>
                  <input
                    type="text"
                    value={cmsContent.announcement}
                    onChange={(e) => setCmsContent({ ...cmsContent, announcement: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-amber-300 font-bold focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">رقم هاتف الطوارئ والدعم الفني:</label>
                    <input
                      type="text"
                      value={cmsContent.emergencyPhone}
                      onChange={(e) => setCmsContent({ ...cmsContent, emergencyPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">رقم السجل الضريبي / التجاري المصري:</label>
                    <input
                      type="text"
                      value={cmsContent.vatNumber}
                      onChange={(e) => setCmsContent({ ...cmsContent, vatNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 1. Hero Buttons & Call to Actions */}
                <div className="pt-6 mt-4 border-t border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span>أزرار الواجهة الترحيبية (Hero Action Buttons):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">زر طلب نقل (الشركات):</label>
                      <input
                        type="text"
                        value={cmsContent.heroPrimaryBtnText || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, heroPrimaryBtnText: e.target.value })}
                        placeholder="طلب نقل بضائع (شركات)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">زر مكاتب النقل والوساطة:</label>
                      <input
                        type="text"
                        value={cmsContent.heroSecondaryBtnText || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, heroSecondaryBtnText: e.target.value })}
                        placeholder="بوابة مكاتب النقل المعتمدة"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">زر أصحاب السيارات والسائقين:</label>
                      <input
                        type="text"
                        value={cmsContent.heroDriverBtnText || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, heroDriverBtnText: e.target.value })}
                        placeholder="دخول أصحاب السيارات والسائقين"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Guest View-Only Banner */}
                <div className="pt-6 mt-4 border-t border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>تنبيه وضع المشاهدة للزوار والضيوف (Guest View-Only Mode):</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">عنوان شريط وضع المشاهدة للزوار:</label>
                      <input
                        type="text"
                        value={cmsContent.guestBannerTitle || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, guestBannerTitle: e.target.value })}
                        placeholder="وضع المشاهدة العامة والاستعراض مفعل للزوار"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">النص التوضيحي لشريط وضع المشاهدة وحماية الخصوصية:</label>
                      <textarea
                        rows={2}
                        value={cmsContent.guestBannerSubtext || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, guestBannerSubtext: e.target.value })}
                        placeholder="يمكنك استعراض مسارات وكميات طلبات النقل الحية. بيانات الاتصال والتنفيذ مشفرة ومحمية..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs leading-relaxed focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Three Commercial Categories Cards */}
                <div className="pt-6 mt-4 border-t border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>نصوص بطاقات الفئات التجارية الثلاث (الرئيسية):</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Companies */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 block">1. الشركات والمصانع:</span>
                      <input
                        type="text"
                        value={cmsContent.categoryCompanyTitle || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, categoryCompanyTitle: e.target.value })}
                        placeholder="عنوان فئة الشركات"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={cmsContent.categoryCompanyDesc || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, categoryCompanyDesc: e.target.value })}
                        placeholder="وصف فئة الشركات"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                      />
                    </div>

                    {/* Offices */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-xs font-bold text-amber-400 block">2. مكاتب النقل والوساطة:</span>
                      <input
                        type="text"
                        value={cmsContent.categoryOfficeTitle || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, categoryOfficeTitle: e.target.value })}
                        placeholder="عنوان فئة المكاتب"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={cmsContent.categoryOfficeDesc || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, categoryOfficeDesc: e.target.value })}
                        placeholder="وصف فئة المكاتب"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                      />
                    </div>

                    {/* Drivers */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-xs font-bold text-blue-400 block">3. أصحاب السيارات والسائقين:</span>
                      <input
                        type="text"
                        value={cmsContent.categoryDriverTitle || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, categoryDriverTitle: e.target.value })}
                        placeholder="عنوان فئة أصحاب السيارات"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={cmsContent.categoryDriverDesc || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, categoryDriverDesc: e.target.value })}
                        placeholder="وصف فئة أصحاب السيارات"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Footer & Legal Texts */}
                <div className="pt-6 mt-4 border-t border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>تذييل الموقع والإشعار القانوني (Footer & Legal):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">نبذة المنصة في أسفل الصفحة (Footer About):</label>
                      <textarea
                        rows={3}
                        value={cmsContent.footerAboutText || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, footerAboutText: e.target.value })}
                        placeholder="نبذة تعريفية في التذييل..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs leading-relaxed focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold mb-1">الإشعار القانوني وحقوق الملكية (Legal Notice):</label>
                      <textarea
                        rows={3}
                        value={cmsContent.footerLegalNotice || ''}
                        onChange={(e) => setCmsContent({ ...cmsContent, footerLegalNotice: e.target.value })}
                        placeholder="جميع الحقوق محفوظة لمنصة ConnectTrans مصر..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs leading-relaxed focus:border-emerald-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Operational Trust Metrics Config */}
                <div className="pt-6 mt-4 border-t border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>أرقام وإحصائيات العمليات والشاحنات الحقيقية</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        التحكم الكامل في طريقة احتساب أرقام الشاحنات والرحلات المعروضة في الرئيسية والصفحات
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={cmsContent.useLiveDatabaseStats !== false}
                        onChange={(e) => setCmsContent({ ...cmsContent, useLiveDatabaseStats: e.target.checked })}
                        className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-emerald-400">
                        حساب تلقائي حي من قاعدة البيانات
                      </span>
                    </label>
                  </div>

                  {/* LIVE CALCULATION CONTROLS */}
                  {cmsContent.useLiveDatabaseStats !== false && (() => {
                    const db = ctStorage.getDatabase();
                    const liveTripsCount = (db?.trips || []).filter(t => t.status === 'in_progress').length;
                    const isPure = Boolean(cmsContent.pureDatabaseCountOnly);
                    const currentBaseline = typeof cmsContent.activeRoadTrucksBaseline === 'number' 
                      ? cmsContent.activeRoadTrucksBaseline 
                      : 1454;
                    const finalDisplayNumber = isPure || currentBaseline === 0 
                      ? `${liveTripsCount}` 
                      : `+${(currentBaseline + liveTripsCount).toLocaleString()}`;

                    return (
                      <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4">
                        
                        {/* 1. Pure Real Count Toggle (العدد الحقيقي الصافي بدون 1454) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-amber-300">
                                عرض العدد الفعلي الصافي فقط لقاعدة البيانات (إلغاء الأساس 1454)
                              </span>
                              {isPure && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/30">
                                  مفعل: صافي حقيقي فقط
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              تفعيل هذا الخيار يلغي الرقم التراكمي السابق (1454)، ويعرض العدد الحقيقي الصافي للرحلات المنفذة حالياً فقط. (مثال: إذا كان لديك 7 شاحنات فقط، سيظهر الرقم 7 وليس 1461).
                            </p>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700/80 px-4 py-2 rounded-xl border border-slate-700 transition-colors shrink-0">
                            <input
                              type="checkbox"
                              checked={isPure}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCmsContent({
                                  ...cmsContent,
                                  pureDatabaseCountOnly: checked,
                                  activeRoadTrucksBaseline: checked ? 0 : (cmsContent.activeRoadTrucksBaseline || 1454)
                                });
                              }}
                              className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-200">
                              {isPure ? 'إلغاء الزيادات مفعل (صافي)' : 'إلغاء 1454 والاعتماد على الصافي'}
                            </span>
                          </label>
                        </div>

                        {/* 2. Custom Baseline Offset (if pure mode is off) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <div>
                            <label className="block text-slate-300 text-xs font-bold mb-1">
                              الرقم التأسيسي التراكمي لشاحنات الطرق (Baseline Offset):
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={isPure ? 0 : currentBaseline}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setCmsContent({
                                    ...cmsContent,
                                    activeRoadTrucksBaseline: val,
                                    pureDatabaseCountOnly: val === 0
                                  });
                                }}
                                disabled={isPure}
                                className={`w-36 bg-slate-900 border rounded-xl px-3 py-2 text-xs font-mono font-black focus:outline-hidden ${
                                  isPure 
                                    ? 'border-slate-800 text-slate-500 cursor-not-allowed opacity-60' 
                                    : 'border-emerald-500/50 text-emerald-400 focus:border-emerald-400'
                                }`}
                              />
                              <span className="text-[11px] text-slate-400">
                                {isPure 
                                  ? '(معطل لأن وضع العد الصافي مفعل والأساس = 0)' 
                                  : 'شاحنة أساسية تضاف للرحلات الجارية'}
                              </span>
                            </div>
                          </div>

                          {/* 3. Live Simulator Card: Exact appearance in Hero badge right now */}
                          <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-950 rounded-xl border border-amber-400/30 flex items-center justify-between gap-3">
                            <div>
                              <span className="block text-[11px] text-slate-400 font-bold">
                                الرقم الذي سيظهر على صورة الشاحنة بالرئيسية الآن:
                              </span>
                              <span className="text-[10px] text-slate-500">
                                عدد الرحلات الجارية حالياً بالنظام: <strong className="text-amber-400 font-mono">{liveTripsCount}</strong>
                              </span>
                            </div>
                            <div className="bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                <span className="font-mono text-emerald-700 font-black text-sm">{finalDisplayNumber}</span>
                                <span className="text-[10px] text-slate-600">شاحنة نشطة</span>
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* MANUAL CMS METRICS OVERRIDE (when useLiveDatabaseStats is false) */}
                  {cmsContent.useLiveDatabaseStats === false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">رحلة نقل مكتملة:</label>
                        <input
                          type="text"
                          value={cmsContent.metricCompletedTrips || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, metricCompletedTrips: e.target.value })}
                          placeholder="مثال: +45,000"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 text-xs font-bold focus:border-amber-400 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">شاحنة مسجلة ومعتمدة:</label>
                        <input
                          type="text"
                          value={cmsContent.metricRegisteredTrucks || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, metricRegisteredTrucks: e.target.value })}
                          placeholder="مثال: +12,800"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 text-xs font-bold focus:border-blue-400 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">شاحنة نشطة الآن على الطرق:</label>
                        <input
                          type="text"
                          value={cmsContent.metricActiveRoadTrucks || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, metricActiveRoadTrucks: e.target.value })}
                          placeholder="مثال: +1,455 أو 7"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 text-xs font-bold focus:border-emerald-400 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">شركة ومصنع شريك:</label>
                        <input
                          type="text"
                          value={cmsContent.metricPartnerCompanies || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, metricPartnerCompanies: e.target.value })}
                          placeholder="مثال: +3,200"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-purple-400 text-xs font-bold focus:border-purple-400 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">نسبة الالتزام بالمواعيد:</label>
                        <input
                          type="text"
                          value={cmsContent.metricOnTimeRate || ''}
                          onChange={(e) => setCmsContent({ ...cmsContent, metricOnTimeRate: e.target.value })}
                          placeholder="مثال: 99.4%"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 text-xs font-bold focus:border-amber-300 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </form>
            </div>

          </div>
        )}

        {/* ================= TAB: PAYMENT GATEWAYS & APP STORES ================= */}
        {activeTab === 'gateways' && (
          <PaymentGatewayManager />
        )}

      </div>
    </div>
  );
};
