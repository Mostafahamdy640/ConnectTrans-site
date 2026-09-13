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
import { RoleDetailsModal } from './components/RoleDetailsModal';
import { ServiceDetailsModal } from './components/ServiceDetailsModal';
import { BookingModal } from './components/BookingModal';
import { PageId, UserRole, UserAccount, CommissionProfile, SitePageContent, Shipment } from './types';
import { CheckCircle2, Download } from 'lucide-react';
import { exportProjectToZip } from './utils/zipExporter';
import { 
  INITIAL_COMMISSION_PROFILES, 
  INITIAL_USERS, 
  INITIAL_SITE_CONTENT 
} from './data/egyptLocations';
import { SAMPLE_SHIPMENTS } from './data/mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  
  // Dynamic Global State for RBAC & Admin Management
  const [activeRole, setActiveRole] = useState<UserRole>('company');
  const [commissionProfiles, setCommissionProfiles] = useState<CommissionProfile[]>(INITIAL_COMMISSION_PROFILES);
  const [usersList, setUsersList] = useState<UserAccount[]>(INITIAL_USERS);
  const [siteContent, setSiteContent] = useState<SitePageContent>(INITIAL_SITE_CONTENT);
  const [shipmentsList, setShipmentsList] = useState<Shipment[]>(SAMPLE_SHIPMENTS);

  // Active Commission Profile
  const activeCommissionProfile = commissionProfiles.find(p => p.active) || commissionProfiles[0];

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('company');

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
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync hash routing
  useEffect(() => {
    const syncPageFromHash = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = [
        'home', 'services', 'how-it-works', 'business', 
        'reviews', 'contact', 'faq', 'dashboard', 'admin'
      ];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };
    syncPageFromHash();
    window.addEventListener('hashchange', syncPageFromHash);
    return () => window.removeEventListener('hashchange', syncPageFromHash);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register', role: UserRole = 'company') => {
    setAuthMode(mode);
    setAuthInitialRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: { name: string; role: UserRole }) => {
    setActiveRole(userData.role);
    showToast(`مرحباً بك ${userData.name}! تم تسجيل حسابك بصلاحية [${
      userData.role === 'admin' ? 'المدير العام والمشرفين' :
      userData.role === 'company' ? 'الشركات والمصانع' :
      userData.role === 'office' ? 'مكاتب النقل والوساطة' : 'صاحب سيارة / سائق'
    }] بنجاح.`);
    handleNavigate('dashboard');
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
      handleNavigate('admin');
    } else {
      setActiveRole(role);
      handleNavigate('dashboard');
    }
  };

  // Current logged in simulated user matching activeRole
  const currentActiveUser = usersList.find(u => u.role === activeRole) || usersList[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900 selection:bg-blue-600 selection:text-white relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Floating Download Source ZIP Action Badge */}
      <aside aria-label="تحميل المشروع" className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => exportProjectToZip()}
          title="تحميل كود المشروع كملف مضغوط ZIP"
          className="group flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700 transition-all hover:scale-105 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Download className="w-4 h-4 group-hover:animate-bounce" />
          </div>
          <div className="text-right">
            <span className="block text-xs font-black text-white">تحميل المشروع كاملاً</span>
            <span className="block text-[10px] text-amber-400 font-mono">ZIP Source Code</span>
          </div>
        </button>
      </aside>

      {/* Navigation Bar with Page Switching */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => handleNavigate('admin')}
      />

      {/* Main Single Page / View Renderer */}
      <main className="flex-1">
        
        {/* 1. Home Page */}
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onSelectRole={(role) => setSelectedRole(role)}
            onOpenAdmin={() => handleNavigate('admin')}
            siteContent={siteContent}
          />
        )}

        {/* 2. Role Dashboard: Specific portal & view for each of the 4 roles */}
        {currentPage === 'dashboard' && (
          <RoleDashboard
            currentRole={activeRole}
            userAccount={currentActiveUser}
            allShipments={shipmentsList}
            commissionProfile={activeCommissionProfile}
            onOpenBooking={() => setBookingModalOpen(true)}
            onSwitchRole={(role) => {
              if (role === 'admin') {
                handleNavigate('admin');
              } else {
                setActiveRole(role);
              }
            }}
            onNavigateHome={() => handleNavigate('home')}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}

        {/* 3. Central Super Admin Panel: Full permissions */}
        {currentPage === 'admin' && (
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
            onSelectRole={(role) => {
              if (role === 'admin') {
                handleNavigate('admin');
              } else {
                setSelectedRole(role);
              }
            }}
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

      {/* Footer with page links (hide in Admin Panel to maximize workspace) */}
      {currentPage !== 'admin' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Interactive Modals */}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        initialRole={authInitialRole}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <RoleDetailsModal
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
        onProceedToRegister={(role) => {
          if (role === 'admin') {
            handleNavigate('admin');
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
