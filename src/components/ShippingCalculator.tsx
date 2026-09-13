import React, { useState } from 'react';
import { Calculator, ArrowRightLeft, Truck, Clock, DollarSign, Check, Percent } from 'lucide-react';
import { CITIES, TRUCK_TYPES } from '../data/mockData';
import { CommissionProfile } from '../types';
import { calculateTripCommission, DEFAULT_COMMISSION_PROFILES } from '../data/egyptLocations';

interface ShippingCalculatorProps {
  onBookShipment: (details: any) => void;
  activeCommissionProfile?: CommissionProfile;
}

export const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({ 
  onBookShipment,
  activeCommissionProfile,
}) => {
  const [fromCity, setFromCity] = useState('العاشر من رمضان (الشرقية)');
  const [toCity, setToCity] = useState('ميناء الإسكندرية (الإسكندرية)');
  const [truckType, setTruckType] = useState('flatbed');
  const [weight, setWeight] = useState(20);

  const currentProfile = activeCommissionProfile || DEFAULT_COMMISSION_PROFILES[0];

  // Approximate Egyptian distance & cost calculation matrix
  const getEstimatedCost = () => {
    let baseRate = 2200;
    if (fromCity === toCity) {
      baseRate = 1200;
    } else if (fromCity.includes('القاهرة') && toCity.includes('الإسكندرية') || (fromCity.includes('الإسكندرية') && toCity.includes('القاهرة'))) {
      baseRate = 3800;
    } else if (fromCity.includes('السويس') && toCity.includes('القاهرة') || (fromCity.includes('القاهرة') && toCity.includes('السويس'))) {
      baseRate = 2600;
    } else if (fromCity.includes('الشرقية') && toCity.includes('الدقهلية') || (fromCity.includes('الدقهلية') && toCity.includes('الشرقية'))) {
      baseRate = 2400;
    } else if (fromCity.includes('أسيوط') || toCity.includes('أسيوط') || fromCity.includes('قنا') || toCity.includes('قنا')) {
      baseRate = 7200;
    } else {
      baseRate = 3500;
    }

    const truckMultiplier = truckType === 'reefer' ? 1.45 : truckType === 'lowboy' ? 1.9 : truckType === 'quarter' ? 0.45 : truckType === 'jumbo' ? 0.75 : 1.1;
    const weightFactor = weight > 5 ? 1 + (weight - 5) * 0.025 : 1;

    const total = Math.round(baseRate * truckMultiplier * weightFactor);
    return {
      price: total,
      duration: fromCity === toCity ? 'نفس اليوم (3-5 ساعات)' : '10 - 18 ساعة',
      distance: fromCity === toCity ? '35 كم' : '280 كم تقريباً'
    };
  };

  const estimate = getEstimatedCost();

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">حاسبة تكلفة الشحن الفورية (بالجنيه المصري)</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">احصل على تقدير فوري لأسعار نقل البضائع والشاحنات بين محافظات ومراكز مصر</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* From City */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">مدينة أو مركز التحميل:</label>
          <select
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Swap Button & To City */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">مدينة أو مركز التسليم:</label>
            <button
              type="button"
              onClick={handleSwapCities}
              title="تبديل المدن"
              className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              تبديل
            </button>
          </div>
          <select
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Truck Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع السيارة المطلوبة:</label>
          <select
            value={truckType}
            onChange={(e) => setTruckType(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
          >
            {TRUCK_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Weight in Tons */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-700">الوزن التقديري:</label>
            <span className="text-xs font-black text-blue-600">{weight} طن</span>
          </div>
          <input
            type="range"
            min="1"
            max="45"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

      </div>

      {/* Result Card */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/70 via-slate-50 to-amber-50/60 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div>
            <span className="text-xs text-slate-500 font-medium block">التكلفة التقديرية للرحلة:</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-700">
              {estimate.price.toLocaleString()} <span className="text-sm font-bold text-slate-600">ج.م</span>
            </span>
            {(() => {
              const comm = calculateTripCommission(estimate.price, currentProfile);
              if (comm.totalCommission === 0) {
                return (
                  <div className="text-[11px] font-black text-emerald-600 mt-1 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>عمولة مجانية بالكامل خلال الفترة التجريبية (0 ج.م)</span>
                  </div>
                );
              }
              return (
                <div className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-2">
                  <span className="text-emerald-700">عمولة الشركة: {comm.shipperFee} ج.م</span>
                  <span>•</span>
                  <span className="text-blue-700">عمولة السائق: {comm.transporterFee} ج.م</span>
                </div>
              );
            })()}
          </div>

          <div className="hidden sm:block h-10 w-px bg-slate-300" />

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{estimate.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>{estimate.distance}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onBookShipment({ fromCity, toCity, truckType, weight, price: estimate.price })}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          طلب شاحنة بهذا السعر الآن
        </button>
      </div>
    </div>
  );
};
