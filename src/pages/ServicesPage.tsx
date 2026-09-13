import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { ServicesGrid } from '../components/ServicesGrid';
import { ShippingCalculator } from '../components/ShippingCalculator';
import { PageId } from '../types';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Zap, 
  CheckCircle2, 
  FileText, 
  PhoneCall, 
  Award,
  Truck,
  Calculator
} from 'lucide-react';

interface ServicesPageProps {
  onNavigateHome: () => void;
  onSelectService: (serviceKey: string) => void;
  onBookShipment: (details: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigateHome,
  onSelectService,
  onBookShipment,
  onOpenAuth,
}) => {
  const scrollToCalculator = () => {
    const el = document.getElementById('shipping-calc-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* 1. Page Header with Breadcrumbs */}
      <PageHeader
        title="خدمات ConnectTrans"
        subtitle="حلول لوجستية رقمية شاملة لإدارة ونقل البضائع البرية بكفاءة وأمان تام لكافة المنشآت والأفراد"
        badge="الخدمات اللوجستية المتكاملة"
        onNavigateHome={onNavigateHome}
        actionButton={{
          label: 'حاسبة أسعار الشحن',
          onClick: scrollToCalculator,
          icon: Calculator,
        }}
      />

      {/* 2. Main Services Grid (6 services) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesGrid onSelectService={onSelectService} />
      </div>

      {/* 3. Interactive Instant Shipping Rate Calculator */}
      <div id="shipping-calc-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-600 block mb-1">
            تسعير فوري وشفاف
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            حاسبة تكلفة الشحن الفورية
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            احسب التكلفة التقديرية لنقل حمولتك واحجز الشاحنة الأنسب خلال دقائق
          </p>
        </div>

        <ShippingCalculator onBookShipment={onBookShipment} />
      </div>

      {/* 4. Enterprise Quality & SLA Commitments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-700">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-amber-400 block mb-2">
              ضمانات الجودة والأداء
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              التزامنا الصارم بأعلى معايير النقل الآمن
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              جميع الرحلات المنفذة عبر ConnectTrans تخضع لمجموعة من المعايير الرقابية الصارمة والتأمين المتكامل لضمان سلامة حمولتكم ووصولها في الوقت المحدد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">تأمين بنسبة 100%</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تغطية تأمينية شاملة من لحظة تحميل البضاعة وحتى استلامها وتفريغها.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <Clock className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">دقة في المواعيد</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                التزام صارم بجداول التحميل والتسليم المحددة مع نظام تنبيهات استباقي.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <FileText className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">بوالص رقمية معتمدة</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ربط إلكتروني مباشر وتوافق مع لوائح واشتراطات هيئة النقل العامة.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <Award className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">سائقون موثقون</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                فحص دوري لكافة التراخيص والهويات وسجل المخالفات والسلامة لكل ناقل.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-300">
              هل تحتاج إلى حلول مخصصة أو تعاقدات سنوية للمصانع والشركات؟
            </span>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-md"
            >
              طلب استشارة لوجستية
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
