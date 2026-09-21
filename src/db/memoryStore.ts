import bcrypt from 'bcryptjs';
import { INITIAL_COMMISSION_PROFILES } from '../data/egyptLocations.ts';

// Table names mapping
export type TableName = 
  | 'users' | 'companies' | 'offices' | 'vehicle_owners' | 'vehicles' 
  | 'drivers' | 'transport_requests' | 'office_offers' | 'request_acceptances' 
  | 'trips' | 'trip_status_history' | 'ratings' | 'wallet_transactions' 
  | 'notifications' | 'documents' | 'audit_logs' | 'commission_profiles';

class MemoryDatabaseStore {
  private tables: Record<string, any[]> = {
    users: [],
    companies: [],
    offices: [],
    vehicle_owners: [],
    vehicles: [],
    drivers: [],
    transport_requests: [],
    office_offers: [],
    request_acceptances: [],
    trips: [],
    trip_status_history: [],
    ratings: [],
    wallet_transactions: [],
    notifications: [],
    documents: [],
    audit_logs: [],
    commission_profiles: [],
  };

  private initialized = false;

  constructor() {
    this.initSeed();
  }

  public async initSeed() {
    if (this.initialized) return;
    this.initialized = true;

    const initialUserPassword = process.env.INITIAL_USER_PASSWORD || 'CtUser#Sec99!Enterprise';
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'CtAdmin#Secure#2026!Master';

    const defaultPasswordHash = bcrypt.hashSync(initialUserPassword, 8);
    const adminPasswordHash = bcrypt.hashSync(initialAdminPassword, 8);

    // 1. Commission Profiles
    for (const profile of INITIAL_COMMISSION_PROFILES) {
      this.tables.commission_profiles.push({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        active: profile.active,
        multiplier: profile.multiplier ? String(profile.multiplier) : '1.00',
        tiersJson: JSON.stringify(profile.tiers),
        updatedAt: new Date(),
      });
    }

    // 2. Users
    const seedUsers = [
      {
        id: 1,
        uid: 'USR-ADM-01',
        email: 'admin@connecttrans.eg',
        passwordHash: adminPasswordHash,
        name: 'أحمد محمود القاضي (المدير العام)',
        phone: '01001234567',
        role: 'admin',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '245000.00',
        rating: '5.00',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 2,
        uid: 'comp-suez-steel',
        email: 'shipping@suez-steel.eg',
        passwordHash: defaultPasswordHash,
        name: 'شركة السويس لمنتجات الصلب والحديد',
        phone: '01122334455',
        role: 'company',
        governorate: 'السويس',
        city: 'العين السخنة (المنطقة الاقتصادية)',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '150000.00',
        rating: '4.90',
        commercialReg: 'CR-882109-SUEZ',
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10'),
      },
      {
        id: 3,
        uid: 'comp-el-araby-ind',
        email: 'logistics@elaraby.eg',
        passwordHash: defaultPasswordHash,
        name: 'مجموعة العربي للصناعات والتجارة',
        phone: '01233445566',
        role: 'company',
        governorate: 'القليوبية',
        city: 'بنها',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '320000.00',
        rating: '5.00',
        commercialReg: 'CR-441203-QAL',
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
      },
      {
        id: 4,
        uid: 'office-delta-transport',
        email: 'delta.trans.eg@gmail.com',
        passwordHash: defaultPasswordHash,
        name: 'مكتب الدلتا للشحن والنقل البري',
        phone: '01099887766',
        role: 'office',
        governorate: 'الغربية',
        city: 'طنطا',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '84200.00',
        rating: '4.85',
        commercialReg: 'OFF-DELTA-7721',
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-01-20'),
      },
      {
        id: 5,
        uid: 'owner-ahmed-mansour',
        email: 'ahmed.mansour.trucks@gmail.com',
        passwordHash: defaultPasswordHash,
        name: 'الحاج أحمد منصور الشناوي (مالك أسطول)',
        phone: '01011223344',
        role: 'vehicle_owner',
        governorate: 'الدقهلية',
        city: 'المنصورة',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '38500.00',
        rating: '4.95',
        nationalId: '27805121600123',
        createdAt: new Date('2026-01-25'),
        updatedAt: new Date('2026-01-25'),
      },
      {
        id: 6,
        uid: 'drv-101',
        email: 'osama.sakka@gmail.com',
        passwordHash: defaultPasswordHash,
        name: 'الأسطى أسامة فؤاد السقا',
        phone: '01511224466',
        role: 'driver',
        governorate: 'الغربية',
        city: 'طنطا',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '14200.00',
        rating: '4.90',
        nationalId: '28911041600214',
        truckType: 'تريلا فرش / سطحة (Flatbed)',
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date('2026-02-01'),
      },
      {
        id: 7,
        uid: 'drv-202',
        email: 'walid.raboh@gmail.com',
        passwordHash: defaultPasswordHash,
        name: 'وليد عبد ربه',
        phone: '01044556677',
        role: 'driver',
        governorate: 'الشرقية',
        city: 'العاشر من رمضان',
        status: 'active',
        verifiedDocs: true,
        walletBalance: '9800.00',
        rating: '4.80',
        nationalId: '29208031200987',
        truckType: 'تريلا جوانب (Side Open)',
        createdAt: new Date('2026-02-05'),
        updatedAt: new Date('2026-02-05'),
      }
    ];

    seedUsers.forEach(u => this.tables.users.push(u));

    // 3. Companies
    this.tables.companies.push(
      {
        id: 'comp-suez-steel',
        userId: 'comp-suez-steel',
        companyName: 'شركة السويس لمنتجات الصلب والحديد',
        commercialReg: 'CR-882109-SUEZ',
        taxCard: 'TX-901-224',
        industry: 'حديد وصلب ومواد بناء',
        governorate: 'السويس',
        city: 'العين السخنة',
        address: 'المنطقة الاقتصادية الخاصة - شمال غرب خليج السويس',
        phone: '01122334455',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: 'comp-el-araby-ind',
        userId: 'comp-el-araby-ind',
        companyName: 'مجموعة العربي للصناعات والتجارة',
        commercialReg: 'CR-441203-QAL',
        taxCard: 'TX-551-889',
        industry: 'أجهزة كهربائية وإلكترونيات',
        governorate: 'القليوبية',
        city: 'بنها',
        address: 'المجمع الصناعي طريق مصر إسكندرية الزراعي',
        phone: '01233445566',
        status: 'active',
        createdAt: new Date(),
      }
    );

    // 4. Offices
    this.tables.offices.push({
      id: 'office-delta-transport',
      userId: 'office-delta-transport',
      officeName: 'مكتب الدلتا للشحن والنقل البري',
      licenseNumber: 'OFF-DELTA-7721',
      governorate: 'الغربية',
      city: 'طنطا',
      address: 'مجمع المواقف الجديد - شارع الجلاء',
      phone: '01099887766',
      status: 'active',
      createdAt: new Date(),
    });

    // 5. Vehicles
    this.tables.vehicles.push(
      {
        id: 'veh-101',
        ownerId: 'owner-ahmed-mansour',
        plateNumber: 'ط د ق ٧٨١٢',
        truckType: 'تريلا فرش / سطحة (Flatbed)',
        capacityTons: '32.00',
        chassisNumber: 'MERC-ACTROS-2023-9912',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: 'veh-102',
        ownerId: 'owner-ahmed-mansour',
        plateNumber: 'ر م ل ٥٤٣١',
        truckType: 'تريلا جوانب (Side Open)',
        capacityTons: '28.00',
        chassisNumber: 'VOLVO-FH-2022-4419',
        status: 'active',
        createdAt: new Date(),
      }
    );

    // 6. Drivers
    this.tables.drivers.push(
      {
        id: 'drv-101',
        userId: 'drv-101',
        ownerId: 'owner-ahmed-mansour',
        driverName: 'الأسطى أسامة فؤاد السقا',
        nationalId: '28911041600214',
        licenseNumber: 'DL-FIRST-CLASS-8819',
        phone: '01511224466',
        assignedVehicleId: 'veh-101',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: 'drv-202',
        userId: 'drv-202',
        ownerId: 'owner-ahmed-mansour',
        driverName: 'وليد عبد ربه',
        nationalId: '29208031200987',
        licenseNumber: 'DL-SECOND-CLASS-4421',
        phone: '01044556677',
        assignedVehicleId: 'veh-102',
        status: 'active',
        createdAt: new Date(),
      }
    );

    // 7. Transport Requests
    this.tables.transport_requests.push(
      {
        id: 'req-1001',
        requestNumber: 'REQ-2026-001',
        creatorId: 'comp-suez-steel',
        creatorType: 'company',
        creatorName: 'شركة السويس لمنتجات الصلب والحديد',
        creatorPhone: '01122334455',
        fromGovernorate: 'السويس',
        fromCity: 'العين السخنة (المنطقة الصناعية)',
        toGovernorate: 'الجيزة',
        toCity: 'مدينة 6 أكتوبر (المنطقة الصناعية الثالثة)',
        pickupLocation: 'بوابة مصانع الدرفلة رقم 2 - العين السخنة',
        dropoffLocation: 'مستودع التوزيع المركزي - مجمع البنوك أكتوبر',
        truckType: 'تريلا فرش / سطحة (Flatbed)',
        cargoType: 'حديد تسليح ولفائف صاج صلب',
        weightTons: '28.00',
        pricePerUnit: '3800.00',
        requiredQuantity: 5,
        remainingQuantity: 4,
        acceptedQuantity: 1,
        status: 'partially_accepted',
        notes: 'تحميل فوري مع تسهيلات وزن بالميزان البسكول وورق رسمي كامل',
        createdAt: new Date('2026-03-01T08:30:00Z'),
        updatedAt: new Date('2026-03-01T10:00:00Z'),
      },
      {
        id: 'req-1002',
        requestNumber: 'REQ-2026-002',
        creatorId: 'comp-el-araby-ind',
        creatorType: 'company',
        creatorName: 'مجموعة العربي للصناعات والتجارة',
        creatorPhone: '01233445566',
        fromGovernorate: 'القليوبية',
        fromCity: 'بنها',
        toGovernorate: 'الإسكندرية',
        toCity: 'ميناء الدخيلة الدولي',
        pickupLocation: 'مجمع مصانع العربي - مجمع شاشات التلفزيون',
        dropoffLocation: 'محطة حاويات الدخيلة - رصيف الصادرات رقم 4',
        truckType: 'تريلا صندوق مغلق (Dry Box)',
        cargoType: 'شاشات وأجهزة منزلية معبأة تصدير',
        weightTons: '18.00',
        pricePerUnit: '4200.00',
        requiredQuantity: 4,
        remainingQuantity: 4,
        acceptedQuantity: 0,
        status: 'open',
        notes: 'شاحنة محكمة الغلق ومقاومة للأمطار - بوليصة جمركية مباشرة',
        createdAt: new Date('2026-03-02T09:15:00Z'),
        updatedAt: new Date('2026-03-02T09:15:00Z'),
      }
    );

    // 8. Offers
    this.tables.office_offers.push({
      id: 'off-201',
      requestId: 'req-1001',
      requestNumber: 'REQ-2026-001',
      officeId: 'office-delta-transport',
      officeName: 'مكتب الدلتا للشحن والنقل البري',
      officePhone: '01099887766',
      offeredPricePerUnit: '3800.00',
      availableQuantity: 4,
      remainingQuantity: 3,
      acceptedQuantity: 1,
      truckTypesAvailable: 'تريلا فرش / سطحة (Flatbed)',
      notes: 'سائقين معتمدين وجاهزين للتحميل صباح الغد مع تأمين كامل للبضاعة',
      status: 'active',
      createdAt: new Date('2026-03-01T09:00:00Z'),
    });

    // 9. Request Acceptances
    this.tables.request_acceptances.push({
      id: 'acc-301',
      requestId: 'req-1001',
      offerId: 'off-201',
      acceptedByRole: 'office',
      acceptedById: 'office-delta-transport',
      acceptedByName: 'مكتب الدلتا للشحن والنقل البري',
      acceptedByPhone: '01099887766',
      acceptedQuantity: 1,
      pricePerUnit: '3800.00',
      totalPrice: '3800.00',
      status: 'confirmed',
      createdAt: new Date('2026-03-01T09:30:00Z'),
    });

    // 10. Trips
    this.tables.trips.push(
      {
        id: 'trip-501',
        tripNumber: 'TRIP-EG-9102',
        requestId: 'req-1001',
        acceptanceId: 'acc-301',
        offerId: 'off-201',
        shipperId: 'comp-suez-steel',
        shipperName: 'شركة السويس لمنتجات الصلب والحديد',
        shipperPhone: '01122334455',
        transporterId: 'office-delta-transport',
        transporterName: 'مكتب الدلتا للشحن والنقل البري',
        transporterPhone: '01099887766',
        driverId: 'drv-101',
        driverName: 'الأسطى أسامة فؤاد السقا',
        driverPhone: '01511224466',
        vehiclePlate: 'ط د ق ٧٨١٢',
        fromLocation: 'العين السخنة (السويس)',
        toLocation: 'مدينة 6 أكتوبر (الجيزة)',
        cargoType: 'حديد تسليح ولفائف صاج',
        weightTons: '28.00',
        price: '3800.00',
        commission: '190.00',
        status: 'in_progress',
        currentLocation: 'طريق القطامية السريع (بوابة تحصيل الرسوم)',
        latitude: '29.980120',
        longitude: '31.428510',
        progressPercent: 65,
        startedAt: new Date('2026-03-01T10:00:00Z'),
        createdAt: new Date('2026-03-01T09:35:00Z'),
      },
      {
        id: 'trip-502',
        tripNumber: 'TRIP-EG-8044',
        requestId: 'req-1002',
        acceptanceId: 'acc-past-99',
        offerId: 'off-201',
        shipperId: 'comp-el-araby-ind',
        shipperName: 'مجموعة العربي للصناعات والتجارة',
        shipperPhone: '01233445566',
        transporterId: 'office-delta-transport',
        transporterName: 'مكتب الدلتا للشحن والنقل البري',
        transporterPhone: '01099887766',
        driverId: 'drv-202',
        driverName: 'وليد عبد ربه',
        driverPhone: '01044556677',
        vehiclePlate: 'ر م ل ٥٤٣١',
        fromLocation: 'العاشر من رمضان (الشرقية)',
        toLocation: 'ميناء الإسكندرية',
        cargoType: 'كرتون وتغليف مواد إلكترونية',
        weightTons: '20.00',
        price: '4100.00',
        commission: '205.00',
        status: 'completed',
        currentLocation: 'تم التسليم - ميناء الإسكندرية',
        latitude: '31.189500',
        longitude: '29.878400',
        progressPercent: 100,
        startedAt: new Date('2026-02-25T07:00:00Z'),
        completedAt: new Date('2026-02-25T16:00:00Z'),
        createdAt: new Date('2026-02-24T18:00:00Z'),
      }
    );

    // 11. Trip Status History
    this.tables.trip_status_history.push(
      {
        id: 1,
        tripId: 'trip-501',
        status: 'pending',
        note: 'تم تأكيد حجز الرحلة وإصدار بوليصة الشحن الإلكترونية',
        actorId: 'office-delta-transport',
        actorName: 'مكتب الدلتا للشحن',
        timestamp: new Date('2026-03-01T09:35:00Z'),
      },
      {
        id: 2,
        tripId: 'trip-501',
        status: 'loading',
        note: 'دخول الشاحنة لبوابة المصنع وبدء التحميل',
        actorId: 'drv-101',
        actorName: 'الأسطى أسامة فؤاد السقا',
        timestamp: new Date('2026-03-01T10:15:00Z'),
      },
      {
        id: 3,
        tripId: 'trip-501',
        status: 'in_progress',
        note: 'اكتمال الوزن والانطلاق على طريق القطامية - العين السخنة',
        actorId: 'drv-101',
        actorName: 'الأسطى أسامة فؤاد السقا',
        timestamp: new Date('2026-03-01T11:00:00Z'),
      }
    );

    // 12. Ratings
    this.tables.ratings.push({
      id: 'rate-1',
      tripId: 'trip-502',
      tripNumber: 'TRIP-EG-8044',
      fromUserId: 'comp-el-araby-ind',
      fromUserName: 'مجموعة العربي للصناعات والتجارة',
      fromUserRole: 'company',
      toUserId: 'office-delta-transport',
      toUserName: 'مكتب الدلتا للشحن والنقل البري',
      toUserRole: 'office',
      rating: 5,
      comment: 'التزام كامل بمواعيد التحميل والتسليم ومحافظة تامة على كراتين الأجهزة.',
      createdAt: new Date('2026-02-25T18:00:00Z'),
    });

    // 13. Notifications
    this.tables.notifications.push(
      {
        id: 'notif-1',
        userId: 'comp-suez-steel',
        title: 'تم قبول حمولة لطلبك',
        message: 'قبل مكتب الدلتا للشحن نقل حمولة للطلب #REQ-2026-001. رقم الرحلة: TRIP-EG-9102',
        type: 'trip',
        read: false,
        link: '/trips/trip-501',
        createdAt: new Date('2026-03-01T09:35:00Z'),
      },
      {
        id: 'notif-2',
        userId: 'office-delta-transport',
        title: 'تم تأكيد حجز الرحلة',
        message: 'تم ربط السائق أسامة السقا بالرحلة #TRIP-EG-9102 بنجاح',
        type: 'trip',
        read: true,
        link: '/trips/trip-501',
        createdAt: new Date('2026-03-01T09:36:00Z'),
      }
    );

    // 14. Documents
    this.tables.documents.push(
      {
        id: 'doc-1',
        userId: 'comp-suez-steel',
        documentType: 'commercial_reg',
        title: 'السجل التجاري لشركة السويس للصلب',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        status: 'approved',
        verifiedBy: 'أحمد محمود القاضي (المدير العام)',
        verifiedAt: new Date('2026-01-11T12:00:00Z'),
        createdAt: new Date('2026-01-10T10:00:00Z'),
      },
      {
        id: 'doc-2',
        userId: 'office-delta-transport',
        documentType: 'commercial_reg',
        title: 'ترخيص مزاولة نشاط النقل البري',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
        status: 'approved',
        verifiedBy: 'أحمد محمود القاضي (المدير العام)',
        verifiedAt: new Date('2026-01-21T14:00:00Z'),
        createdAt: new Date('2026-01-20T11:00:00Z'),
      }
    );

    // 15. Audit Logs
    this.tables.audit_logs.push({
      id: 'log-seed-1',
      actorId: 'admin',
      actorName: 'ConnectTrans Super Admin',
      actorRole: 'admin',
      action: 'SYSTEM_INIT',
      entity: 'system',
      entityId: 'cloudsql-europe-west2',
      details: 'تهيئة قاعدة بيانات ConnectTrans بنجاح في بيئة الإنتاج السحابية',
      timestamp: new Date('2026-01-01T00:00:00Z'),
    });
  }

  public getTable(name: string): any[] {
    if (!this.tables[name]) {
      this.tables[name] = [];
    }
    return this.tables[name];
  }
}

export const memoryDb = new MemoryDatabaseStore();
