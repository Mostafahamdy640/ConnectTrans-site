import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { BusinessConnectionsPage } from './pages/BusinessConnectionsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { RoleDashboard } from './components/RoleDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { AdminSecurityModal } from './components/AdminSecurityModal';
import { RoleDetailsModal } from './components/RoleDetailsModal';
import { ServiceDetailsModal } from './components/ServiceDetailsModal';
import { BookingModal } from './components/BookingModal';
import { PageId, UserRole, UserAccount, CommissionProfile, SitePageContent, Shipment } from './types';
import { CheckCircle2, ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { 
  INITIAL_COMMISSION_PROFILES, 
  INITIAL_USERS, 
  INITIAL_SITE_CONTENT 
} from './data/egyptLocations';
import { SAMPLE_SHIPMENTS } from './data/mockData';
import { ctStorage } from './data/connectTransStorage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  
  // High-Security Authenticated Session State
  // Initialized to null (Visitor Mode) by default or loaded from localStorage
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('ct_authenticated_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.name?.includes('كليوباترا') || parsed.name?.includes('سيراميكا'))) {
        parsed.name = 'شركة النيل للصناعات المتطورة';
        try { localStorage.setItem('ct_authenticated_user', JSON.stringify(parsed)); } catch {}
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole>(currentUser?.role || 'company');
  const [commissionProfiles, setCommissionProfiles] = useState<CommissionProfile[]>(INITIAL_COMMISSION_PROFILES);
  const [usersList, setUsersList] = useState<UserAccount[]>(INITIAL_USERS);
  const [siteContent, setSiteContent] = useState<SitePageContent>(INITIAL_SITE_CONTENT);
  const [shipmentsList, setShipmentsList] = useState<Shipment[]>(SAMPLE_SHIPMENTS);

  // Active Commission Profile
  const activeCommissionProfile = commissionProfiles.find(p => p.active) || commissionProfiles[0];

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('company');
  const [adminSecurityModalOpen, setAdminSecurityModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleNavigate = (page: PageId) => {
    // High-security check for Admin route
    if (page === 'admin' && currentUser?.role !== 'admin') {
      setAdminSecurityModalOpen(true);
      return;
    }

    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync hash routing with security validation
  useEffect(() => {
    const syncPageFromHash = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = [
        'home', 'services', 'how-it-works', 'business', 
        'reviews', 'contact', 'faq', 'dashboard', 'admin'
      ];
      if (validPages.includes(hash)) {
        if (hash === 'admin' && currentUser?.role !== 'admin') {
          setCurrentPage('home');
          window.location.hash = 'home';
          setAdminSecurityModalOpen(true);
        } else {
          setCurrentPage(hash);
        }
      }
    };
    syncPageFromHash();
    window.addEventListener('hashchange', syncPageFromHash);
    return () => window.removeEventListener('hashchange', syncPageFromHash);
  }, [currentUser]);

  // Server-side session verification via PostgreSQL /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem('ct_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            const verifiedAccount: UserAccount = {
              id: data.user.uid,
              name: data.user.name,
              role: data.user.role,
              phone: data.user.phone,
              governorate: data.user.governorate || 'القاهرة',
              city: data.user.city || '',
              status: 'active',
              verifiedDocs: data.user.verifiedDocs,
              walletBalance: data.user.walletBalance || 0,
              rating: data.user.rating || 5.0,
              completedTrips: 0,
            };
            setCurrentUser(verifiedAccount);
            setActiveRole(data.user.role);
          } else {
            localStorage.removeItem('ct_auth_token');
            localStorage.removeItem('ct_authenticated_user');
            setCurrentUser(null);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register', role: UserRole = 'company') => {
    setAuthMode(mode);
    setAuthInitialRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    try {
      localStorage.setItem('ct_authenticated_user', JSON.stringify(user));
    } catch {
      // ignore
    }

    const roleLabel = 
      user.role === 'company' ? 'الشركات والمصانع' :
      user.role === 'office' ? 'مكاتب النقل والوساطة' :
      user.role === 'driver' ? 'أصحاب الشاحنات والسيارات' : 'الإدارة العامة';

    showToast(`مرحباً بك ${user.name}! تم تسجيل الدخول بنجاح بصلاحية [${roleLabel}].`);
    handleNavigate('dashboard');
  };

  const handleAdminSuccess = (adminUser: UserAccount) => {
    setCurrentUser(adminUser);
    setActiveRole('admin');
    try {
      localStorage.setItem('ct_authenticated_user', JSON.stringify(adminUser));
    } catch {
      // ignore
    }

    showToast('تمت المصادقة الأمنية للمدير العام بنجاح! تم فتح لوحة الإدارة المركزية.');
    setCurrentPage('admin');
    window.location.hash = 'admin';
  };

  const handleLogout = () => {
    const token = localStorage.getItem('ct_auth_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }

    if (currentUser) {
      ctStorage.addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'LOGOUT',
        entity: 'user',
        entityId: currentUser.id,
        newValue: 'تسجيل خروج آمن من الجلسة'
      });
    }

    setCurrentUser(null);
    setActiveRole('company');
    localStorage.removeItem('ct_auth_token');
    try {
      localStorage.removeItem('ct_authenticated_user');
    } catch {
      // ignore
    }

    showToast('تم تسجيل الخروج بنجاح. أهلاً بك دائماً في ConnectTrans.');
    handleNavigate('home');
  };

  const handleBookShipment = (details: any) => {
    setBookingDetails(details);
    setBookingModalOpen(true);
  };

  const handleServiceSelect = (serviceKey: string) => {
    setSelectedServiceKey(serviceKey);
  };

  const handleServiceAction = () => {
    if (selectedServiceKey === 'orders') {
      setBookingModalOpen(true);
    } else {
      handleOpenAuth('register');
    }
  };

  const handleSelectRolePortal = (role: UserRole) => {
    if (role === 'admin') {
      if (currentUser?.role === 'admin') {
        handleNavigate('admin');
      } else {
        setAdminSecurityModalOpen(true);
      }
    } else {
      if (currentUser && currentUser.role === role) {
        setActiveRole(role);
        handleNavigate('dashboard');
      } else {
        handleOpenAuth('login', role);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900 selection:bg-blue-600 selection:text-white relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar with Protected Session Awareness */}
      <Navbar
        currentPage={currentPage}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => {
          if (currentUser?.role === 'admin') {
            handleNavigate('admin');
          } else {
            setAdminSecurityModalOpen(true);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Single Page / View Renderer */}
      <main className="flex-1">
        
        {/* 1. Home Page */}
        {currentPage === 'home' && (
          <HomePage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onSelectRole={handleSelectRolePortal}
            siteContent={siteContent}
          />
        )}

        {/* 2. Role Dashboard: Strictly Authenticated & Scoped to Current Role */}
        {currentPage === 'dashboard' && (
          <RoleDashboard
            currentRole={activeRole}
            userAccount={currentUser}
            allShipments={shipmentsList}
            commissionProfile={activeCommissionProfile}
            onOpenBooking={() => setBookingModalOpen(true)}
            onSwitchRole={(role) => {
              if (currentUser?.role === 'admin') {
                if (role === 'admin') {
                  handleNavigate('admin');
                } else {
                  setActiveRole(role);
                }
              } else {
                showToast('غير مصرح لك بتغيير الفئة بدون تسجيل دخول جديد بحساب معتمد.');
              }
            }}
            onNavigateHome={() => handleNavigate('home')}
            onOpenAdmin={() => {
              if (currentUser?.role === 'admin') {
                handleNavigate('admin');
              } else {
                setAdminSecurityModalOpen(true);
              }
            }}
            onLogout={handleLogout}
            onRequireLogin={(role) => handleOpenAuth('login', role || activeRole)}
          />
        )}

        {/* 3. Central Super Admin Panel: STRICTLY RESTRICTED to role === 'admin' */}
        {currentPage === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPanel
              users={usersList}
              onUpdateUsers={(newUsers) => {
                setUsersList(newUsers);
                showToast('تم تحديث وتوثيق بيانات المستخدم بنجاح في النظام.');
              }}
              commissionProfiles={commissionProfiles}
              onUpdateCommissionProfiles={(newProfiles) => {
                setCommissionProfiles(newProfiles);
                showToast('تم تحديث وتفعيل بروفايل العمولات الجديد بنجاح.');
              }}
              siteContent={siteContent}
              onUpdateSiteContent={(newContent) => {
                setSiteContent(newContent);
                showToast('تم حفظ ونشر التعديلات على صفحات الموقع فورياً.');
              }}
              onNavigateToHome={() => handleNavigate('home')}
            />
          ) : (
            <div className="min-h-[75vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black">منطقة إدارة محظورة</h3>
                <p className="text-xs text-slate-400">
                  لوحة الإدارة المركزية مخصصة للمدير العام والمشرفين المعتمدين بـ ConnectTrans فقط، وتتطلب مصادقة أمنية برمز المرور.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setAdminSecurityModalOpen(true)}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    إدخال رمز المرور السري للمصادقة
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    العودة للصفحة الرئيسية
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* 4. Services Page */}
        {currentPage === 'services' && (
          <ServicesPage
            onNavigateHome={() => handleNavigate('home')}
            onSelectService={handleServiceSelect}
            onBookShipment={handleBookShipment}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* 5. How It Works */}
        {currentPage === 'how-it-works' && (
          <HowItWorksPage
            onNavigateHome={() => handleNavigate('home')}
            onRegisterRole={(role) => handleOpenAuth('register', role)}
          />
        )}

        {/* 6. Business Connections & Freight Exchange */}
        {currentPage === 'business' && (
          <BusinessConnectionsPage
            onNavigateHome={() => handleNavigate('home')}
            onSelectRole={handleSelectRolePortal}
            onOpenAuth={handleOpenAuth}
            onBookShipment={handleBookShipment}
            activeCommissionProfile={activeCommissionProfile}
          />
        )}

        {/* 7. Reviews Page */}
        {currentPage === 'reviews' && (
          <ReviewsPage
            onNavigateHome={() => handleNavigate('home')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* 8. Contact Page */}
        {currentPage === 'contact' && (
          <ContactPage
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* 9. FAQ Page */}
        {currentPage === 'faq' && (
          <FaqPage
            onNavigateHome={() => handleNavigate('home')}
            onNavigateContact={() => handleNavigate('contact')}
          />
        )}

      </main>

      {/* Footer with page links and discreet secure admin portal trigger */}
      {currentPage !== 'admin' && (
        <Footer 
          onNavigate={handleNavigate} 
          onOpenAdminLogin={() => setAdminSecurityModalOpen(true)}
        />
      )}

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        initialRole={authInitialRole}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AdminSecurityModal
        isOpen={adminSecurityModalOpen}
        onClose={() => setAdminSecurityModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <RoleDetailsModal
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
        onProceedToRegister={(role) => {
          if (role === 'admin') {
            setAdminSecurityModalOpen(true);
          } else {
            handleOpenAuth('register', role);
          }
        }}
      />

      <ServiceDetailsModal
        serviceKey={selectedServiceKey}
        onClose={() => setSelectedServiceKey(null)}
        onAction={handleServiceAction}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        activeCommissionProfile={activeCommissionProfile}
        initialDetails={bookingDetails}
      />

    </div>
  );
}
