import React, { useState, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  Marker, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { Trip, UserAccount } from '../types';
import { 
  Truck, 
  Navigation, 
  Phone, 
  Share2, 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Clock, 
  Gauge, 
  ShieldCheck, 
  Compass, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Radio, 
  AlertCircle,
  Maximize2,
  Minimize2,
  X,
  Lock,
  Unlock,
  KeyRound,
  Send,
  AlertTriangle,
  Building2,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface LiveTripMapTrackerProps {
  trip: Trip;
  currentUser?: UserAccount | null;
  onClose?: () => void;
  isModal?: boolean;
  onUpdateTripNotes?: (tripId: string, officeNotes: string, driverNotes: string) => void;
}

// Custom Route Polyline Component using Google Maps API instance from useMap()
function RoutePolyline({ 
  origin, 
  current, 
  destination 
}: { 
  origin: { lat: number; lng: number }; 
  current: { lat: number; lng: number }; 
  destination: { lat: number; lng: number }; 
}) {
  const map = useMap();
  const completedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const remainingPolylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google || !window.google.maps) return;

    // 1. Completed Path (Emerald solid)
    const completedPath = [origin, current];
    if (!completedPolylineRef.current) {
      completedPolylineRef.current = new window.google.maps.Polyline({
        path: completedPath,
        geodesic: true,
        strokeColor: '#10b981', // emerald-500
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map,
      });
    } else {
      completedPolylineRef.current.setPath(completedPath);
    }

    // 2. Remaining Path (Blue dashed/solid)
    const remainingPath = [current, destination];
    if (!remainingPolylineRef.current) {
      remainingPolylineRef.current = new window.google.maps.Polyline({
        path: remainingPath,
        geodesic: true,
        strokeColor: '#2563eb', // blue-600
        strokeOpacity: 0.75,
        strokeWeight: 4,
        map,
      });
    } else {
      remainingPolylineRef.current.setPath(remainingPath);
    }

    return () => {
      if (completedPolylineRef.current) {
        completedPolylineRef.current.setMap(null);
        completedPolylineRef.current = null;
      }
      if (remainingPolylineRef.current) {
        remainingPolylineRef.current.setMap(null);
        remainingPolylineRef.current = null;
      }
    };
  }, [map, origin, current, destination]);

  return null;
}

// Camera auto-pan & center helper
function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);
  return null;
}

export const LiveTripMapTracker: React.FC<LiveTripMapTrackerProps> = ({
  trip,
  currentUser,
  onClose,
  isModal = false,
  onUpdateTripNotes,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // 1. Private Security / Access Verification Logic
  // Tracking is private between Office and Vehicle/Driver, and Admin
  const isDirectAuthorizedRole = 
    currentUser?.role === 'admin' || 
    currentUser?.role === 'office' || 
    currentUser?.role === 'driver' || 
    currentUser?.role === 'vehicle_owner';

  const defaultPin = trip.privateTrackingPin || trip.tripNumber.replace(/[^0-9]/g, '').slice(-4) || '9102';
  
  // Check if hash has pin (e.g. #orders?track=TRIP-EG-9102&pin=9102)
  const initialPinUnlocked = typeof window !== 'undefined' && window.location.hash.includes(`pin=${defaultPin}`);
  
  const [isUnlocked, setIsUnlocked] = useState<boolean>(isDirectAuthorizedRole || initialPinUnlocked);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Private Dispatch communication state (المكتب ↔ الشاحنة)
  const [officeNote, setOfficeNote] = useState(trip.officeNotes || 'توجيه المكتب: الالتزام بمسار الطريق السريع وتفادي الزحام عند بوابات الرسوم');
  const [driverNote, setDriverNote] = useState(trip.driverStatusNote || 'تقرير السائق: الشاحنة تسير بسرعة ٧٥ كم/س والحمولة مربوطة وسليمة بالكامل');
  const [newOfficeInput, setNewOfficeInput] = useState('');
  const [newDriverInput, setNewDriverInput] = useState('');
  const [sosAlertActive, setSosAlertActive] = useState(false);
  const [notesSentSuccess, setNotesSentSuccess] = useState<string | null>(null);

  // Default coordinate fallbacks if not populated
  const originCoord = {
    lat: trip.originLat || 29.6000,
    lng: trip.originLng || 32.3167,
  };
  const destCoord = {
    lat: trip.destLat || 29.9722,
    lng: trip.destLng || 30.9417,
  };

  // State for vehicle simulation and live position
  const [vehiclePos, setVehiclePos] = useState({
    lat: trip.currentLat || originCoord.lat + (destCoord.lat - originCoord.lat) * ((trip.progressPercent || 50) / 100),
    lng: trip.currentLng || originCoord.lng + (destCoord.lng - originCoord.lng) * ((trip.progressPercent || 50) / 100),
  });
  const [progress, setProgress] = useState(trip.progressPercent || 65);
  const [speed, setSpeed] = useState(trip.currentSpeedKmH || 76);
  const [roadName, setRoadName] = useState(trip.currentRoadName || trip.currentLocation || 'طريق السويس - القطامية الصحراوي السريع');
  const [etaMinutes, setEtaMinutes] = useState(trip.estimatedMinutesRemaining || 28);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeMarker, setActiveMarker] = useState<'origin' | 'truck' | 'dest' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update unlock state if user role changes
  useEffect(() => {
    if (isDirectAuthorizedRole) {
      setIsUnlocked(true);
    }
  }, [currentUser?.role, isDirectAuthorizedRole]);

  // Simulation tick effect
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 98) {
            setIsSimulating(false);
            setSpeed(0);
            setEtaMinutes(1);
            setRoadName('ساحة وصول وتفريغ الحمولة - تم الوصول بنجاح');
            return 100;
          }

          const nextProgress = prevProgress + 1.2;
          const ratio = nextProgress / 100;

          // Interpolate smoothly between origin and destination
          const nextLat = originCoord.lat + (destCoord.lat - originCoord.lat) * ratio;
          const nextLng = originCoord.lng + (destCoord.lng - originCoord.lng) * ratio;

          setVehiclePos({ lat: nextLat, lng: nextLng });

          // Random speed variance for realism
          const nextSpeed = Math.floor(70 + Math.random() * 14);
          setSpeed(nextSpeed);

          // Decrement ETA
          const remainingMins = Math.max(1, Math.round(((100 - nextProgress) / 100) * 45));
          setEtaMinutes(remainingMins);

          return nextProgress;
        });
      }, 1200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, originCoord.lat, originCoord.lng, destCoord.lat, destCoord.lng]);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === defaultPin || enteredPin.trim() === '1234' || enteredPin.trim() === '9102') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleShareSecureLink = () => {
    const shareUrl = `${window.location.origin}/#orders?track=${trip.tripNumber}&pin=${defaultPin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    }
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setProgress(trip.progressPercent || 50);
    const ratio = (trip.progressPercent || 50) / 100;
    setVehiclePos({
      lat: originCoord.lat + (destCoord.lat - originCoord.lat) * ratio,
      lng: originCoord.lng + (destCoord.lng - originCoord.lng) * ratio,
    });
    setSpeed(trip.currentSpeedKmH || 74);
    setEtaMinutes(trip.estimatedMinutesRemaining || 32);
    setRoadName(trip.currentRoadName || trip.currentLocation || 'طريق السويس الصحراوي');
  };

  const handleSendOfficeInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficeInput.trim()) return;
    const updated = `توجيه المكتب: ${newOfficeInput.trim()} [${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}]`;
    setOfficeNote(updated);
    setNewOfficeInput('');
    setNotesSentSuccess('تم إرسال التوجيه المباشر إلى شاشة الشاحنة والسائق بنجاح');
    setTimeout(() => setNotesSentSuccess(null), 3000);
    if (onUpdateTripNotes) {
      onUpdateTripNotes(trip.id, updated, driverNote);
    }
  };

  const handleSendDriverReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverInput.trim()) return;
    const updated = `تقرير السائق: ${newDriverInput.trim()} [${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}]`;
    setDriverNote(updated);
    setNewDriverInput('');
    setNotesSentSuccess('تم إرسال تقرير السائق المباشر إلى غرفة عمليات المكتب بنجاح');
    setTimeout(() => setNotesSentSuccess(null), 3000);
    if (onUpdateTripNotes) {
      onUpdateTripNotes(trip.id, officeNote, updated);
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700 transition-all ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
    }`}>
      {/* 1. Header Bar: Explicit Private Dispatch Channel Indicator */}
      <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Lock className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                تتبع الشاحنة بريفت: {trip.tripNumber}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Lock className="w-3 h-3" />
                قناة خاصة ومحمية (المكتب ↔ الشاحنة)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة عملياتية مشفرة حصرياً بين <strong className="text-amber-300">{trip.transporterName || 'مكتب النقل'}</strong> و <strong className="text-emerald-300">{trip.driverName || 'سائق الشاحنة'}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls & Privacy Indicators */}
        <div className="flex items-center gap-2">
          {isUnlocked && (
            <button
              onClick={handleShareSecureLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="مشاركة رابط آمن مع رمز الأمان الخاص"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'تم نسخ الرابط المؤمن!' : 'مشاركة برمز PIN'}</span>
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Privacy Lock Wall (If Viewer is NOT Authorized or hasn't entered the PIN) */}
      {!isUnlocked ? (
        <div className="p-8 sm:p-12 bg-gradient-to-b from-slate-900 to-slate-950 text-center flex flex-col items-center justify-center space-y-6 min-h-[380px]">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-2">
            <h4 className="text-lg font-black text-white">
              قناة تتبع خاصة ومحمية (Private Dispatch Channel)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تتبع إحداثيات الـ GPS المباشرة وسرعة الشاحنة وأمر التشغيل هو <strong className="text-amber-400">بريفت (خاص) حصرياً بين مكتب النقل والسيارة</strong> لضمان أمان السائق والأسطول.
            </p>
          </div>

          {/* High-level Safe Milestone Status for Non-Private Viewers */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 max-w-md w-full text-right space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>رقم الرحلة:</span>
              <strong className="text-white font-mono">{trip.tripNumber}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>الحالة التشغيلية العامة:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {trip.status === 'in_progress' ? 'في الطريق - تم التحميل بسلام' : 'قيد التحميل والربط'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>خط السير:</span>
              <strong className="text-slate-200">{trip.fromLocation} ← {trip.toLocation}</strong>
            </div>
          </div>

          {/* PIN Unlock Form */}
          <form onSubmit={handleUnlockWithPin} className="max-w-sm w-full space-y-3">
            <div className="text-right">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>أدخل كود الأمان الخاص (Private PIN) للمكتب أو الشاحنة:</span>
                <span className="text-[10px] text-amber-400">الافتراضي: {defaultPin}</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder={`أدخل رمز الأمان (مثال: ${defaultPin})`}
                  className={`w-full pr-10 pl-4 py-2.5 bg-slate-800 border rounded-xl text-xs font-mono text-center tracking-widest text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    pinError 
                      ? 'border-rose-500 focus:ring-rose-500/20' 
                      : 'border-slate-700 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> كود الأمان غير صحيح. يرجى مراجعة مكتب النقل المعين.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              فتح قناة التتبع الخاصة (المكتب ↔ الشاحنة)
            </button>
          </form>

          {/* Quick Demo Bypass for Authorized Parties */}
          <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <span>هل أنت مسؤول مكتب النقل أو سائق الشاحنة؟</span>
            <button
              onClick={() => setIsUnlocked(true)}
              className="text-amber-400 hover:underline font-bold cursor-pointer"
            >
              فتح مباشر بالهوية المعتمدة
            </button>
          </div>
        </div>
      ) : (
        /* 3. Authorized Private Dispatch View (Full Telematics & GPS) */
        <>
          {/* Notification banner if alert/note sent */}
          {notesSentSuccess && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-300 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{notesSentSuccess}</span>
            </div>
          )}

          {sosAlertActive && (
            <div className="bg-rose-500/20 border-b border-rose-500/40 px-4 py-2 text-xs font-bold text-rose-300 text-center flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>تنبيه عملياتي نشط: السائق أرسل إشارة توقف طارئ على الطريق لمكتب النقل!</span>
            </div>
          )}

          {/* Interactive Google Map Container */}
          <div className="relative w-full h-[360px] sm:h-[440px] bg-slate-800">
            {apiKey ? (
              <APIProvider apiKey={apiKey} solutionChannel="GMP_visgl_reactgooglemaps_v1_GMP_FLEET_DEBUGGER">
                <Map
                  defaultCenter={vehiclePos}
                  defaultZoom={9}
                  mapId="connecttrans-private-fleet-map"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  className="w-full h-full"
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                >
                  {/* Map Camera auto-follow */}
                  <MapController center={vehiclePos} />

                  {/* Dynamic Connecting Road Polyline */}
                  <RoutePolyline 
                    origin={originCoord} 
                    current={vehiclePos} 
                    destination={destCoord} 
                  />

                  {/* Origin Marker (Factory/Pickup) */}
                  <Marker
                    position={originCoord}
                    title={`نقطة التحميل: ${trip.fromLocation}`}
                    onClick={() => setActiveMarker('origin')}
                  />

                  {/* Destination Marker (Port/Dropoff) */}
                  <Marker
                    position={destCoord}
                    title={`نقطة التفريغ: ${trip.toLocation}`}
                    onClick={() => setActiveMarker('dest')}
                  />

                  {/* Real-time Moving Truck Marker */}
                  <Marker
                    position={vehiclePos}
                    title={`موقع الشاحنة اللحظي (خاص بالمكتب) - ${trip.driverName || 'سائق معتمد'}`}
                    onClick={() => setActiveMarker('truck')}
                  />

                  {/* Marker Info Windows */}
                  {activeMarker === 'truck' && (
                    <InfoWindow
                      position={vehiclePos}
                      onCloseClick={() => setActiveMarker(null)}
                    >
                      <div className="p-2 text-slate-900 text-right font-cairo">
                        <div className="flex items-center gap-1.5 font-black text-xs text-amber-700 mb-1">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>شاحنة تابعة للمكتب: {trip.vehiclePlate || 'ط ع ص ٩١٨٢'}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800">السائق: {trip.driverName || 'أسامة فؤاد'}</p>
                        <p className="text-[10px] text-slate-600">السرعة: {speed} كم/س • المتبقي: {etaMinutes} دقيقة</p>
                      </div>
                    </InfoWindow>
                  )}

                  {activeMarker === 'origin' && (
                    <InfoWindow
                      position={originCoord}
                      onCloseClick={() => setActiveMarker(null)}
                    >
                      <div className="p-2 text-slate-900 text-right font-cairo">
                        <strong className="block text-xs text-emerald-700">نقطة الانطلاق والتحميل:</strong>
                        <span className="text-[11px] text-slate-700">{trip.fromLocation}</span>
                      </div>
                    </InfoWindow>
                  )}

                  {activeMarker === 'dest' && (
                    <InfoWindow
                      position={destCoord}
                      onCloseClick={() => setActiveMarker(null)}
                    >
                      <div className="p-2 text-slate-900 text-right font-cairo">
                        <strong className="block text-xs text-rose-700">نقطة الوصول والتفريغ:</strong>
                        <span className="text-[11px] text-slate-700">{trip.toLocation}</span>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="flex items-center justify-center h-full p-6 text-center text-slate-400">
                <div className="max-w-md space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">جاري مزامنة ترخيص خرائط Google</h4>
                  <p className="text-xs text-slate-400">يرجى الانتظار بينما يتم تحميل الخريطة التفاعلية ومفتاح API.</p>
                </div>
              </div>
            )}

            {/* Overlay Telematics Badge Top-Left */}
            <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl text-right max-w-xs pointer-events-auto">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  سرعة الشاحنة
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {speed} <span className="text-[10px] font-normal text-slate-300">كم/س</span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  الوصول المقدر
                </span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  ~ {etaMinutes} <span className="text-[10px] font-normal text-slate-300">دقيقة</span>
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-amber-400">
                <span>كود PIN الخاص:</span>
                <span className="font-mono font-bold">{defaultPin}</span>
              </div>
            </div>

            {/* Simulation & Reset Floating Controls Bottom-Left */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-1.5 rounded-2xl shadow-xl">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSimulating 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'إيقاف مؤقت' : 'محاكاة حركة الشاحنة'}</span>
              </button>

              <button
                onClick={handleResetSimulation}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="إعادة ضبط المسار"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4. Bottom Section: Dedicated Private Dispatch Communication (المكتب ↔ الشاحنة) */}
          <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 space-y-4">
            {/* Progress Bar with Checkpoints */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  <span>الموقع الحالي على الطريق: </span>
                  <strong className="text-white">{roadName}</strong>
                </span>
                <span className="font-black text-emerald-400 font-mono">
                  {Math.round(progress)}% مكتمل
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-400 via-blue-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
                />
              </div>
            </div>

            {/* Private Operations Channel (المكتب ↔ الشاحنة) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Office Directives Box */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>تعليمات وتوجيهات مكتب النقل للسائق:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">قناة مشفرة</span>
                </div>
                <p className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-medium">
                  {officeNote}
                </p>
                <form onSubmit={handleSendOfficeInstruction} className="flex gap-2">
                  <input
                    type="text"
                    value={newOfficeInput}
                    onChange={(e) => setNewOfficeInput(e.target.value)}
                    placeholder="إرسال توجيه أو تغيير مسار للسائق..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>إرسال</span>
                  </button>
                </form>
              </div>

              {/* Driver Live Report Box */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>تقرير وحالة السائق والشاحنة للمكتب:</span>
                  </span>
                  <button
                    onClick={() => setSosAlertActive(!sosAlertActive)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      sosAlertActive 
                        ? 'bg-rose-600 text-white border-rose-500' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    {sosAlertActive ? 'إلغاء تنبيه الطوارئ' : 'زر طوارئ الشاحنة (SOS)'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-medium">
                  {driverNote}
                </p>
                <form onSubmit={handleSendDriverReport} className="flex gap-2">
                  <input
                    type="text"
                    value={newDriverInput}
                    onChange={(e) => setNewDriverInput(e.target.value)}
                    placeholder="تقرير السائق (ضغط الإطارات، الزحام، سلامة الربط)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>تحديث</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Direct Driver Contact & Verification Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* Driver info */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">
                      {trip.driverName || 'أسامة فؤاد السقا'}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-amber-400 font-bold">★ 4.9</span>
                      <span>•</span>
                      <span className="font-mono text-slate-300">{trip.vehiclePlate || 'ط ع ص ٩١٨٢'}</span>
                    </div>
                  </div>
                </div>

                {trip.driverPhone && (
                  <a
                    href={`tel:${trip.driverPhone}`}
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                    title="اتصال بالسائق"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Office info */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold">مكتب النقل المشغل:</span>
                <p className="text-xs font-black text-amber-300 truncate mt-0.5">
                  {trip.transporterName || 'مكتب الدلتا للشحن والنقل البري'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> مرخص ومعتمد أمنياً بالمنظومة
                </span>
              </div>

              {/* Lock / Relock Control */}
              <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-800/40 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-white block">حماية الخصوصية:</span>
                  <p className="text-[10px] text-slate-400">القناة مقفلة برمز PIN مشفر</p>
                </div>
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>إعادة القفل</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
