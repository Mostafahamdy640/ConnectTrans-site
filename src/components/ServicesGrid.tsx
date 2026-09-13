import React from 'react';
import { 
  FileText, 
  Award, 
  Truck, 
  Users, 
  ShieldCheck, 
  BarChart3 
} from 'lucide-react';

interface ServicesGridProps {
  onSelectService: (serviceKey: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const services = [
    {
      key: 'orders',
      title: 'إدارة الطلبات',
      subtitle: 'بكل سهولة ومرونة',
      icon: FileText,
      description: 'إنشاء ومتابعة طلبات الشحن اللوجستي وتعيين الشاحنات المناسبة مع إدارة العقود الرقمية.'
    },
    {
      key: 'contracts',
      title: 'بوالص وعقود رقمية',
      subtitle: 'موثقة ومعتمدة',
      icon: Award,
      description: 'إصدار فوري لبوالص الشحن الإلكترونية المعتمدة وعقود النقل المتوافقة مع الهيئة العامة للنقل.'
    },
    {
      key: 'fleet',
      title: 'إدارة السيارات',
      subtitle: 'وفرص أكثر',
      icon: Truck,
      description: 'جدولة الشاحنات ومراقبة الصيانة والأداء وزيادة معدل تشغيل المركبات دون رحلات فارغة.'
    },
    {
      key: 'networking',
      title: 'ربط الأطراف',
      subtitle: 'بمنصة موثوقة',
      icon: Users,
      description: 'شبكة مباشرة تربط أصحاب البضائع بشركات النقل والسائقين المعتمدين بضمان الشفافية.'
    },
    {
      key: 'security',
      title: 'البيانات والأمان',
      subtitle: 'خصوصية مضمونة',
      icon: ShieldCheck,
      description: 'حماية كاملة لبيانات العمليات والاتفاقيات المالية وتأمين شامل على البضائع المنقولة.'
    },
    {
      key: 'analytics',
      title: 'تقارير وإحصائيات',
      subtitle: 'الأفضل للقرارات',
      icon: BarChart3,
      description: 'لوحات بيانية مفصلة للأداء والتكاليف ومتوسط أسعار الشحن لمساعدتك في اتخاذ قرارات دقيقة.'
    },
  ];

  return (
    <section id="services" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header with Golden Flanking Dividers */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center gap-4 w-full max-w-lg mx-auto">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e59819]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 whitespace-nowrap">
            خدمات <span className="text-blue-600">ConnectTrans</span>
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e59819]" />
        </div>
        <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
          مجموعة متكاملة من الخدمات لتجربة نقل أسهل وأكثر كفاءة
        </p>
      </div>

      {/* 6 Services Horizontal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {services.map((srv) => {
          const IconComponent = srv.icon;
          return (
            <div
              key={srv.key}
              id={`service-card-${srv.key}`}
              onClick={() => onSelectService(srv.key)}
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
            >
              {/* Blue Icon */}
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center text-blue-600 group-hover:text-white transition-all duration-300 mb-3 shadow-2xs">
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                {srv.title}
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {srv.subtitle}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
};
