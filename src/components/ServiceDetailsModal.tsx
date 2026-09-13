import React from 'react';
import { 
  X, 
  FileText, 
  Award, 
  Truck, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

interface ServiceDetailsModalProps {
  serviceKey: string | null;
  onClose: () => void;
  onAction: () => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  serviceKey,
  onClose,
  onAction,
}) => {
  if (!serviceKey) return null;

  const servicesData: Record<string, {
    title: string;
    subtitle: string;
    icon: any;
    details: string;
    points: string[];
    actionLabel: string;
  }> = {
    orders: {
      title: 'إدارة الطلبات وبوالص الشحن',
      subtitle: 'بكل سهولة ومرونة',
      icon: FileText,
      details: 'نظام إلكتروني متقدم لإنشاء ومتابعة بوالص النقل الرقمية وتحديد شروط الشحن، وتعيين السائق والشاحنة المعتمدة مع توثيق لحظة التحميل والتسليم.',
      points: [
        'إصدار فوري لبوالص الشحن البرية المعتمدة',
        'متابعة حالة جميع الشحنات في لوحة تحكم واحدة',
        'أرشفة إلكترونية كاملة للفواتير وإيصالات الاستلام',
        'إشعارات لحظية عبر الرسائل القصيرة والبريد'
      ],
      actionLabel: 'إنشاء طلب شحن جديد'
    },
    contracts: {
      title: 'بوالص الشحن والعقود الرقمية المعتمدة',
      subtitle: 'توثيق رسمي وحماية كاملة لكافة الأطراف',
      icon: Award,
      details: 'منظومة متكاملة لإصدار وتوثيق بوالص النقل الإلكترونية المعتمدة وعقود الشحن اللحظية المتوافقة مع متطلبات الهيئة العامة للنقل، مع إثبات فوري للتحميل والتسليم.',
      points: [
        'ربط إلكتروني مباشر ومعتمد مع منصات ولوائح هيئة النقل',
        'توثيق إلكتروني فوري لحالات التحميل والاستلام والتفريغ',
        'أرشفة سحابية كاملة لجميع المستندات والفواتير الضريبية',
        'حماية قانونية ومالية شاملة لجميع الأطراف المتعاقدة'
      ],
      actionLabel: 'طلب استشارة التعاقدات وبوالص الشحن'
    },
    fleet: {
      title: 'إدارة السيارات وأسطول النقل',
      subtitle: 'وفرص أكثر',
      icon: Truck,
      details: 'أداة ذكية لأصحاب الشاحنات والشركات لإدارة صيانة المركبات، فترات الفحص الدوري، وتوزيع السائقين بما يضمن أعلى معدل تشغيل وأعلى عائد ربحي.',
      points: [
        'جدولة الحمولات دون أيام توقف',
        'متابعة استهلاك الوقود ومواعيد الصيانة الدورية',
        'تنبيهات تجديد رخص السير ووثائق التأمين',
        'ربط مباشر مع منصات التوجيه المعتمدة'
      ],
      actionLabel: 'إضافة شاحنة للأسطول'
    },
    networking: {
      title: 'ربط الأطراف اللوجستية الموثوقة',
      subtitle: 'بمنصة موثوقة',
      icon: Users,
      details: 'منظومة شبكية رقمية موثقة تربط التجار والمصانع بأكبر شبكة من السائقين ومكاتب الشحن البري المرخصة لضمان أمان العمليات والحد من الوسطاء غير الرسميين.',
      points: [
        'التحقق التلقائي من السجلات والتراخيص الرسمية',
        'تقييمات متبادلة موثقة بعد كل رحلة نقل',
        'عقود نقل رقمية ملزمة تضمن حقوق الطرفين',
        'تسوية مالية آمنة ومضمونة 100%'
      ],
      actionLabel: 'الانضمام لشبكة النقل'
    },
    security: {
      title: 'البيانات والأمان والتأمين الشامل',
      subtitle: 'خصوصية مضمونة',
      icon: ShieldCheck,
      details: 'تشفير متطور لكافة البيانات المالية ومعلومات الشحنات مع تغطية تأمينية شاملة على جميع البضائع المنقولة ضد السرقة والتلف والحوادث.',
      points: [
        'تأمين على البضائع بالتعاون مع كبرى شركات التأمين',
        'تشفير بنكي 256-bit لجميع المعاملات والمدفوعات',
        'حماية سرية مسارات الشحن وقوائم العملاء',
        'فريق طوارئ واستجابة سريعة على مدار الساعة'
      ],
      actionLabel: 'الاطلاع على وثيقة التأمين'
    },
    analytics: {
      title: 'تقارير وإحصائيات الأداء',
      subtitle: 'الأفضل للقرارات',
      icon: BarChart3,
      details: 'تحليلات بيانية دقيقة تمنحك رؤية شاملة لتكاليف النقل، ومعدلات الأداء، ومتوسط أسعار المسارات لمساعدتك في خفض النفقات اللوجستية بنسبة تصل إلى 25%.',
      points: [
        'لوحات مؤشرات قياس أداء النقل في الوقت الفعلي',
        'مقارنة أسعار مسارات النقل التاريخية والمتوقعة',
        'تقارير تصديرية بصيغ Excel و PDF بضغطة زر',
        'توصيات ذكية لتحسين خطوط الشحن واللوجستيات'
      ],
      actionLabel: 'استعراض تقرير تجريبي'
    },
  };

  const current = servicesData[serviceKey] || servicesData['orders'];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black">{current.title}</h3>
              <p className="text-xs text-slate-300">{current.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-700 font-medium leading-relaxed mb-5">
            {current.details}
          </p>

          <h4 className="text-xs font-bold text-slate-900 mb-3">أبرز خصائص الخدمة:</h4>
          <ul className="space-y-2 mb-6">
            {current.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                onClose();
                onAction();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <span>{current.actionLabel}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
