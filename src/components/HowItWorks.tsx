import React, { useState } from 'react';
import { Building2, Truck, Briefcase, CheckCircle2, ArrowLeft } from 'lucide-react';

interface HowItWorksProps {
  onRegisterRole: (role: 'company' | 'driver' | 'office') => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onRegisterRole }) => {
  const [activeTab, setActiveTab] = useState<'company' | 'driver' | 'office'>('company');

  const content = {
    company: {
      title: 'كيف تبدأ كشركة شحن أو تاجر؟',
      subtitle: 'احصل على شاحنات موثوقة خلال دقائق بأقل تكلفة وضمان وصول',
      steps: [
        {
          num: '1',
          title: 'أنشئ طلب الشحنة',
          desc: 'حدد موقع التحميل، وجهة الوصول، نوع البضاعة والوزن والشاحنة المناسبة.'
        },
        {
          num: '2',
          title: 'استقبل عروض أسعار منافسة',
          desc: 'اختر العرض الأنسب من سائقين ومكاتب نقل معتمدين وموثقين رسمياً.'
        },
        {
          num: '3',
          title: 'تسليم موثق ودفع آمن',
          desc: 'توثيق إلكتروني فوري للتسليم والاستلام مع تحرير المستحقات بضمان وحماية كاملة.'
        }
      ],
      cta: 'سجل شركتك الآن مجاناً',
      role: 'company' as const
    },
    driver: {
      title: 'كيف تبدأ كصاحب شاحنة أو سائق مستقل؟',
      subtitle: 'ضاعف دخلك الشهري واستقبل طلبات نقل فورية دون انتظار في المواقف',
      steps: [
        {
          num: '1',
          title: 'سجل شاحنتك ووثق بياناتك',
          desc: 'أدخل نوع وموديل وحمولة شاحنتك وارفع رخصة القيادة والاستمارة.'
        },
        {
          num: '2',
          title: 'تصفح الحمولات المتاحة',
          desc: 'اختر المسار الأنسب لخط سيرك وتجنب تماماً العودة بحمولة فارغة.'
        },
        {
          num: '3',
          title: 'استلم أرباحك فوراً',
          desc: 'تحويل مالي مباشر لحسابك البنكي فور إتمام التوصيل دون تأخير أو خصومات غير معلنة.'
        }
      ],
      cta: 'انضم كأسطول وسائق شاحنة',
      role: 'driver' as const
    },
    office: {
      title: 'كيف تبدأ كمكتب نقل ووساطة لوجستية؟',
      subtitle: 'أتمتة كاملة لإدارة أسطولك والربط بين العملاء والشاحنات',
      steps: [
        {
          num: '1',
          title: 'أنشئ حساب المكتب المعتمد',
          desc: 'سجل ترخيص النقل الخاص بمكتبك وابدأ بإضافة سياراتك وسائقي المتعاملين معك.'
        },
        {
          num: '2',
          title: 'توزيع وتنظيم الشحنات',
          desc: 'لوحة تحكم ذكية تمكنك من توزيع الحمولات بضغطة زر وإصدار بوالص الشحن.'
        },
        {
          num: '3',
          title: 'تقارير مالية وتشغيلية موحدة',
          desc: 'متابعة فواتير الشحن، تسويات السائقين، ونسب العمولة بشكل مؤتمت بالكامل.'
        }
      ],
      cta: 'ابدأ تفعيل مكتب النقل',
      role: 'office' as const
    }
  };

  const current = content[activeTab];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Golden Dividers */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-4 w-full max-w-lg mx-auto">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e59819]" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 whitespace-nowrap">
              كيف تعمل المنصة
            </h2>
            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e59819]" />
          </div>
          <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
            3 خطوات بسيطة ومباشرة لبدء التعاون ونقل البضائع بكل سلاسة
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-white border border-slate-300 rounded-2xl shadow-xs gap-2">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'company'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>للشركات والمصانع</span>
            </button>

            <button
              onClick={() => setActiveTab('driver')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'driver'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>لأصحاب وسائقي الشاحنات</span>
            </button>

            <button
              onClick={() => setActiveTab('office')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'office'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>لمكاتب النقل والوسطاء</span>
            </button>
          </div>
        </div>

        {/* Active Tab Details */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">{current.title}</h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium">{current.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative">
            {current.steps.map((step, idx) => (
              <div key={step.num} className="relative flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-lg mb-4 shadow-2xs">
                  {step.num}
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2">{step.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-slate-100">
            <button
              onClick={() => onRegisterRole(current.role)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>{current.cta}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
