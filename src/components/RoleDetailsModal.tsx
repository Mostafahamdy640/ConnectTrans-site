import React, { useState } from 'react';
import { X, CheckCircle2, ArrowLeft, Building2, Truck, Briefcase, Plus, Search, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface RoleDetailsModalProps {
  role: UserRole | null;
  onClose: () => void;
  onProceedToRegister: (role: UserRole) => void;
}

export const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({
  role,
  onClose,
  onProceedToRegister,
}) => {
  if (!role) return null;

  const data = {
    company: {
      title: 'بوابة الشركات والمصانع',
      badge: 'حلول لوجستية للشركات',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Building2,
      accentColor: 'text-emerald-600',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      description: 'نوفر لمؤسستك حلول نقل بري متكاملة ومؤتمتة مع أسطول واسع من جميع فئات الشاحنات بأسعار منافسة وبوالص نقل رقمية معتمدة.',
      features: [
        'توفير شاحنات فورية ومجدولة لكافة محافظات وقرى وموانئ مصر',
        'تأمين شامل على البضائع أثناء النقل ضد جميع المخاطر',
        'إشعارات فورية وتحديثات منتظمة لحالة استلام وتفريغ البضائع',
        'فواتير ضريبية موحدة ودفع آمن عبر المنصة',
        'إمكانية التعاقد السنوي أو الشهري لخطوط الإمداد الدائمة'
      ],
      quickActionLabel: 'إنشاء طلب شحن بضاعة جديد',
    },
    driver: {
      title: 'بوابة أصحاب الشاحنات والسيارات',
      badge: 'زيادة الدخل وفرص النقل',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Truck,
      accentColor: 'text-blue-600',
      btnBg: 'bg-blue-600 hover:bg-blue-700',
      description: 'ارفع دخلك اليومي وتخلص من مشاوير العودة الفارغة. تصفح مئات الحمولات الجاهزة للتحميل الفوري واختر الأنسب لك ولشاحنتك.',
      features: [
        'حمولات يومية متجددة بدون وسيط تقليدي أو خصومات عشوائية',
        'تحويل سريع للمستحقات فور تسليم إيصال الاستلام',
        'تطبيق مخصص للسائق يوفر توجيهات المسار ومواقع التفريغ',
        'دعم فني ومساعدة على الطرقات على مدار 24 ساعة',
        'تسجيل أسطول شاحنات متعدد أو شاحنة فردية واحدة'
      ],
      quickActionLabel: 'تصفح الحمولات المتاحة الآن',
    },
    office: {
      title: 'بوابة مكاتب النقل والوساطة',
      badge: 'أتمتة وإدارة الأعمال اللوجستية',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Briefcase,
      accentColor: 'text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
      description: 'نظام إدارة سحابي متكامل يتيح لمكتبك تنظيم التعاقدات وتوزيع الرحلات ومتابعة السائقين والتحصيلات المالية في مكان واحد.',
      features: [
        'إصدار بوالص الشحن الإلكترونية المعتمدة طبقاً للوائح هيئة النقل',
        'الوصول لشبكة عملاء تجاريين كبار بحاجة لنقل دوري',
        'إدارة أسطول السائقين والسيارات التابعة للمكتب بكل يسر',
        'لوحة تحكم مالية تشمل كشوف الحسابات والأرباح والعمولات',
        'ربط برمجي مباشر (API) مع أنظمة المستودعات والمبيعات'
      ],
      quickActionLabel: 'تسجيل مكتب نقل معتمد',
    },
    admin: {
      title: 'بوابة الإدارة العامة والمشرفين',
      badge: 'Super Admin',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: ShieldCheck,
      accentColor: 'text-amber-500',
      btnBg: 'bg-slate-900 hover:bg-slate-800',
      description: 'لوحة التحكم المركزية لمنصة ConnectTrans في مصر: إدارة الصلاحيات للفئات الـ 4، التحكم ببروفايلات العمولات التفاعلية، وتعديل محتوى الصفحات.',
      features: [
        'تعديل وإدارة بيانات كافة الفئات (الشركات، مكاتب النقل، أصحاب السيارات، والمديرون)',
        'بروفايلات عمولات ديناميكية للطرفين مع إمكانية المضاعفة 2x أو الخصم 0% بضغطة واحدة',
        'تحديد شرائح الأسعار من 0 إلى 5,000 ج.م ومن 5,000 إلى 20,000 ج.م ومبالغ ثابتة أو نسب مئوية',
        'تعديل محتوى ونصوص صفحات الموقع وأرقام الطوارئ والإعلانات الشريطية فورياً',
        'اعتماد أوراق وتراخيص وتوثيق حسابات السائقين والشركات والمكاتب'
      ],
      quickActionLabel: 'دخول لوحة تحكم المشرفين',
    }
  };

  const current = data[role];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${current.accentColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black">{current.title}</h3>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border mt-0.5 ${current.badgeColor}`}>
                {current.badge}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
            {current.description}
          </p>

          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            أهم المزايا والخدمات المقدمة:
          </h4>

          <ul className="space-y-2.5 mb-8">
            {current.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onProceedToRegister(role);
              }}
              className={`w-full py-3 px-6 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${current.btnBg}`}
            >
              <span>{current.quickActionLabel}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
