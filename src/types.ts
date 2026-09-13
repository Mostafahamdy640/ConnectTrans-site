export type UserRole = 'admin' | 'company' | 'office' | 'driver';

export type PageId = 'home' | 'services' | 'how-it-works' | 'business' | 'reviews' | 'contact' | 'faq' | 'dashboard' | 'admin';

// Commission Tier Definition for dynamic profiles
export interface CommissionTier {
  id: string;
  minPrice: number;
  maxPrice: number;
  type: 'fixed' | 'percentage' | 'zero';
  shipperFee: number;     // fee for company / shipper (e.g. 10 EGP or 2%)
  transporterFee: number; // fee for driver / transporter
  label: string;
}

export interface CommissionProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  multiplier: number; // e.g., 1x, 1.5x, 2x to easily double or scale commission
  tiers: CommissionTier[];
}

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  governorate: string;
  city: string;
  status: 'active' | 'pending_verification' | 'suspended';
  verifiedDocs: boolean;
  walletBalance: number;
  commercialRecordOrLicense?: string;
  truckType?: string;
  plateNumber?: string;
  rating: number;
  completedTrips: number;
}

export interface SitePageContent {
  id: string;
  title: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcement: string;
  emergencyPhone: string;
  vatNumber: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  sender: string;
  fromGovernorate?: string;
  fromCity: string;
  toGovernorate?: string;
  toCity: string;
  specificPickupLocation?: string;
  specificDropoffLocation?: string;
  truckType: string;
  cargoType: string;
  weightTons: number;
  price: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  currentLocation: string;
  progressPercent: number;
  estimatedArrival: string;
  commissionAmount?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  comment: string;
  city: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'payment' | 'docs' | 'trucks';
}

