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
