import React, { useState } from 'react';
import { Truck, LogIn, UserPlus, Menu, X, ShieldCheck, LogOut, LayoutDashboard, UserCheck, Building2, Briefcase } from 'lucide-react';
import { PageId, UserAccount } from '../types';

interface NavbarProps {
  currentPage: PageId;
  currentUser: UserAccount | null;
  onNavigate: (page: PageId) => void;
  onOpenAuth: (mode: 'login' | 'register', role?: 'company' | 'driver' | 'office') => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  currentUser,
  onNavigate, 
  onOpenAuth,
  onOpenAdmin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'services', label: 'الخدمات' },
    { id: 'how-it-works', label: 'كيف تعمل المنصة' },
    { id: 'business', label: 'ConnectTrans' },
    { id: 'reviews', label: 'التقييمات' },
    { id: 'contact', label: 'تواصل معنا' },
    { id: 'faq', label: 'الأسئلة الشائعة' },
  ];

  const handleLinkClick = (pageId: PageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'المدير العام', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'company':
        return { label: 'شركة معتمدة', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'office':
        return { label: 'مكتب نقل مرخص', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'driver':
        return { label: 'صاحب شاحنة', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      default:
        return { label: 'مستخدم معتمد', bg: 'bg-slate-100 text-slate-900 border-slate-300' };
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand (Left) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-3 group text-right cursor-pointer"
            >
              {/* Truck Motion Icon */}
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md relative overflow-hidden group-hover:bg-blue-900 transition-colors">
                  {/* Speed lines */}
                  <div className="absolute left-0.5 top-2 w-2 h-0.5 bg-blue-400 rounded-full"></div>
                  <div className="absolute left-1 top-4 w-3 h-0.5 bg-amber-400 rounded-full"></div>
                  <div className="absolute left-0.5 top-6 w-2 h-0.5 bg-blue-400 rounded-full"></div>
                  <Truck className="w-6 h-6 text-white transform -scale-x-100 mr-1" />
                </div>
              </div>
              
              <div className="flex flex-col text-right">
                <div className="flex items-baseline">
                  <span className="text-2xl font-black tracking-tight text-slate-900">Connect</span>
                  <span className="text-2xl font-black tracking-tight text-blue-600">Trans</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 -mt-1 tracking-tight">
                  منصة لإدارة النقل والخدمات اللوجستية
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative px-3 py-2 text-sm font-bold transition-all whitespace-nowrap cursor-pointer rounded-lg ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-black'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons (Right) */}
          <div className="hidden sm:flex items-center gap-2.5">
            {currentUser ? (
              /* Authenticated User State */
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                {/* User Info Capsule */}
                <div className="px-3 py-1 text-right flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate max-w-[140px]">
                      {currentUser.name}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getRoleBadge(currentUser.role).bg}`}>
                      {getRoleBadge(currentUser.role).label}
                    </span>
                  </div>
                </div>

                {/* Direct Dashboard Link */}
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>لوحة الإدارة</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleLinkClick('dashboard')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>لوحة العمليات</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Public / Guest State - (Notice: No Admin button appears here) */
              <div className="flex items-center gap-2">
                <button
                  id="login-header-btn"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-600" />
                  <span>تسجيل دخول</span>
                </button>

                <button
                  id="register-header-btn"
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل جديد</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-right cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{currentUser.name}</span>
                    <span className="text-[11px] text-slate-500 font-bold">{getRoleBadge(currentUser.role).label}</span>
                  </div>
                  {currentUser.role === 'admin' ? (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="px-3 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-lg"
                    >
                      لوحة الإدارة
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLinkClick('dashboard');
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg"
                    >
                      لوحة العمليات
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold rounded-lg text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold rounded-lg cursor-pointer text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب جديد</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
