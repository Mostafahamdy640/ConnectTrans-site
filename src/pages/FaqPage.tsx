import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FAQ_ITEMS } from '../data/mockData';
import { FaqItem, PageId } from '../types';
import { 
  Search, 
  ChevronDown, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  CheckCircle2,
  FileQuestion
} from 'lucide-react';

interface FaqPageProps {
  onNavigateHome: () => void;
  onNavigateContact: () => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({
  onNavigateHome,
  onNavigateContact,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'all', label: 'جميع الأسئلة' },
    { id: 'general', label: 'عام عن المنصة' },
    { id: 'payment', label: 'الأسعار والمدفوعات' },
    { id: 'docs', label: 'العقود وبوالص الشحن' },
    { id: 'trucks', label: 'الشاحنات والسائقين' },
  ];

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchQuery = !searchQuery || 
      item.question.includes(searchQuery) || 
      item.answer.includes(searchQuery);
    return matchCat && matchQuery;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* 1. Page Header */}
      <PageHeader
        title="الأسئلة الشائعة"
        subtitle="كل ما تود معرفته عن طريقة عمل منصة ConnectTrans، شروط التسجيل، بوالص الشحن، وإجراءات السلامة والتأمين"
        badge="مركز المساعدة والمعلومات"
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأسئلة (مثال: التأمين، الفاتورة، التسجيل، السائقين)..."
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
              <FileQuestion className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">لم نجد أي سؤال يطابق بحثك</p>
              <p className="text-xs text-slate-400 mt-1">جرب كلمات بحث أخرى أو تواصل مع فريق الدعم الفني مباشرة.</p>
            </div>
          )}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-8 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div>
            <h4 className="text-lg font-black mb-1">هل لا تزال لديك استفسارات غير واضحة؟</h4>
            <p className="text-xs text-slate-300">
              فريق الدعم الفني اللوجستي جاهز للتحدث معك وتقديم المساعدة في أي وقت.
            </p>
          </div>
          <button
            onClick={onNavigateContact}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-md shrink-0"
          >
            تواصل مع خدمة العملاء
          </button>
        </div>

      </div>

    </div>
  );
};
