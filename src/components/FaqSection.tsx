import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../data/mockData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header with Golden Dividers */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-4 w-full max-w-lg mx-auto">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e59819]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 whitespace-nowrap">
            الأسئلة الشائعة
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e59819]" />
        </div>
        <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
          إجابات واضحة ومباشرة لأهم التساؤلات حول استخدام منصة ConnectTrans
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-50/70 border-slate-200 hover:bg-white'
              }`}
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full px-6 py-4.5 text-right flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isOpen ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ${
                    isOpen ? 'transform rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pr-14">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
