// ConnectTrans Core Domain Entities & Types

export type UserRole = 'admin' | 'company' | 'office' | 'vehicle_owner' | 'driver';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'deleted';

export type PageId = 'home' | 'services' | 'how-it-works' | 'business' | 'reviews' | 'contact' | 'faq' | 'dashboard' | 'admin';

// Document uploaded by any party
export interface VerificationDocument {
  id: string;
  name: string;
  type: 'commercial_register' | 'tax_card' | 'national_id_front' | 'national_id_back' | 'driving_license_front' | 'driving_license_back' | 'vehicle_license' | 'other';
  url: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

// Contacts structure
export interface ContactDetails {
  phone: string;
  email: string;
  whatsapp?: string;
  facebook?: string;
  telegram?: string;
  otherContact?: string;
}

// 1. Company Entity
export interface CompanyAccount {
  id: string;
  companyName: string;
  displayName: string;
  contactPerson: string;
  commercialRegister: string;
  taxCard: string;
  contacts: ContactDetails;
  governorate: string;
  city: string;
  status: AccountStatus;
  documents: VerificationDocument[];
  createdAt: string;
  notes?: string;
  isInternal?: boolean;
}

// 2. Transport Office Entity
export interface TransportOfficeAccount {
  id: string;
  officeName: string;
  displayName: string;
  username: string;
  commercialRegister: string;
  taxCard: string;
  contacts: ContactDetails;
  governorate: string;
  city: string;
  status: AccountStatus;
  documents: VerificationDocument[];
  createdAt: string;
  notes?: string;
  isInternalConnectTrans?: boolean; // Represents ConnectTrans internal office
  commissionRate?: number;
}

// 3. Vehicle Owner Entity
export interface VehicleOwnerAccount {
  id: string;
  ownerName: string;
  displayName: string;
  contacts: ContactDetails;
  governorate: string;
  city: string;
  status: AccountStatus;
  documents: VerificationDocument[];
  createdAt: string;
  notes?: string;
}

// 4. Vehicle Entity
export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  plateNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  year: number;
  capacityTons: number;
  cargoTypeAllowed: string;
  licenseNumber: string;
  status: AccountStatus;
  documents: VerificationDocument[];
  currentDriverId?: string;
  currentDriverName?: string;
  createdAt: string;
  notes?: string;
}

// 5. Driver Entity
export interface Driver {
  id: string;
  driverName: string;
  contacts: ContactDetails;
  governorate: string;
  city: string;
  nationalId: string;
  licenseNumber: string;
  ownerId?: string;
  ownerName?: string;
  assignedVehicleId?: string;
  status: AccountStatus;
  documents: VerificationDocument[];
  createdAt: string;
  notes?: string;
}

// 6. Transport Request (Marketplace & Direct)
export type RequestType = 'marketplace' | 'direct_connecttrans';
export type RequestStatus = 'open' | 'has_offers' | 'partially_accepted' | 'closed' | 'cancelled';

// Office Offer submitted on a Transport Request
export interface TransportOfficeOffer {
  id: string;
  requestId: string;
  requestNumber: string;
  officeId: string;
  officeName: string;
  officeCity: string;
  offeredPricePerUnit: number; // سعر النقلة المقترح من المكتب
  availableQuantity: number;    // الكمية المتاحة لدى المكتب
  remainingQuantity: number;    // الكمية المتبقية من عرض المكتب بعد قبول أصحاب السيارات
  acceptedQuantity: number;     // الكمية التي قبلها أصحاب السيارات
  truckTypesAvailable: string;
  validUntil?: string;
  notes?: string;
  status: 'active' | 'partially_accepted' | 'exhausted' | 'withdrawn';
  createdAt: string;
  officeContacts: ContactDetails;
}

// Company direct inquiry / cooperation request directly with ConnectTrans
export interface CompanyDirectInquiry {
  id: string;
  companyName: string;
  commercialRegister?: string;
  contactPerson: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  monthlyCargoVolumeTons?: number;
  truckTypesNeeded: string[];
  cooperationType: 'long_term_contract' | 'dedicated_fleet' | 'spot_shipments' | 'factory_integration';
  notes?: string;
  status: 'new' | 'contacted' | 'contract_drafted' | 'approved';
  createdAt: string;
}

export interface TransportRequest {
  id: string;
  requestNumber: string;
  creatorId: string;
  creatorType: 'company' | 'office';
  creatorName: string;
  creatorGovernorate: string;
  creatorCity: string;
  requestType: RequestType;
  fromGovernorate: string;
  fromCity: string;
  toGovernorate: string;
  toCity: string;
  pickupLocation: string;
  dropoffLocation: string;
  truckType: string;
  cargoType: string;
  weightTons: number;
  pricePerUnit: number;
  requiredQuantity: number;
  remainingQuantity: number;
  acceptedQuantity: number;
  offersCount?: number;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  closedAt?: string;
  // Contact details only released upon acceptance
  contacts: ContactDetails;
}

// 7. Acceptance Record
export interface RequestAcceptance {
  id: string;
  requestId: string;
  requestNumber: string;
  offerId?: string; // If accepted through a transport office offer
  intermediaryOfficeId?: string;
  intermediaryOfficeName?: string;
  acceptedByUserId: string;
  acceptedByUserName: string;
  acceptedByUserType: 'office' | 'vehicle_owner';
  acceptedQuantity: number;
  remainingBefore: number;
  remainingAfter: number;
  agreedPrice: number;
  totalAmount: number;
  officeFee: number;
  vehicleOwnerFee: number;
  connectTransCommission: number;
  paymentStatus: 'pending' | 'paid' | 'waived';
  status: 'active' | 'cancelled';
  acceptedAt: string;
  releasedContacts: {
    creatorContacts: ContactDetails;
    acceptorContacts: ContactDetails;
    officeContacts?: ContactDetails;
    releasedAt: string;
  };
  notes?: string;
}

// 8. Trip & Trip Assignment
export type TripStatus = 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  tripNumber: string;
  requestId: string;
  acceptanceId: string;
  offerId?: string;
  intermediaryOfficeId?: string;
  intermediaryOfficeName?: string;
  shipperId: string;
  shipperName: string;
  shipperRole: 'company' | 'office';
  transporterId: string;
  transporterName: string;
  transporterRole: 'office' | 'vehicle_owner';
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  fromLocation: string;
  toLocation: string;
  cargoType: string;
  quantity: number;
  status: TripStatus;
  statusHistory: { status: TripStatus; timestamp: string; note?: string }[];
  currentLocation?: string;
  progressPercent: number;
  price: number;
  commission: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  ratedByShipper?: boolean;
  ratedByTransporter?: boolean;
}

// 9. Rating Entity (Enabled only AFTER Trip is completed)
export interface TripRating {
  id: string;
  tripId: string;
  tripNumber: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserName: string;
  toUserRole: UserRole;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

// 10. Commission & Fees Profile
export interface FeeProfile {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isTrialPromo: boolean; // 0 fees during trial
  officeFee: number;
  vehicleOwnerFee: number;
  connectTransCommission: number;
  minTripPrice: number;
  maxTripPrice: number;
  createdAt: string;
  updatedAt: string;
}

// 11. Audit Log Record
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'APPROVE' | 'REJECT' | 'SUSPEND' | 'DELETE' | 'EDIT' | 'CREATE_REQUEST' | 'ACCEPT_REQUEST' | 'SUBMIT_OFFER' | 'ACCEPT_OFFER' | 'CREATE_TRIP' | 'COMPANY_DIRECT_INQUIRY' | 'CLOSE_REQUEST' | 'RELEASE_CONTACTS' | 'CHANGE_FEE' | 'UPDATE_TRIP' | 'COMPLETE_TRIP' | 'RATE_TRIP' | 'BACKUP_CREATED' | 'BACKUP_RESTORED';
  entity: 'user' | 'company' | 'office' | 'vehicle_owner' | 'vehicle' | 'driver' | 'request' | 'offer' | 'acceptance' | 'trip' | 'fee_profile' | 'rating' | 'system';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Legacy-compatible types for components
export interface CommissionTier {
  id: string;
  minPrice: number;
  maxPrice: number;
  type: 'fixed' | 'percentage' | 'zero';
  shipperFee: number;
  transporterFee: number;
  label: string;
}

export interface CommissionProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  multiplier: number;
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
