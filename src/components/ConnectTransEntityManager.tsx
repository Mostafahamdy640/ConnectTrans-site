import React, { useState } from 'react';
import { 
  Building2, Briefcase, Truck, Users, Clock, ShieldCheck, 
  CheckCircle2, XCircle, AlertCircle, Eye, RefreshCw, FileText, 
  Layers, ChevronRight, Phone, Mail, MapPin
} from 'lucide-react';
import { ctStorage, ConnectTransDatabase } from '../data/connectTransStorage';
import { AccountStatus } from '../types';

export const ConnectTransEntityManager: React.FC = () => {
  const [db, setDb] = useState<ConnectTransDatabase>(() => ctStorage.getDatabase());
  const [subTab, setSubTab] = useState<'offices' | 'companies' | 'owners' | 'vehicles' | 'drivers'>('offices');
  const [search, setSearch] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const refreshData = () => {
    setDb(ctStorage.getDatabase());
  };

  const handleStatusChange = (
    entityType: 'company' | 'office' | 'vehicle_owner' | 'driver' | 'vehicle', 
    id: string, 
    newStatus: AccountStatus
  ) => {
    ctStorage.updateAccountStatus(entityType, id, newStatus, 'Super Admin');
    refreshData();
    setActionAlert(`تم تحديث الحالة بنجاح إلى: ${newStatus}`);
    setTimeout(() => setActionAlert(null), 3500);
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

                {/* Status Action Controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">تغيير الحالة:</span>
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

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">الإجراء:</span>
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

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
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
                  إيقاف مؤقت
                </button>
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

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleStatusChange('driver', driver.id, 'approved')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                >
                  اعتماد السائق
                </button>
                <button
                  onClick={() => handleStatusChange('driver', driver.id, 'suspended')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded cursor-pointer"
                >
                  تعليق
                </button>
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

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
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
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
