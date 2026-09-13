import React from 'react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';
import corpOfficeImg from '../assets/images/corp_office_card_1789141808610.jpg';
import semiTruckImg from '../assets/images/semi_truck_card_1789141825517.jpg';
import agencyOfficeImg from '../assets/images/agency_office_card_1789141842403.jpg';

interface BusinessConnectionsProps {
  onSelectRole: (role: UserRole) => void;
}

export const BusinessConnections: React.FC<BusinessConnectionsProps> = ({ onSelectRole }) => {
  return (
    <section id="connect-trans" className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Outer Card Container with soft background */}
      <div className="bg-[#f8faff] border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
        
        {/* Section Title with Golden Flanking Dividers */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-4 w-full max-w-md mx-auto">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e59819]" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 whitespace-nowrap">
              ربط الأعمال والشركاء
            </h2>
            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e59819]" />
          </div>
          <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
            نربط بين الشركات والمصانع، أصحاب الشاحنات والسيارات، ومكاتب وشركات النقل المعتمدة
          </p>
        </div>

        {/* 3 Main Role Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Card 1: الشركات (Companies) */}
          <div
            id="role-card-company"
            onClick={() => onSelectRole('company')}
            className="group relative bg-[#ecfbf3] hover:bg-[#e4f8ed] border border-[#bbf0d4] rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xs bg-white p-1 shrink-0 border border-emerald-100">
                  <img
                    src={corpOfficeImg}
                    alt="الشركات"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#107c41] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-all">
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-lg font-black text-[#0e7742] mb-1">
                  1. الشركات والمصانع
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  حلول لوجستية متكاملة لنمو أعمالك، شحن فوري ومجدول لكافة المحافظات
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: أصحاب السيارات (Vehicle Owners) */}
          <div
            id="role-card-driver"
            onClick={() => onSelectRole('driver')}
            className="group relative bg-[#edf4fe] hover:bg-[#e4effd] border border-[#c4dbfd] rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xs bg-white p-1 shrink-0 border border-blue-100">
                  <img
                    src={semiTruckImg}
                    alt="أصحاب السيارات"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#0055fe] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-all">
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-lg font-black text-[#0b57d0] mb-1">
                  2. أصحاب السيارات والشاحنات
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  اعثر على أفضل الفرص، تصفح الحمولات، وزد من دخلك مع عمولات رمزية
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: مكاتب النقل (Transport Offices) */}
          <div
            id="role-card-office"
            onClick={() => onSelectRole('office')}
            className="group relative bg-[#fff9ea] hover:bg-[#fff5dc] border border-[#fedd99] rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xs bg-white p-1 shrink-0 border border-amber-100">
                  <img
                    src={agencyOfficeImg}
                    alt="مكاتب النقل"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#e59819] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-all">
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  3. شركات ومكاتب النقل
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  أنشر طلباتك بسهولة، إدارة أسطول السائقين وتنظيم البوالص المعتمدة
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
