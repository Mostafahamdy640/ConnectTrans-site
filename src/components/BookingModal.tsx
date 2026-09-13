import React, { useState } from 'react';
import { 
  X, CheckCircle2, Truck, Calendar, MapPin, DollarSign, 
  ArrowLeft, Navigation, ShieldCheck, LocateFixed, Compass, ExternalLink, Route
} from 'lucide-react';
import { TRUCK_TYPES } from '../data/mockData';
import { CommissionProfile } from '../types';
import { 
  calculateTripCommission, 
  DEFAULT_COMMISSION_PROFILES, 
  EGYPT_LOCATIONS, 
  EGYPT_CITIES_LIST 
} from '../data/egyptLocations';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCommissionProfile?: CommissionProfile;
  initialDetails?: {
    fromCity?: string;
    toCity?: string;
    truckType?: string;
    weight?: number;
    price?: number;
  };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  activeCommissionProfile,
  initialDetails,
}) => {
  // Location selection mode: 'governorate_village' or 'google_maps_pin'
  const [locationMode, setLocationMode] = useState<'governorate_village' | 'google_maps_pin'>('governorate_village');

  // Governorate & City / Village Selection
  const [fromGov, setFromGov] = useState<string>('الشرقية');
  const [fromCity, setFromCity] = useState<string>('العاشر من رمضان');
  const [fromVillageOrZone, setFromVillageOrZone] = useState<string>('المنطقة الصناعية B1');
  const [customFromLocation, setCustomFromLocation] = useState<string>('');

  const [toGov, setToGov] = useState<string>('القاهرة');
  const [toCity, setToCity] = useState<string>('مدينة نصر');
  const [toVillageOrZone, setToVillageOrZone] = useState<string>('مكرم عبيد');
  const [customToLocation, setCustomToLocation] = useState<string>('');

  // Uber-style Google Maps GPS coordinates & interactive pin
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({ lat: 30.3015, lng: 31.7454 }); // Tenth of Ramadan
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number }>({ lat: 30.0561, lng: 31.3414 }); // Nasr City
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Shipment parameters
  const [truckType, setTruckType] = useState(initialDetails?.truckType || 'curtain');
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState<number>(initialDetails?.weight || 20);
  const [tripPrice, setTripPrice] = useState<number>(initialDetails?.price || 4500);
  const [pickupDate, setPickupDate] = useState('اليوم أو خلال 24 ساعة');
  const [phone, setPhone] = useState('');
  const [senderName, setSenderName] = useState('');
  
  // Submission
  const [confirmed, setConfirmed] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const currentProfile = activeCommissionProfile || DEFAULT_COMMISSION_PROFILES[0];
  const calculatedCommission = calculateTripCommission(tripPrice, currentProfile);

  if (!isOpen) return null;

  // Selected Gov cities & subZones
  const currentFromGovData = EGYPT_LOCATIONS.find(l => l.governorate === fromGov) || EGYPT_LOCATIONS[0];
  const currentFromCityData = currentFromGovData.cities.find(c => c.name === fromCity) || currentFromGovData.cities[0];

  const currentToGovData = EGYPT_LOCATIONS.find(l => l.governorate === toGov) || EGYPT_LOCATIONS[1];
  const currentToCityData = currentToGovData.cities.find(c => c.name === toCity) || currentToGovData.cities[0];

  // GPS geolocation helper
  const handleDetectCurrentLocation = () => {
    setIsLocatingGPS(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
          setCustomFromLocation(`موقعي الجغرافي الحالي (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsLocatingGPS(false);
        },
        () => {
          // Fallback to central Cairo
          setPickupCoords({ lat: 30.0444, lng: 31.2357 });
          setCustomFromLocation('القاهرة الكبرى - ميدان التحرير');
          setIsLocatingGPS(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocatingGPS(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = `EG-${Math.floor(10000 + Math.random() * 90000)}`;
    setTrackingNumber(generatedCode);
    setConfirmed(true);
  };

  const resetAndClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">طلب شاحنة ونقل بضاعة</h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded border border-blue-400/30">
                  مصر - جميع المدن والقرى
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تحديد الوجهة بالخريطة الحية (Uber style) أو عبر شبكة محافظات وقرى ومصانع مصر
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {confirmed ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              
              <h4 className="text-2xl font-black text-slate-900">
                تم إرسال طلب النقل بنجاح!
              </h4>
              
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                تم تعميم خط السير من <strong className="text-slate-900">{fromGov} - {fromCity} ({fromVillageOrZone || customFromLocation})</strong> إلى <strong className="text-slate-900">{toGov} - {toCity} ({toVillageOrZone || customToLocation})</strong> على كافة السيارات ومكاتب النقل المؤهلة فورياً.
              </p>

              {/* Order Reference Card */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl max-w-sm mx-auto text-center space-y-1">
                <span className="text-xs text-slate-500 block">رقم بوليصة الطلب المؤقتة:</span>
                <span className="text-2xl font-mono font-black text-blue-700">{trackingNumber}</span>
                <span className="text-[11px] text-slate-600 block">
                  العمولة المطبقة: <strong className="text-emerald-700">{calculatedCommission.shipperFee} ج.م</strong> على الشركة و <strong className="text-blue-700">{calculatedCommission.transporterFee} ج.م</strong> على السائق ({currentProfile.name})
                </span>
              </div>

              {/* Live Tracking / Direct Maps Navigation link */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto text-right text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Route className="w-4 h-4 text-blue-600" />
                  <span>خط السير المعتمد على خريطة Google:</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Origin: {pickupCoords.lat}, {pickupCoords.lng} → Dest: {dropoffCoords.lat}, {dropoffCoords.lng}
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${pickupCoords.lat},${pickupCoords.lng}&destination=${dropoffCoords.lat},${dropoffCoords.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                >
                  <span>عرض مسار الرحلة على تطبيق Google Maps المباشر</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-3">
                <button
                  onClick={resetAndClose}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-all"
                >
                  إغلاق ومتابعة الشحنات
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Location Mode Switcher: Uber Maps vs Detailed Egyptian Tree */}
              <div className="p-1 bg-slate-100 rounded-2xl flex items-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLocationMode('governorate_village')}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    locationMode === 'governorate_village'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>مدن وقرى ومحافظات مصر (قائمة شاملة)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('google_maps_pin')}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    locationMode === 'google_maps_pin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Navigation className="w-4 h-4 text-rose-600" />
                  <span>تحديد دقيق بالخريطة (مثل أوبر / Google Maps)</span>
                </button>
              </div>

              {/* Section 1: Detailed Governorate & Village Selection */}
              {locationMode === 'governorate_village' ? (
                <div className="space-y-4">
                  
                  {/* From Location Hierarchy */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>نقطة التحميل والاستلام (مصر):</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={isLocatingGPS}
                        className="text-[11px] font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <LocateFixed className="w-3 h-3 text-emerald-600" />
                        <span>{isLocatingGPS ? 'جاري تحديد موقعك...' : 'تحديد موقعي الآن GPS'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المحافظة:</label>
                        <select
                          value={fromGov}
                          onChange={(e) => {
                            const newGov = e.target.value;
                            setFromGov(newGov);
                            const govData = EGYPT_LOCATIONS.find(l => l.governorate === newGov);
                            if (govData && govData.cities[0]) {
                              setFromCity(govData.cities[0].name);
                              setFromVillageOrZone(govData.cities[0].subZones?.[0] || '');
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                        >
                          {EGYPT_LOCATIONS.map(l => (
                            <option key={l.governorate} value={l.governorate}>{l.governorate}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المركز / المدينة / الميناء:</label>
                        <select
                          value={fromCity}
                          onChange={(e) => {
                            const newCity = e.target.value;
                            setFromCity(newCity);
                            const cData = currentFromGovData.cities.find(c => c.name === newCity);
                            setFromVillageOrZone(cData?.subZones?.[0] || '');
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                        >
                          {currentFromGovData.cities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">القرية / المنطقة الصناعية:</label>
                        <select
                          value={fromVillageOrZone}
                          onChange={(e) => setFromVillageOrZone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                        >
                          {(currentFromCityData.subZones || []).map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                          <option value="أخرى">قرية / منطقة أخرى...</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customFromLocation}
                        onChange={(e) => setCustomFromLocation(e.target.value)}
                        placeholder="تفاصيل إضافية: اسم المصنع، بوابة التحميل، علامة مميزة بالقرية..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* To Location Hierarchy */}
                  <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>نقطة التسليم والتفريغ (الوجهة):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المحافظة:</label>
                        <select
                          value={toGov}
                          onChange={(e) => {
                            const newGov = e.target.value;
                            setToGov(newGov);
                            const govData = EGYPT_LOCATIONS.find(l => l.governorate === newGov);
                            if (govData && govData.cities[0]) {
                              setToCity(govData.cities[0].name);
                              setToVillageOrZone(govData.cities[0].subZones?.[0] || '');
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        >
                          {EGYPT_LOCATIONS.map(l => (
                            <option key={l.governorate} value={l.governorate}>{l.governorate}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المركز / المدينة / الميناء:</label>
                        <select
                          value={toCity}
                          onChange={(e) => {
                            const newCity = e.target.value;
                            setToCity(newCity);
                            const cData = currentToGovData.cities.find(c => c.name === newCity);
                            setToVillageOrZone(cData?.subZones?.[0] || '');
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        >
                          {currentToGovData.cities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">القرية / المنطقة الصناعية:</label>
                        <select
                          value={toVillageOrZone}
                          onChange={(e) => setToVillageOrZone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        >
                          {(currentToCityData.subZones || []).map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                          <option value="أخرى">قرية / منطقة أخرى...</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customToLocation}
                        onChange={(e) => setCustomToLocation(e.target.value)}
                        placeholder="تفاصيل إضافية: اسم المخزن، شارع، موقع استلام العميل..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                </div>
              ) : (
                /* Section 2: Uber-Style Interactive Map Location Picker */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-sm bg-slate-100">
                    
                    {/* Simulated Interactive Google Maps Viewport with Live Route */}
                    <div className="relative h-64 sm:h-72 w-full bg-[#e8ecf1] overflow-hidden flex flex-col justify-between p-3">
                      
                      {/* Stylized Vector Map Roads/Grid background */}
                      <div className="absolute inset-0 opacity-40 pointer-events-none">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                          </pattern>
                          <rect width="100%" height="100%" fill="url(#map-grid)" />
                          {/* Main Highway Route (Egypt Cairo - Alex / Suez Corridor) */}
                          <path d="M 50 200 Q 200 80, 500 130 T 800 60" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="8 4" />
                          <path d="M 120 220 Q 300 180, 600 240" fill="none" stroke="#94a3b8" strokeWidth="3" />
                        </svg>
                      </div>

                      {/* Map Controls Header */}
                      <div className="relative z-10 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                          <Navigation className="w-4 h-4 text-blue-600" />
                          <span>خريطة مصر التفاعلية (Google Maps Routing):</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPickupCoords({ lat: 30.0444, lng: 31.2357 });
                              setDropoffCoords({ lat: 31.2001, lng: 29.9187 });
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                          >
                            القاهرة ⇄ الإسكندرية
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPickupCoords({ lat: 30.3015, lng: 31.7454 });
                              setDropoffCoords({ lat: 29.9668, lng: 32.5498 });
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                          >
                            العاشر ⇄ السخنة
                          </button>
                        </div>
                      </div>

                      {/* Map Center Pins (Uber style Pickup & Dropoff Markers) */}
                      <div className="relative z-10 flex items-center justify-around h-full py-4 pointer-events-none">
                        {/* Pickup Pin */}
                        <div className="flex flex-col items-center animate-bounce">
                          <div className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-lg shadow-md mb-1">
                            نقطة التحميل (موقعك)
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Animated Route Distance Arrow */}
                        <div className="px-3 py-1 bg-slate-900/80 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                          <Route className="w-3 h-3 text-amber-400" />
                          <span>مسافة مقدرة: ~85 كم عبر الطريق الصحراوي</span>
                        </div>

                        {/* Dropoff Pin */}
                        <div className="flex flex-col items-center animate-pulse">
                          <div className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-black rounded-lg shadow-md mb-1">
                            نقطة التسليم والوجهة
                          </div>
                          <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Map Bottom Info Bar */}
                      <div className="relative z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-800">
                            تحميل: Lat {pickupCoords.lat}, Lng {pickupCoords.lng}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-rose-800">
                            تسليم: Lat {dropoffCoords.lat}, Lng {dropoffCoords.lng}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectCurrentLocation}
                          className="text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <LocateFixed className="w-3 h-3" />
                          <span>تحديث الإحداثيات عبر الـ GPS</span>
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Manual Coordinate / Address Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">عنوان / إحداثيات التحميل الدقيقة:</label>
                      <input
                        type="text"
                        value={customFromLocation || `${fromCity} (${pickupCoords.lat}, ${pickupCoords.lng})`}
                        onChange={(e) => setCustomFromLocation(e.target.value)}
                        placeholder="العنوان أو الإحداثيات بالظبط..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">عنوان / إحداثيات التسليم الدقيقة:</label>
                      <input
                        type="text"
                        value={customToLocation || `${toCity} (${dropoffCoords.lat}, ${dropoffCoords.lng})`}
                        onChange={(e) => setCustomToLocation(e.target.value)}
                        placeholder="العنوان أو الإحداثيات بالظبط..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Truck Type & Cargo Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع السيارة المطلوبة:</label>
                  <select
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  >
                    {TRUCK_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.capacity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع البضاعة:</label>
                  <input
                    type="text"
                    required
                    value={cargoName}
                    onChange={(e) => setCargoName(e.target.value)}
                    placeholder="مثال: أسمنت، كرتون، سيراميك..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوزن التقريبي (طن):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Pricing & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الشحن المقترح (ج.م):</label>
                  <input
                    type="number"
                    step="100"
                    min="500"
                    value={tripPrice}
                    onChange={(e) => setTripPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-blue-700 font-mono focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">موعد التحميل:</label>
                  <select
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="اليوم أو خلال 24 ساعة">اليوم أو خلال 24 ساعة (عاجل)</option>
                    <option value="خلال يومين إلى 3 أيام">خلال يومين إلى 3 أيام</option>
                    <option value="نهاية الأسبوع">نهاية الأسبوع الحالي</option>
                    <option value="شحنة دورية مجدولة">شحنة دورية مجدولة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التنسيق المباشر:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Live Dynamic Commission Breakdown based on Active Profile */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-black">
                  <span className="text-slate-800">حسبة وتوزيع العمولة للطرفين (حسب رؤية الإدارة):</span>
                  <span className="text-sm text-blue-800 font-mono">
                    السعر: {tripPrice.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/80">
                  <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-slate-700 font-bold">عمولة الشركة / صاحب البضاعة:</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {calculatedCommission.shipperFee.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span className="text-slate-700 font-bold">عمولة السائق / صاحب السيارة:</span>
                    <span className="text-sm font-black text-blue-700 font-mono">
                      {calculatedCommission.transporterFee.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-medium">
                  <span>البروفايل المفعل: <strong>{currentProfile.name}</strong> (معامل مضاعفة: {currentProfile.multiplier}x)</span>
                  <span>الشريحة: {calculatedCommission.tierLabel}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-5 h-5" />
                  <span>تأكيد إرسال الطلب وحجز الشاحنة الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
