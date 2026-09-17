import { 
  pgTable, text, serial, integer, timestamp, boolean, numeric 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or internal unique identifier
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  role: text('role').notNull().default('company'), // 'admin' | 'company' | 'office' | 'vehicle_owner' | 'driver'
  governorate: text('governorate').notNull().default('القاهرة'),
  city: text('city').default(''),
  status: text('status').notNull().default('active'), // 'active' | 'pending' | 'suspended'
  verifiedDocs: boolean('verified_docs').default(false),
  walletBalance: numeric('wallet_balance', { precision: 12, scale: 2 }).default('0.00'),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00'),
  commercialReg: text('commercial_reg'),
  nationalId: text('national_id'),
  truckType: text('truck_type'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Companies table
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  companyName: text('company_name').notNull(),
  commercialReg: text('commercial_reg').notNull(),
  taxCard: text('tax_card'),
  industry: text('industry').default('عام'),
  governorate: text('governorate').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  phone: text('phone').notNull(),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Offices table
export const offices = pgTable('offices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  officeName: text('office_name').notNull(),
  licenseNumber: text('license_number').notNull(),
  governorate: text('governorate').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  phone: text('phone').notNull(),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Vehicle Owners table
export const vehicleOwners = pgTable('vehicle_owners', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  ownerName: text('owner_name').notNull(),
  nationalId: text('national_id').notNull(),
  governorate: text('governorate').notNull(),
  city: text('city').notNull(),
  phone: text('phone').notNull(),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Vehicles table
export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  plateNumber: text('plate_number').notNull(),
  truckType: text('truck_type').notNull(),
  capacityTons: numeric('capacity_tons', { precision: 6, scale: 2 }).default('20.00'),
  chassisNumber: text('chassis_number'),
  status: text('status').default('active'), // 'active' | 'maintenance' | 'busy'
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Drivers table
export const drivers = pgTable('drivers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  ownerId: text('owner_id'),
  driverName: text('driver_name').notNull(),
  nationalId: text('national_id').notNull(),
  licenseNumber: text('license_number').notNull(),
  phone: text('phone').notNull(),
  assignedVehicleId: text('assigned_vehicle_id'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Transport Requests table (Marketplace & Direct inquiries)
export const transportRequests = pgTable('transport_requests', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').notNull().unique(),
  creatorId: text('creator_id').notNull(),
  creatorType: text('creator_type').notNull().default('company'), // 'company' | 'admin'
  creatorName: text('creator_name').notNull(),
  creatorPhone: text('creator_phone').notNull(),
  fromGovernorate: text('from_governorate').notNull(),
  fromCity: text('from_city').notNull(),
  toGovernorate: text('to_governorate').notNull(),
  toCity: text('to_city').notNull(),
  pickupLocation: text('pickup_location'),
  dropoffLocation: text('dropoff_location'),
  truckType: text('truck_type').notNull(),
  cargoType: text('cargo_type').notNull(),
  weightTons: numeric('weight_tons', { precision: 6, scale: 2 }).default('25.00'),
  pricePerUnit: numeric('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  requiredQuantity: integer('required_quantity').notNull(),
  remainingQuantity: integer('remaining_quantity').notNull(),
  acceptedQuantity: integer('accepted_quantity').notNull().default(0),
  status: text('status').notNull().default('open'), // 'open' | 'has_offers' | 'partially_accepted' | 'closed' | 'cancelled'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Office Offers table (Bids from transport offices)
export const officeOffers = pgTable('office_offers', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  requestNumber: text('request_number').notNull(),
  officeId: text('office_id').notNull(),
  officeName: text('office_name').notNull(),
  officePhone: text('office_phone').notNull(),
  offeredPricePerUnit: numeric('offered_price_per_unit', { precision: 10, scale: 2 }).notNull(),
  availableQuantity: integer('available_quantity').notNull(),
  remainingQuantity: integer('remaining_quantity').notNull(),
  acceptedQuantity: integer('accepted_quantity').notNull().default(0),
  truckTypesAvailable: text('truck_types_available').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('active'), // 'active' | 'accepted' | 'rejected' | 'exhausted'
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Request Acceptances table (Strict lock transaction)
export const requestAcceptances = pgTable('request_acceptances', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  offerId: text('offer_id'),
  acceptedByRole: text('accepted_by_role').notNull(), // 'office' | 'vehicle_owner' | 'driver'
  acceptedById: text('accepted_by_id').notNull(),
  acceptedByName: text('accepted_by_name').notNull(),
  acceptedByPhone: text('accepted_by_phone').notNull(),
  acceptedQuantity: integer('accepted_quantity').notNull(),
  pricePerUnit: numeric('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
  status: text('status').notNull().default('confirmed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Trips table (Live execution and tracking)
export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  tripNumber: text('trip_number').notNull().unique(),
  requestId: text('request_id').notNull(),
  acceptanceId: text('acceptance_id').notNull(),
  offerId: text('offer_id'),
  shipperId: text('shipper_id').notNull(),
  shipperName: text('shipper_name').notNull(),
  shipperPhone: text('shipper_phone'),
  transporterId: text('transporter_id').notNull(),
  transporterName: text('transporter_name').notNull(),
  transporterPhone: text('transporter_phone'),
  driverId: text('driver_id'),
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  vehiclePlate: text('vehicle_plate'),
  fromLocation: text('from_location').notNull(),
  toLocation: text('to_location').notNull(),
  cargoType: text('cargo_type').notNull(),
  weightTons: numeric('weight_tons', { precision: 6, scale: 2 }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  commission: numeric('commission', { precision: 10, scale: 2 }).default('0.00'),
  status: text('status').notNull().default('pending'), // 'pending' | 'assigned' | 'loading' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'
  currentLocation: text('current_location').default('نقطة التحميل'),
  latitude: numeric('latitude', { precision: 10, scale: 6 }),
  longitude: numeric('longitude', { precision: 10, scale: 6 }),
  progressPercent: integer('progress_percent').default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Trip Status History
export const tripStatusHistory = pgTable('trip_status_history', {
  id: serial('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  status: text('status').notNull(),
  note: text('note'),
  actorId: text('actor_id'),
  actorName: text('actor_name'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 12. Ratings table
export const ratings = pgTable('ratings', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  tripNumber: text('trip_number').notNull(),
  fromUserId: text('from_user_id').notNull(),
  fromUserName: text('from_user_name').notNull(),
  fromUserRole: text('from_user_role').notNull(),
  toUserId: text('to_user_id').notNull(),
  toUserName: text('to_user_name').notNull(),
  toUserRole: text('to_user_role').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Wallet Transactions table
export const walletTransactions = pgTable('wallet_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tripId: text('trip_id'),
  type: text('type').notNull(), // 'credit' | 'debit' | 'payout' | 'commission_fee'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('completed'), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
});

// 14. Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('system'), // 'system' | 'trip' | 'offer' | 'payment'
  read: boolean('read').default(false),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 15. Documents table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  documentType: text('document_type').notNull(), // 'commercial_reg' | 'tax_card' | 'driving_license' | 'truck_license' | 'waybill'
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  status: text('status').default('pending'), // 'pending' | 'approved' | 'rejected'
  verifiedBy: text('verified_by'),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 16. Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 17. Commission Profiles table
export const commissionProfiles = pgTable('commission_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  active: boolean('active').default(true),
  multiplier: numeric('multiplier', { precision: 4, scale: 2 }).default('1.00'),
  tiersJson: text('tiers_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
