import React, { useState, useEffect } from 'react';
import { 
  Building2, Briefcase, Truck, Users, Clock, ShieldCheck, 
  CheckCircle2, XCircle, AlertCircle, Eye, RefreshCw, FileText, 
  Layers, ChevronRight, Phone, Mail, MapPin, Edit3, Trash2, Plus, X, Save
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { AccountStatus, TransportOffice, CompanyEntity, VehicleEntity, DriverEntity, VehicleOwnerEntity } from '../types';

export const ConnectTransEntityManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [subTab, setSubTab] = useState<'offices' | 'companies' | 'owners' | 'vehicles' | 'drivers'>('offices');
  const [search, setSearch] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Edit / Create Modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    isNew: boolean;
    type: 'office' | 'company' | 'owner' | 'vehicle' | 'driver';
    data: any;
  }>({
    isOpen: false,
    isNew: false,
    type: 'office',
    data: null,
  });

  useEffect(() => {
    ctStorage.syncWithServer().then((synced) => {
      setDb({ ...synced });
    });
  }, []);

  const refreshData = () => {
    ctStorage.syncWithServer().then((synced) => {
      setDb({ ...synced });
    });
  };

  const handleStatusChange = async (
    entityType: 'company' | 'office' | 'vehicle_owner' | 'driver' | 'vehicle', 
    id: string, 
    newStatus: AccountStatus
  ) => {
    ctStorage.updateAccountStatus(entityType, id, newStatus, 'Super Admin');
    
    // Also patch PostgreSQL if token exists
    const token = localStorage.getItem('ct_auth_token');
    if (token) {
      try {
        await fetch(`/api/admin/users/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch {}
    }

    refreshData();
    setActionAlert(`تم تحديث الحالة بنجاح إلى: ${newStatus}`);
    setTimeout(() => setActionAlert(null), 3500);
  };

  const handleDeleteEntity = (type: 'office' | 'company' | 'owner' | 'vehicle' | 'driver', id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف (${name}) نهائياً من قاعدة بيانات النظام؟`)) {
      return;
    }

    if (type === 'office') ctStorage.deleteOffice(id);
    else if (type === 'company') ctStorage.deleteCompany(id);
    else if (type === 'owner') ctStorage.deleteVehicleOwner(id);
    else if (type === 'vehicle') ctStorage.deleteVehicle(id);
    else if (type === 'driver') ctStorage.deleteDriver(id);

    refreshData();
    setActionAlert(`تم حذف (${name}) بنجاح.`);
    setTimeout(() => setActionAlert(null), 3500);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const { type, data } = editModal;
    if (!data) return;

    if (type === 'office') {
      ctStorage.saveOffice(data as TransportOffice);
    } else if (type === 'company') {
      ctStorage.saveCompany(data as CompanyEntity);
    } else if (type === 'owner') {
      ctStorage.saveVehicleOwner(data as VehicleOwnerEntity);
    } else if (type === 'vehicle') {
      ctStorage.saveVehicle(data as VehicleEntity);
    } else if (type === 'driver') {
      ctStorage.saveDriver(data as DriverEntity);
    }

    refreshData();
    setEditModal({ isOpen: false, isNew: false, type: 'office', data: null });
    setActionAlert('تم حفظ وتحديث بيانات الكيان في النظام بنجاح!');
    setTimeout(() => setActionAlert(null), 3500);
  };

  const openCreateModal = (type: 'office' | 'company' | 'owner' | 'vehicle' | 'driver') => {
    const timestamp = Date.now();
    let initialData: any = {};

    if (type === 'office') {
      initialData = {
        id: `office-${timestamp}`,
        officeName: 'مكتب شحن جديد',
        displayName: 'مكتب لوجستي معتمد',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        commercialRegister: '109283',
        taxCard: '876-543-210',
        contacts: { phone: '01012345678', email: 'office@transport.eg', whatsapp: '01012345678' },
        status: 'approved',
        isInternalConnectTrans: false,
        notes: 'تمت إضافته من قبل الإدارة',
        rating: 5.0,
        completedTripsCount: 0
      };
    } else if (type === 'company') {
      initialData = {
        id: `comp-${timestamp}`,
        companyName: 'شركة تجارية / صناعية جديدة',
        contactPerson: 'المدير المسؤول',
        governorate: 'الجيزة',
        city: 'السادس من أكتوبر',
        commercialRegister: '384920',
        contacts: { phone: '01123456789', email: 'factory@company.eg' },
        status: 'approved',
        walletBalance: 0
      };
    } else if (type === 'owner') {
      initialData = {
        id: `owner-${timestamp}`,
        ownerName: 'مالك أسطول جديد',
        nationalId: '28910291827364',
        governorate: 'الدقهلية',
        city: 'المنصورة',
        contacts: { phone: '01234567890', email: 'owner@fleet.eg' },
        status: 'approved',
        walletBalance: 0,
        notes: 'مالك شاحنات معتمد'
      };
    } else if (type === 'vehicle') {
      initialData = {
        id: `veh-${timestamp}`,
        vehicleType: 'تريلا فرش / سطحة (Flatbed)',
        plateNumber: 'ب ر ق ٤٥٦١',
        capacityTons: 30,
        cargoTypeAllowed: 'بضائع ومعدات عامة',
        ownerName: 'أسطول النقل المعتمد',
        currentDriverName: 'سائق معتمد',
        modelYear: 2023,
        status: 'approved'
      };
    } else if (type === 'driver') {
      initialData = {
        id: `drv-${timestamp}`,
        driverName: 'كابتن سائق جديد',
        nationalId: '29304192837465',
        licenseNumber: 'رخصة درجة أولى 987654',
        ownerName: 'شركة النقل المباشر',
        governorate: 'القاهرة',
        city: 'حلوان',
        contacts: { phone: '01098765432' },
        status: 'approved'
      };
    }

    setEditModal({
      isOpen: true,
      isNew: true,
      type,
      data: initialData
    });
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch(status) {
      case 'approved':
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold">معتمد ومفعل</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold">قيد المراجعة</span>;
      case 'suspended':
        return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold">معلق / موقوف</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-rose-900/40 text-rose-300 border border-rose-700 rounded-lg text-xs font-bold">مرفوض</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {actionAlert && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{actionAlert}</span>
        </div>
      )}

      {/* Internal Subtabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setSubTab('offices')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'offices' 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>مكاتب وشركات النقل ({db.offices.length})</span>
        </button>

        <button
          onClick={() => setSubTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'companies' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>الشركات والمصانع ({db.companies.length})</span>
        </button>

        <button
          onClick={() => setSubTab('owners')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'owners' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>أصحاب السيارات والأسطول ({db.vehicleOwners.length})</span>
        </button>

        <button
          onClick={() => setSubTab('vehicles')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'vehicles' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>المركبات والشاحنات ({db.vehicles.length})</span>
        </button>

        <button
          onClick={() => setSubTab('drivers')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'drivers' 
              ? 'bg-purple-600 text-white shadow-md' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>السائقين المعتمدين ({db.drivers.length})</span>
        </button>
      </div>

      {/* Top Action Bar for current subTab */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <h4 className="text-sm font-black text-white">
            {subTab === 'offices' && 'إدارة مكاتب وشركات النقل والوساطة'}
            {subTab === 'companies' && 'إدارة الشركات والمصانع والشاحنين'}
            {subTab === 'owners' && 'إدارة أصحاب السيارات ومالكي الأساطيل'}
            {subTab === 'vehicles' && 'إدارة أسطول الشاحنات والمركبات المسجلة'}
            {subTab === 'drivers' && 'إدارة كباتن وسائقي الشاحنات المعتمدين'}
          </h4>
          <p className="text-xs text-slate-400">صلاحيات كاملة للمدير لتعديل البيانات، الإضافة، أو الحذف</p>
        </div>

        <button
          onClick={() => {
            const typeMap: Record<string, any> = {
              offices: 'office',
              companies: 'company',
              owners: 'owner',
              vehicles: 'vehicle',
              drivers: 'driver'
            };
            openCreateModal(typeMap[subTab]);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة جديد</span>
        </button>
      </div>

      {/* SECTION 1: OFFICES */}
      {subTab === 'offices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.offices.map((office) => (
              <div 
                key={office.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  office.isInternalConnectTrans 
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg' 
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-base">{office.officeName}</h4>
                      {office.isInternalConnectTrans && (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded">
                          المكتب الداخلي ConnectTrans
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{office.displayName} • {office.city} ({office.governorate})</p>
                  </div>
                  {getStatusBadge(office.status)}
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4 border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">السجل التجاري:</span>
                    <span className="font-mono text-amber-300">{office.commercialRegister}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">البطاقة الضريبية:</span>
                    <span className="font-mono text-slate-300">{office.taxCard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الهاتف وواتساب:</span>
                    <span className="font-mono text-emerald-400">{office.contacts.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">البريد الإلكتروني:</span>
                    <span className="font-mono text-blue-300">{office.contacts.email}</span>
                  </div>
                  {office.notes && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      💡 {office.notes}
                    </div>
                  )}
                </div>

                {/* Status & Editing Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange('office', office.id, 'approved')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                    >
                      اعتماد
                    </button>
                    <button
                      onClick={() => handleStatusChange('office', office.id, 'suspended')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                    >
                      تعليق
                    </button>
                    <button
                      onClick={() => handleStatusChange('office', office.id, 'rejected')}
                      className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold rounded cursor-pointer transition-colors"
                    >
                      رفض
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditModal({ isOpen: true, isNew: false, type: 'office', data: { ...office } })}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>تعديل</span>
                    </button>
                    {!office.isInternalConnectTrans && (
                      <button
                        onClick={() => handleDeleteEntity('office', office.id, office.officeName)}
                        className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: COMPANIES */}
      {subTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.companies.map((company) => (
            <div key={company.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-black text-white text-base">{company.companyName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{company.city} ({company.governorate})</p>
                </div>
                {getStatusBadge(company.status)}
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4 border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">المسؤول:</span>
                  <span className="text-white font-bold">{company.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السجل التجاري:</span>
                  <span className="font-mono text-amber-300">{company.commercialRegister}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الهاتف:</span>
                  <span className="font-mono text-emerald-400">{company.contacts.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange('company', company.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    اعتماد
                  </button>
                  <button
                    onClick={() => handleStatusChange('company', company.id, 'suspended')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    تعليق
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditModal({ isOpen: true, isNew: false, type: 'company', data: { ...company } })}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEntity('company', company.id, company.companyName)}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: VEHICLES */}
      {subTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.vehicles.map((veh) => (
            <div key={veh.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-black text-white text-base">{veh.vehicleType}</h4>
                  <p className="text-xs text-amber-400 font-mono font-black mt-0.5">{veh.plateNumber}</p>
                </div>
                {getStatusBadge(veh.status)}
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4 border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">المالك:</span>
                  <span className="text-white font-bold">{veh.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الحمولة المصرح بها:</span>
                  <span className="text-emerald-400 font-bold">{veh.capacityTons} طن</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع البضائع:</span>
                  <span className="text-slate-300">{veh.cargoTypeAllowed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السائق المرتبط:</span>
                  <span className="text-blue-400 font-bold">{veh.currentDriverName || 'غير معين'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange('vehicle', veh.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    اعتماد الفحص
                  </button>
                  <button
                    onClick={() => handleStatusChange('vehicle', veh.id, 'suspended')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    إيقاف
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditModal({ isOpen: true, isNew: false, type: 'vehicle', data: { ...veh } })}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEntity('vehicle', veh.id, `${veh.vehicleType} (${veh.plateNumber})`)}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: DRIVERS */}
      {subTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.drivers.map((driver) => (
            <div key={driver.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-black text-white text-base">{driver.driverName}</h4>
                  <p className="text-xs text-slate-400">{driver.city} ({driver.governorate})</p>
                </div>
                {getStatusBadge(driver.status)}
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4 border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">الرقم القومي:</span>
                  <span className="font-mono text-amber-300">{driver.nationalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رخصة القيادة:</span>
                  <span className="font-mono text-slate-300">{driver.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الجهة / المالك:</span>
                  <span className="text-emerald-400 font-bold">{driver.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم التواصل:</span>
                  <span className="font-mono text-blue-300">{driver.contacts.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange('driver', driver.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    اعتماد
                  </button>
                  <button
                    onClick={() => handleStatusChange('driver', driver.id, 'suspended')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    تعليق
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditModal({ isOpen: true, isNew: false, type: 'driver', data: { ...driver } })}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEntity('driver', driver.id, driver.driverName)}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 5: VEHICLE OWNERS */}
      {subTab === 'owners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.vehicleOwners.map((owner) => (
            <div key={owner.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-black text-white text-base">{owner.ownerName}</h4>
                  <p className="text-xs text-slate-400">{owner.city} ({owner.governorate})</p>
                </div>
                {getStatusBadge(owner.status)}
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl space-y-1.5 text-xs text-slate-300 mb-4 border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">الهاتف:</span>
                  <span className="font-mono text-emerald-400">{owner.contacts.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">البريد:</span>
                  <span className="font-mono text-blue-300">{owner.contacts.email}</span>
                </div>
                {owner.notes && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    💡 {owner.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange('vehicle_owner', owner.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    اعتماد المالك
                  </button>
                  <button
                    onClick={() => handleStatusChange('vehicle_owner', owner.id, 'suspended')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    تعليق
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditModal({ isOpen: true, isNew: false, type: 'owner', data: { ...owner } })}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEntity('owner', owner.id, owner.ownerName)}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: UNIVERSAL EDIT / CREATE ENTITY */}
      {editModal.isOpen && editModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>
                  {editModal.isNew ? 'إضافة كيان جديد: ' : 'تعديل بيانات: '}
                  {editModal.type === 'office' && 'مكتب شحن ووساطة'}
                  {editModal.type === 'company' && 'شركة أو مصنع'}
                  {editModal.type === 'owner' && 'صاحب أسطول / سيارات'}
                  {editModal.type === 'vehicle' && 'شاحنة / مركبة'}
                  {editModal.type === 'driver' && 'سائق معتمد'}
                </span>
              </h4>
              <button
                onClick={() => setEditModal({ isOpen: false, isNew: false, type: 'office', data: null })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* OFFICE FIELDS */}
              {editModal.type === 'office' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">اسم المكتب الرسمي:</label>
                      <input
                        type="text"
                        required
                        value={editModal.data.officeName || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, officeName: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الاسم التجاري / العرض:</label>
                      <input
                        type="text"
                        value={editModal.data.displayName || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, displayName: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                      <input
                        type="text"
                        value={editModal.data.governorate || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, governorate: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المدينة / المركز:</label>
                      <input
                        type="text"
                        value={editModal.data.city || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, city: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">السجل التجاري:</label>
                      <input
                        type="text"
                        value={editModal.data.commercialRegister || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, commercialRegister: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">البطاقة الضريبية:</label>
                      <input
                        type="text"
                        value={editModal.data.taxCard || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, taxCard: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">رقم الهاتف:</label>
                      <input
                        type="text"
                        value={editModal.data.contacts?.phone || ''}
                        onChange={(e) => setEditModal({ 
                          ...editModal, 
                          data: { ...editModal.data, contacts: { ...editModal.data.contacts, phone: e.target.value } } 
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني:</label>
                      <input
                        type="email"
                        value={editModal.data.contacts?.email || ''}
                        onChange={(e) => setEditModal({ 
                          ...editModal, 
                          data: { ...editModal.data, contacts: { ...editModal.data.contacts, email: e.target.value } } 
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">ملاحظات الإدارة:</label>
                    <textarea
                      rows={2}
                      value={editModal.data.notes || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, notes: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              {/* COMPANY FIELDS */}
              {editModal.type === 'company' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم الشركة / المصنع:</label>
                    <input
                      type="text"
                      required
                      value={editModal.data.companyName || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, companyName: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المسؤول عن الشحن:</label>
                      <input
                        type="text"
                        value={editModal.data.contactPerson || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, contactPerson: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">السجل التجاري:</label>
                      <input
                        type="text"
                        value={editModal.data.commercialRegister || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, commercialRegister: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                      <input
                        type="text"
                        value={editModal.data.governorate || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, governorate: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المدينة / المنطقة الصناعية:</label>
                      <input
                        type="text"
                        value={editModal.data.city || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, city: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">الهاتف:</label>
                    <input
                      type="text"
                      value={editModal.data.contacts?.phone || ''}
                      onChange={(e) => setEditModal({ 
                        ...editModal, 
                        data: { ...editModal.data, contacts: { ...editModal.data.contacts, phone: e.target.value } } 
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {/* VEHICLE FIELDS */}
              {editModal.type === 'vehicle' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">رقم اللوحة المعدنية:</label>
                      <input
                        type="text"
                        required
                        value={editModal.data.plateNumber || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, plateNumber: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">نوع الشاحنة / السيارة:</label>
                      <input
                        type="text"
                        value={editModal.data.vehicleType || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, vehicleType: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الحمولة المصرحة (بالطن):</label>
                      <input
                        type="number"
                        value={editModal.data.capacityTons || 25}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, capacityTons: Number(e.target.value) } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">سنة الصنع / الموديل:</label>
                      <input
                        type="number"
                        value={editModal.data.modelYear || 2022}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, modelYear: Number(e.target.value) } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">اسم المالك المسجل:</label>
                      <input
                        type="text"
                        value={editModal.data.ownerName || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, ownerName: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">اسم السائق الحالي:</label>
                      <input
                        type="text"
                        value={editModal.data.currentDriverName || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, currentDriverName: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DRIVER FIELDS */}
              {editModal.type === 'driver' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم السائق بالكامل:</label>
                    <input
                      type="text"
                      required
                      value={editModal.data.driverName || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, driverName: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الرقم القومي:</label>
                      <input
                        type="text"
                        value={editModal.data.nationalId || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, nationalId: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">رقم رخصة القيادة:</label>
                      <input
                        type="text"
                        value={editModal.data.licenseNumber || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, licenseNumber: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الهاتف:</label>
                      <input
                        type="text"
                        value={editModal.data.contacts?.phone || ''}
                        onChange={(e) => setEditModal({ 
                          ...editModal, 
                          data: { ...editModal.data, contacts: { ...editModal.data.contacts, phone: e.target.value } } 
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الجهة / المالك:</label>
                      <input
                        type="text"
                        value={editModal.data.ownerName || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, ownerName: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* OWNER FIELDS */}
              {editModal.type === 'owner' && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم المالك / صاحب السيارة:</label>
                    <input
                      type="text"
                      required
                      value={editModal.data.ownerName || ''}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, ownerName: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">الرقم القومي:</label>
                      <input
                        type="text"
                        value={editModal.data.nationalId || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, nationalId: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">رقم الهاتف:</label>
                      <input
                        type="text"
                        value={editModal.data.contacts?.phone || ''}
                        onChange={(e) => setEditModal({ 
                          ...editModal, 
                          data: { ...editModal.data, contacts: { ...editModal.data.contacts, phone: e.target.value } } 
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المحافظة:</label>
                      <input
                        type="text"
                        value={editModal.data.governorate || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, governorate: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">المدينة / المركز:</label>
                      <input
                        type="text"
                        value={editModal.data.city || ''}
                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, city: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">حالة التفعيل والاعتماد:</label>
                <select
                  value={editModal.data.status || 'approved'}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, status: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="approved">معتمد ومفعل (Approved)</option>
                  <option value="pending">قيد المراجعة (Pending)</option>
                  <option value="suspended">موقوف / معلق (Suspended)</option>
                  <option value="rejected">مرفوض (Rejected)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, isNew: false, type: 'office', data: null })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات في النظام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
