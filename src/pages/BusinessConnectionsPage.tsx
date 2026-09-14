import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { BusinessConnections } from '../components/BusinessConnections';
import { UserRole } from '../types';
import { CITIES, TRUCK_TYPES } from '../data/mockData';
import { 
  Building2, 
  Truck, 
  Briefcase, 
  ArrowLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

import { CommissionProfile } from '../types';
import { calculateTripCommission, DEFAULT_COMMISSION_PROFILES } from '../data/egyptLocations';
import { ConnectTransWorkflowManager } from '../components/ConnectTransWorkflowManager';

interface BusinessConnectionsPageProps {
  onNavigateHome: () => void;
  onSelectRole: (role: UserRole) => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
  onBookShipment: (details: any) => void;
  activeCommissionProfile?: CommissionProfile;
}

interface LoadListing {
  id: string;
  from: string;
  to: string;
  truckType: string;
  cargo: string;
  weight: number;
  price: number;
  timeAgo: string;
  status: 'available' | 'urgent';
}

const MOCK_LOADS: LoadListing[] = [
  { id: 'LD-101', from: 'العاشر من رمضان (الشرقية)', to: 'ميناء الإسكندرية (الإسكندرية)', truckType: 'ستارة / جوانب (30 طن)', cargo: 'مواد تغليف وكرتون وسيراميك', weight: 24, price: 4200, timeAgo: 'منذ 10 دقائق', status: 'urgent' },
  { id: 'LD-102', from: 'العين السخنة (السويس)', to: 'مدينة 6 أكتوبر (الجيزة)', truckType: 'تريلا فرش / سطحة (28 طن)', cargo: 'حديد تسليح ولفائف صاج', weight: 28, price: 3800, timeAgo: 'منذ 25 دقيقة', status: 'available' },
  { id: 'LD-103', from: 'ميناء الدخيلة (الإسكندرية)', to: 'قويسنا (المنوفية)', truckType: 'تريلا جوانب (25 طن)', cargo: 'ذرة صفراء وحبوب ومحاصيل', weight: 25, price: 3500, timeAgo: 'منذ 45 دقيقة', status: 'urgent' },
  { id: 'LD-104', from: 'السادات (المنوفية)', to: 'دمنهور (البحيرة)', truckType: 'جامبو مقفلة (7 طن)', cargo: 'أغذية ومشروبات معلبة', weight: 7, price: 2100, timeAgo: 'منذ ساعتين', status: 'available' },
  { id: 'LD-105', from: 'حلوان (القاهرة)', to: 'أسيوط الجديدة (أسيوط)', truckType: 'تريلا كساحة / لوبد', cargo: 'معدات هندسية ومولدات', weight: 22, price: 8500, timeAgo: 'منذ 3 ساعات', status: 'available' },
  { id: 'LD-106', from: 'دمياط (دمياط)', to: 'التجمع الخامس (القاهرة)', truckType: 'سيارة نقل عفش مغلقة', cargo: 'أثاث مكتبي ومصنوعات خشبية', weight: 6, price: 3100, timeAgo: 'منذ 4 ساعات', status: 'available' },
];

export const BusinessConnectionsPage: React.FC<BusinessConnectionsPageProps> = ({
  onNavigateHome,
  onSelectRole,
  onOpenAuth,
  onBookShipment,
  activeCommissionProfile,
}) => {
  const [filterCity, setFilterCity] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLoads = MOCK_LOADS.filter(load => {
    const matchCity = filterCity === 'الكل' || load.from === filterCity || load.to === filterCity;
    const matchQuery = !searchQuery || 
      load.from.includes(searchQuery) || 
      load.to.includes(searchQuery) || 
      load.cargo.includes(searchQuery) ||
      load.truckType.includes(searchQuery);
    return matchCity && matchQuery;
  });

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* 1. Page Header */}
      <PageHeader
        title="ربط الأعمال - ConnectTrans"
        subtitle="المنظومة الرقمية الشاملة لربط المصانع والشركات التجارية بأسطول الشاحنات ومكاتب النقل المعتمدة"
        badge="شبكة الأعمال اللوجستية"
        onNavigateHome={onNavigateHome}
        actionButton={{
          label: 'انضم كشريك الآن',
          onClick: () => onOpenAuth('register'),
        }}
      />

      {/* 2. Full ConnectTrans Workflow & Interaction (Companies - Transport Offices - Vehicle Owners) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ConnectTransWorkflowManager />
      </div>

      {/* 3. Three Main Category Portals (Cards from design) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BusinessConnections onSelectRole={onSelectRole} />
      </div>

      {/* 3. Live Freight & Capacity Board (بورصة الحمولات اللحظية) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حمولات فورية متجددة</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                بورصة الحمولات والشاحنات المتاحة حالياً
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                فرص نقل جاهزة للتحميل الفوري بمختلف محافظات ومراكز وقرى مصر مع أسعار عادلة وعمولة رمزية
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالمدينة أو البضاعة..."
                  className="pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              >
                <option value="الكل">كل المدن</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Loads List */}
          <div className="divide-y divide-slate-100 mt-4">
            {filteredLoads.map((load) => (
              <div
                key={load.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-2xl transition-colors"
              >
                {/* Route & Cargo */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-slate-900">
                        {load.from} ← {load.to}
                      </span>
                      {load.status === 'urgent' && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-md animate-pulse">
                          تحميل عاجل
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {load.timeAgo}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                      <span>البضاعة: <strong className="text-slate-800">{load.cargo}</strong></span>
                      <span>•</span>
                      <span>نوع الشاحنة: <strong className="text-slate-800">{load.truckType}</strong></span>
                      <span>•</span>
                      <span>الوزن: <strong className="text-slate-800">{load.weight} طن</strong></span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">السعر المعروض:</span>
                    <span className="text-lg font-black text-emerald-600 font-mono">
                      {load.price.toLocaleString()} ج.م
                    </span>
                    {activeCommissionProfile && (
                      <span className="block text-[10px] text-emerald-700 font-bold">
                        {calculateTripCommission(load.price, activeCommissionProfile).transporterFee === 0
                          ? 'عمولة مجانية خلال الفترة التجريبية'
                          : `عمولة السائق: ${calculateTripCommission(load.price, activeCommissionProfile).transporterFee} ج.م`}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onBookShipment({
                      fromCity: load.from,
                      toCity: load.to,
                      weight: load.weight,
                      price: load.price,
                    })}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-xs"
                  >
                    حجز / تقديم عرض
                  </button>
                </div>

              </div>
            ))}

            {filteredLoads.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                لا توجد حمولات مطابقة للمحددات حالياً. جرب اختيار مدينة أخرى.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>يتم تحديث قائمة الحمولات تلقائياً كل دقيقة من خلال شبكة ConnectTrans.</span>
            <button
              onClick={() => onBookShipment({})}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              + هل لديك بضاعة وتريد طرحها للنقل؟
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
