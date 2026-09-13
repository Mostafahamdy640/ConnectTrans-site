import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header with Golden Dividers */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-4 w-full max-w-lg mx-auto">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e59819]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 whitespace-nowrap">
            التقييمات وآراء العملاء
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e59819]" />
        </div>
        <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
          ما يقوله شركاء النجاح من شركات وسائقين ومكاتب نقل عن تجربتهم مع ConnectTrans
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Rating stars & Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-7 h-7 text-blue-100" />
              </div>

              {/* Comment text */}
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
                "{item.comment}"
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <img
                src={item.avatar}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20 shadow-2xs"
              />
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1">
                  {item.name}
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {item.role} - <span className="text-slate-700">{item.company}</span>
                </p>
                <span className="text-[11px] text-blue-600 font-bold">مدينة {item.city}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Trust Stats Bar */}
      <div className="mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-slate-800">
        <div>
          <span className="block text-3xl sm:text-4xl font-black text-amber-400 mb-1">+45,000</span>
          <span className="text-xs sm:text-sm text-slate-300 font-semibold">رحلة نقل منجزة بنجاح</span>
        </div>
        <div>
          <span className="block text-3xl sm:text-4xl font-black text-blue-400 mb-1">99.4%</span>
          <span className="text-xs sm:text-sm text-slate-300 font-semibold">نسبة الالتزام بالمواعيد</span>
        </div>
        <div>
          <span className="block text-3xl sm:text-4xl font-black text-emerald-400 mb-1">+2,800</span>
          <span className="text-xs sm:text-sm text-slate-300 font-semibold">شاحنة معتمدة ومفحوصة</span>
        </div>
        <div>
          <span className="block text-3xl sm:text-4xl font-black text-amber-400 mb-1">4.9 / 5</span>
          <span className="text-xs sm:text-sm text-slate-300 font-semibold">متوسط تقييم رضا العملاء</span>
        </div>
      </div>

    </section>
  );
};
