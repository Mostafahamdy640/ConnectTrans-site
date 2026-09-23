import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { HowItWorks } from '../components/HowItWorks';
import { UserRole } from '../types';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  Truck, 
  Briefcase, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigateHome: () => void;
  onRegisterRole: (role: UserRole) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigateHome,
  onRegisterRole,
}) => {
  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* 1. Page Header */}
      <PageHeader
        title="كيف تعمل المنصة"
        subtitle="خطوات واضحة وسريعة تبدأ من التسجيل وحتى إتمام عملية النقل واستلام المستحقات بأعلى درجات الأمان"
        badge="دليل الاستخدام والتشغيل"
        onNavigateHome={onNavigateHome}
        actionButton={{
          label: 'سجل حسابك الآن مجاناً',
          onClick: () => onRegisterRole('company'),
        }}
      />

      {/* 2. Main Interactive How It Works Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HowItWorks onRegisterRole={onRegisterRole} />
      </div>

      {/* Driver & Vehicle Owner Delivery & Payout Guarantee Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-amber-300">
                    ضمانات الدفع والتسليم لصاحب السيارة والسائق
                  </h4>
                  <p className="text-xs text-slate-400">منظومة موثقة ومحمية بين أصحاب الشاحنات ومكاتب النقل والشركات</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-black text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                تحصيل وصرف فوري معتمد
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed">
              عند انتهاء التوصيل: <span className="text-amber-300 font-black">أكّد التوصيل</span>، ويتم <span className="text-sky-300 font-black">التأكد والاعتماد من المكتب</span> واستلم مدفوعاتك بعد التأكد من الانتهاء وتوصيل الأوراق المطلوبة بين الطرفين. وعند <span className="text-emerald-300 font-black underline decoration-emerald-400 decoration-2 underline-offset-4">تصريح المكتب بالصرف</span> يتم تحصيل وصرف المبلغ المالي فوراً.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-black">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-2.5 text-amber-300">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="block font-bold">الخطوة الأولى</span>
                  <span className="text-[11px] text-slate-300 font-normal">تأكيد التوصيل من جهة السائق بعد الوصول</span>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-2.5 text-sky-300">
                <span className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="block font-bold">الخطوة الثانية</span>
                  <span className="text-[11px] text-slate-300 font-normal">فحص واعتماد أوراق الشحنة من المكتب</span>
                </div>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-3 flex items-center gap-2.5 text-emerald-300">
                <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="block font-bold">الخطوة الثالثة</span>
                  <span className="text-[11px] text-slate-300 font-normal">إصدار تصريح الصرف وتحصيل المبلغ مباشرة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Workflow Comparison Table & Operational Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            مقارنة رحلة العمل بين الطرق التقليدية ومنصة ConnectTrans
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            كيف أحدثت ConnectTrans نقلة نوعية في كفاءة إدارة النقل البري:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black text-slate-500">
                  <th className="py-3 px-4">الميزة أو المعيار</th>
                  <th className="py-3 px-4 text-rose-600 bg-rose-50/50 rounded-r-xl">النقل التقليدي</th>
                  <th className="py-3 px-4 text-blue-700 bg-blue-50/70 rounded-l-xl">منظومة ConnectTrans الرقمية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">وقت العثور على شاحنة</td>
                  <td className="py-3.5 px-4 text-slate-600 bg-rose-50/20">من 6 إلى 24 ساعة عبر الاتصالات</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/30">فوري خلال 5 - 15 دقيقة فقط</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">متابعة واستلام البضاعة</td>
                  <td className="py-3.5 px-4 text-slate-600 bg-rose-50/20">اتصالات متكررة بالسائق بدون دقة أو وضوح</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/30">إشعارات آلية وتوثيق فوري لمرحلتي التحميل والتفريغ</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">بوالص الشحن والعقود</td>
                  <td className="py-3.5 px-4 text-slate-600 bg-rose-50/20">أوراق يدوية معرضة للتلف أو الضياع</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/30">بوالص إلكترونية معتمدة ومؤرشفة سحابياً</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">تحصيل المستحقات المالية</td>
                  <td className="py-3.5 px-4 text-slate-600 bg-rose-50/20">تأخير في التحصيل ومخاطر شيكات</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/30">دفع إلكتروني آمن وتحويل فوري بعد التسليم</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">مشاوير العودة الفارغة</td>
                  <td className="py-3.5 px-4 text-slate-600 bg-rose-50/20">عودة 40% من الشاحنات بدون حمولة</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/30">حمولات رجوع مجدولة ترفع دخل الناقل 35%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>نظام موثق بالكامل يضمن حقوق أصحاب الشاحنات والشركات على حد سواء</span>
            </div>
            <button
              onClick={() => onRegisterRole('company')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              ابدأ تجربتك الآن مجاناً
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
