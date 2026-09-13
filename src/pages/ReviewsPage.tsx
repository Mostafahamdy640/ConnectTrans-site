import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { TESTIMONIALS } from '../data/mockData';
import { Testimonial } from '../types';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Briefcase, 
  PlusCircle, 
  Send 
} from 'lucide-react';

interface ReviewsPageProps {
  onNavigateHome: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  onNavigateHome,
  onOpenAuth,
}) => {
  const [reviewsList, setReviewsList] = useState<Testimonial[]>(TESTIMONIALS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // New Review Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('مدير لوجستيات');
  const [newCity, setNewCity] = useState('الرياض');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newComment) return;

    const newReview: Testimonial = {
      id: `rev-${Date.now()}`,
      name: newName,
      company: newCompany || 'منشأة معتمدة',
      role: newRole,
      city: newCity,
      rating: newRating,
      comment: newComment,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };

    setReviewsList([newReview, ...reviewsList]);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setShowAddForm(false);
      setNewName('');
      setNewCompany('');
      setNewComment('');
    }, 2000);
  };

  const filteredReviews = reviewsList.filter(rev => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'company') return rev.role.includes('لوجستي') || rev.role.includes('إمداد') || rev.company.includes('شركة') || rev.company.includes('مصنع');
    if (filterCategory === 'driver') return rev.role.includes('سائق') || rev.role.includes('شاحن');
    if (filterCategory === 'office') return rev.role.includes('مكتب') || rev.role.includes('وساطة');
    return true;
  });

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* 1. Page Header */}
      <PageHeader
        title="تقييمات وآراء العملاء"
        subtitle="قصص نجاح وتجارب واقعية لشركائنا من كبرى المصانع والشركات وأصحاب الشاحنات ومكاتب النقل"
        badge="آراء موثقة 100%"
        onNavigateHome={onNavigateHome}
        actionButton={{
          label: 'أضف تقييمك وتجربتك',
          onClick: () => setShowAddForm(true),
          icon: PlusCircle,
        }}
      />

      {/* 2. Trust Metrics Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-3xl font-black text-slate-900 font-mono block">4.9 / 5</span>
            <span className="text-xs text-slate-500 font-bold">متوسط التقييم العام</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <span className="text-3xl font-black text-blue-600 font-mono block mb-1">98.6%</span>
            <span className="text-xs text-slate-500 font-bold">نسبة رضا العملاء والناقلين</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <span className="text-3xl font-black text-emerald-600 font-mono block mb-1">+3,800</span>
            <span className="text-xs text-slate-500 font-bold">تقييم موثق بعد اكتمال النقل</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <span className="text-3xl font-black text-purple-600 font-mono block mb-1">99.2%</span>
            <span className="text-xs text-slate-500 font-bold">التزام بتسليم الشحنات بموعدها</span>
          </div>
        </div>
      </div>

      {/* Add Review Modal / Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-2">أضف تقييمك وتجربتك مع ConnectTrans</h3>
            <p className="text-xs text-slate-500 mb-6">رأيك يهمنا ويساعدنا في تحسين وتطوير خدمات النقل باستمرار.</p>

            {submittedMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">شكراً لمشاركتك تقييمك!</h4>
                <p className="text-xs text-slate-500">تمت إضافة تقييمك بنجاح وسيظهر ضمن قائمة الآراء الموثقة.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: فهد القحطاني"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الشركة أو المنشأة:</label>
                    <input
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="مثال: شركة المواد اللوجستية"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المدينة:</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="الرياض"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الصفة أو الدور:</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="مدير سلاسل الإمداد">مدير سلاسل الإمداد (شركة)</option>
                      <option value="سائق شاحنة نقل بري">سائق شاحنة نقل بري</option>
                      <option value="مدير مكتب نقليات معتمد">مدير مكتب نقليات معتمد</option>
                      <option value="مسؤول مستودعات وشحن">مسؤول مستودعات وشحن</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">التقييم:</label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل تجربتك:</label>
                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب تجربتك مع دقة المواعيد، التطبيق، وسرعة الشحن..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                  >
                    نشر التقييم
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Filter Buttons & Reviews Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'جميع التقييمات' },
            { id: 'company', label: 'الشركات والمصانع' },
            { id: 'driver', label: 'أصحاب الشاحنات' },
            { id: 'office', label: 'مكاتب النقل والوساطة' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    تقييم موثق
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{item.role} • {item.company}</p>
                  <span className="text-[10px] text-slate-400">{item.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
