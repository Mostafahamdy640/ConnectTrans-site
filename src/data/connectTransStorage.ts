import { 
  CompanyAccount, 
  TransportOfficeAccount, 
  VehicleOwnerAccount, 
  Vehicle, 
  Driver, 
  TransportRequest, 
  TransportOfficeOffer,
  CompanyDirectInquiry,
  RequestAcceptance, 
  Trip, 
  TripRating, 
  FeeProfile, 
  AuditLog 
} from '../types';

export interface ConnectTransDatabase {
  version: number;
  lastUpdated: string;
  companies: CompanyAccount[];
  offices: TransportOfficeAccount[];
  vehicleOwners: VehicleOwnerAccount[];
  vehicles: Vehicle[];
  drivers: Driver[];
  requests: TransportRequest[];
  officeOffers: TransportOfficeOffer[];
  companyInquiries: CompanyDirectInquiry[];
  acceptances: RequestAcceptance[];
  trips: Trip[];
  ratings: TripRating[];
  feeProfiles: FeeProfile[];
  auditLogs: AuditLog[];
}

const STORAGE_KEY = 'connecttrans_db_v1';
const BACKUP_STORAGE_KEY = 'connecttrans_db_backups';

// 1. Initial State with ConnectTrans internal entity & trial fees
export const INITIAL_CONNECTTRANS_DB: ConnectTransDatabase = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  
  // Fee Profiles - Default is Trial with 0 fees
  feeProfiles: [
    {
      id: 'fee-trial-zero',
      name: 'الفترة التجريبية (مجاناً 0%)',
      description: 'عمولة 0% لكافة الأطراف خلال فترة الإطلاق التجريبية لمنصة ConnectTrans',
      isDefault: true,
      isTrialPromo: true,
      officeFee: 0,
      vehicleOwnerFee: 0,
      connectTransCommission: 0,
      minTripPrice: 1,
      maxTripPrice: 15000,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'fee-standard-postlaunch',
      name: 'البروفايل القياسي (بعد انتهاء التجريبي)',
      description: 'بروفايل جاهز للتفعيل لاحقاً بإشراف الإدارة (رسوم رمزية عادلة)',
      isDefault: false,
      isTrialPromo: false,
      officeFee: 15,
      vehicleOwnerFee: 20,
      connectTransCommission: 25,
      minTripPrice: 1,
      maxTripPrice: 15000,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }
  ],

  // 1. Approved internal ConnectTrans Transport Office
  offices: [
    {
      id: 'office-connecttrans-internal',
      officeName: 'ConnectTrans Direct Logistics (المكتب الداخلي المعتمد)',
      displayName: 'ConnectTrans للنقل اللوجستي المباشر',
      username: 'connecttrans_direct',
      commercialRegister: '1098234-EG',
      taxCard: '882-910-334',
      contacts: {
        phone: '01029384756',
        email: 'operations@connecttrans.eg',
        whatsapp: '01029384756',
        telegram: '@connecttrans_eg',
        facebook: 'facebook.com/connecttrans.eg'
      },
      governorate: 'القاهرة',
      city: 'القاهرة الجديدة (التجمع الخامس)',
      status: 'approved',
      documents: [
        {
          id: 'doc-cr-ct',
          name: 'السجل التجاري لـ ConnectTrans',
          type: 'commercial_register',
          url: 'docs/cr_connecttrans.pdf',
          uploadedAt: '2026-01-10T10:00:00Z',
          status: 'verified'
        }
      ],
      createdAt: '2026-01-10T10:00:00Z',
      isInternalConnectTrans: true,
      notes: 'المكتب التشغيلي المباشر التابع للمنصة لتنفيذ تعاقدات النقل المباشرة'
    },
    {
      id: 'office-delta-transport',
      officeName: 'مكتب الدلتا لخدمات الشحن واللوجستيات',
      displayName: 'مكتب الدلتا للشحن والنقل البري',
      username: 'delta_logistics',
      commercialRegister: '439201-EG',
      taxCard: '661-409-112',
      contacts: {
        phone: '01234567891',
        email: 'delta.office@logistics.eg',
        whatsapp: '01234567891',
      },
      governorate: 'الإسكندرية',
      city: 'ميناء الدخيلة',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-15T12:00:00Z',
      notes: 'مكتب معتمد متخصص في بوالص الحبوب والحاويات'
    }
  ],

  // Real Companies
  companies: [
    {
      id: 'comp-el-araby-ind',
      companyName: 'مجموعة الصناعات الهندسية والتجارية',
      displayName: 'مجموعة الصناعات الهندسية',
      contactPerson: 'م/ طارق عبد الله (مدير سلاسل الإمداد)',
      commercialRegister: '984321-EG',
      taxCard: '554-102-778',
      contacts: {
        phone: '01011223344',
        email: 'logistics@industries-eg.com',
        whatsapp: '01011223344'
      },
      governorate: 'المنوفية',
      city: 'قويسنا (المنطقة الصناعية)',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-18T09:30:00Z',
      notes: 'شركة مصنعة للأجهزة ومعدات التوزيع'
    },
    {
      id: 'comp-suez-steel',
      companyName: 'الشركة المصرية لمنتجات الصلب والحديد',
      displayName: 'المصرية لمنتجات الصلب',
      contactPerson: 'أ/ شريف جلال (رئيس الشحن والتصدير)',
      commercialRegister: '761298-EG',
      taxCard: '901-223-455',
      contacts: {
        phone: '01122334455',
        email: 'shipping@suez-steel.eg',
        whatsapp: '01122334455'
      },
      governorate: 'السويس',
      city: 'العين السخنة (المنطقة الاقتصادية)',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-20T14:15:00Z',
      notes: 'شحنات دورية ثقيلة تريلات فرش'
    }
  ],

  // Real Vehicle Owners
  vehicleOwners: [
    {
      id: 'owner-ahmed-mansour',
      ownerName: 'الحاج أحمد منصور الشناوي',
      displayName: 'أحمد منصور (أسطول نقل ثقيل)',
      contacts: {
        phone: '01099887766',
        email: 'mansour.trans@gmail.com',
        whatsapp: '01099887766'
      },
      governorate: 'الغربية',
      city: 'طنطا',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-22T11:00:00Z',
      notes: 'يمتلك 4 سيارات تريلا فرش وستائر'
    },
    {
      id: 'owner-mahmoud-farag',
      ownerName: 'محمود عبد الرازق فرج',
      displayName: 'محمود فرج للنقل السريع',
      contacts: {
        phone: '01277665544',
        email: 'm.farag@gmail.com',
        whatsapp: '01277665544'
      },
      governorate: 'الشرقية',
      city: 'العاشر من رمضان',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-25T16:30:00Z',
      notes: 'سيارات جامبو مقفولة نقل مصانع'
    }
  ],

  // Vehicles
  vehicles: [
    {
      id: 'veh-101',
      ownerId: 'owner-ahmed-mansour',
      ownerName: 'الحاج أحمد منصور الشناوي',
      plateNumber: 'ط ع ص ٩١٨٢',
      vehicleType: 'تريلا فرش / سطحة (Flatbed)',
      brand: 'مرسيدس أكتروس',
      model: 'Actros 1845',
      year: 2021,
      capacityTons: 30,
      cargoTypeAllowed: 'حديد، سيراميك، لفائف صاج، رخام',
      licenseNumber: 'LIC-GH-88192',
      status: 'approved',
      documents: [],
      currentDriverName: 'أسامة فؤاد السقا',
      createdAt: '2026-01-23T10:00:00Z'
    },
    {
      id: 'veh-102',
      ownerId: 'owner-mahmoud-farag',
      ownerName: 'محمود عبد الرازق فرج',
      plateNumber: 'ر م ل ٥٤٣١',
      vehicleType: 'سيارة جامبو نقل متوسط (Jumbo)',
      brand: 'شيفروليه جامبو',
      model: 'NPR 7000',
      year: 2022,
      capacityTons: 7,
      cargoTypeAllowed: 'كرتون، أدوات كهربائية، بضائع عامة',
      licenseNumber: 'LIC-SH-55421',
      status: 'approved',
      documents: [],
      currentDriverName: 'وليد عبد ربه',
      createdAt: '2026-01-26T14:00:00Z'
    }
  ],

  // Drivers
  drivers: [
    {
      id: 'drv-201',
      driverName: 'أسامة فؤاد السقا',
      contacts: {
        phone: '01511224466',
        email: 'osama.sakka@gmail.com',
        whatsapp: '01511224466'
      },
      governorate: 'الغربية',
      city: 'طنطا',
      nationalId: '28911041600214',
      licenseNumber: 'DL-FIRST-CLASS-8819',
      ownerId: 'owner-ahmed-mansour',
      ownerName: 'الحاج أحمد منصور الشناوي',
      assignedVehicleId: 'veh-101',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-24T09:00:00Z'
    },
    {
      id: 'drv-202',
      driverName: 'وليد عبد ربه',
      contacts: {
        phone: '01044556677',
        email: 'walid.raboh@gmail.com',
        whatsapp: '01044556677'
      },
      governorate: 'الشرقية',
      city: 'العاشر من رمضان',
      nationalId: '29208031200987',
      licenseNumber: 'DL-SECOND-CLASS-4421',
      ownerId: 'owner-mahmoud-farag',
      ownerName: 'محمود عبد الرازق فرج',
      assignedVehicleId: 'veh-102',
      status: 'approved',
      documents: [],
      createdAt: '2026-01-27T10:30:00Z'
    }
  ],

  // Transport Requests (Marketplace Orders with Required, Accepted, Remaining Quantities)
  requests: [
    {
      id: 'req-1001',
      requestNumber: 'REQ-2026-001',
      creatorId: 'comp-suez-steel',
      creatorType: 'company',
      creatorName: 'الشركة المصرية لمنتجات الصلب والحديد',
      creatorGovernorate: 'السويس',
      creatorCity: 'العين السخنة',
      requestType: 'marketplace',
      fromGovernorate: 'السويس',
      fromCity: 'العين السخنة (المنطقة الصناعية)',
      toGovernorate: 'الجيزة',
      toCity: 'مدينة 6 أكتوبر (المنطقة الصناعية الثالثة)',
      pickupLocation: 'بوابة مصانع الدرفلة رقم 2 - العين السخنة',
      dropoffLocation: 'مستودع التوزيع المركزي - مجمع البنوك أكتوبر',
      truckType: 'تريلا فرش / سطحة (Flatbed)',
      cargoType: 'حديد تسليح ولفائف صاج صلب',
      weightTons: 28,
      pricePerUnit: 3800,
      requiredQuantity: 5,   // مطلوب نقل 5 نقلات
      remainingQuantity: 4,  // تم قبول 1 فتبقى 4
      acceptedQuantity: 1,
      status: 'partially_accepted',
      notes: 'تحميل فوري مع تسهيلات وزن بالميزان البسكول',
      createdAt: '2026-02-01T08:30:00Z',
      contacts: {
        phone: '01122334455',
        email: 'shipping@suez-steel.eg',
        whatsapp: '01122334455'
      }
    },
    {
      id: 'req-1002',
      requestNumber: 'REQ-2026-002',
      creatorId: 'comp-el-araby-ind',
      creatorType: 'company',
      creatorName: 'مجموعة الصناعات الهندسية والتجارية',
      creatorGovernorate: 'المنوفية',
      creatorCity: 'قويسنا',
      requestType: 'marketplace',
      fromGovernorate: 'المنوفية',
      fromCity: 'قويسنا (المنطقة الصناعية)',
      toGovernorate: 'الإسكندرية',
      toCity: 'ميناء الدخيلة (الإسكندرية)',
      pickupLocation: 'مخازن الإنتاج التام مجمع المصانع قويسنا',
      dropoffLocation: 'رصيف الشحن بميناء الدخيلة للتصدير',
      truckType: 'سيارة جامبو نقل متوسط (Jumbo)',
      cargoType: 'أجهزة كهربائية ومنتجات معبأة بكرتون',
      weightTons: 6,
      pricePerUnit: 2400,
      requiredQuantity: 3,
      remainingQuantity: 3,
      acceptedQuantity: 0,
      offersCount: 1,
      status: 'has_offers',
      notes: 'بضاعة حساسة تحتاج سيارة صندوق مقفول ونظيفة',
      createdAt: '2026-02-02T10:00:00Z',
      contacts: {
        phone: '01011223344',
        email: 'logistics@industries-eg.com',
        whatsapp: '01011223344'
      }
    }
  ],

  // Transport Office Offers submitted on Requests
  officeOffers: [
    {
      id: 'off-501',
      requestId: 'req-1002',
      requestNumber: 'REQ-2026-002',
      officeId: 'office-delta-transport',
      officeName: 'مكتب الدلتا لخدمات الشحن واللوجستيات',
      officeCity: 'الإسكندرية',
      offeredPricePerUnit: 2350,
      availableQuantity: 3,
      remainingQuantity: 3,
      acceptedQuantity: 0,
      truckTypesAvailable: 'سيارة جامبو مقفلة (صندوق نظيف ومؤمن)',
      validUntil: '2026-03-30T00:00:00Z',
      notes: 'جاهزون لتغطية كامل النقلات بسيارات مجهزة مع تأمين نقل بضائع',
      status: 'active',
      createdAt: '2026-02-02T14:30:00Z',
      officeContacts: {
        phone: '01234567891',
        email: 'delta.office@logistics.eg',
        whatsapp: '01234567891'
      }
    },
    {
      id: 'off-502',
      requestId: 'req-1001',
      requestNumber: 'REQ-2026-001',
      officeId: 'office-connecttrans-internal',
      officeName: 'ConnectTrans Direct Logistics (المكتب الداخلي المعتمد)',
      officeCity: 'القاهرة',
      offeredPricePerUnit: 3800,
      availableQuantity: 4,
      remainingQuantity: 4,
      acceptedQuantity: 0,
      truckTypesAvailable: 'تريلا فرش / سطحة مع أحزمة أمان متطورة',
      validUntil: '2026-03-31T00:00:00Z',
      notes: 'عرض مباشر تحت إشراف وضمان منصة ConnectTrans المباشر',
      status: 'active',
      createdAt: '2026-02-01T10:00:00Z',
      officeContacts: {
        phone: '01029384756',
        email: 'operations@connecttrans.eg',
        whatsapp: '01029384756'
      }
    }
  ],

  // Direct Inquiries & Cooperation Requests from Companies directly to ConnectTrans
  companyInquiries: [
    {
      id: 'inq-801',
      companyName: 'مجموعة النصر للمنتجات الغذائية والصناعية',
      commercialRegister: '662819-EG',
      contactPerson: 'أ/ خالد الصاوي (مدير المشتريات اللوجستية)',
      phone: '01055667788',
      email: 'logistics@elnasr-foods.com',
      governorate: 'الشرقية',
      city: 'مدينة العاشر من رمضان',
      monthlyCargoVolumeTons: 650,
      truckTypesNeeded: ['ثلاجة مبردة ومجمدة (Reefer)', 'جامبو مقفلة'],
      cooperationType: 'long_term_contract',
      notes: 'نرغب في إبرام عقد تعاون مباشر مع ConnectTrans لإدارة حركة النقل اليومية من المصنع لجميع المحافظات.',
      status: 'new',
      createdAt: '2026-02-03T11:00:00Z'
    }
  ],

  // Real Acceptances
  acceptances: [
    {
      id: 'acc-301',
      requestId: 'req-1001',
      requestNumber: 'REQ-2026-001',
      acceptedByUserId: 'owner-ahmed-mansour',
      acceptedByUserName: 'الحاج أحمد منصور الشناوي',
      acceptedByUserType: 'vehicle_owner',
      acceptedQuantity: 1,
      remainingBefore: 5,
      remainingAfter: 4,
      agreedPrice: 3800,
      totalAmount: 3800,
      officeFee: 0,
      vehicleOwnerFee: 0,
      connectTransCommission: 0,
      paymentStatus: 'waived', // 0 during trial
      status: 'active',
      acceptedAt: '2026-02-01T11:20:00Z',
      releasedContacts: {
        creatorContacts: {
          phone: '01122334455',
          email: 'shipping@suez-steel.eg',
          whatsapp: '01122334455'
        },
        acceptorContacts: {
          phone: '01099887766',
          email: 'mansour.trans@gmail.com',
          whatsapp: '01099887766'
        },
        releasedAt: '2026-02-01T11:20:00Z'
      }
    }
  ],

  // Real Trips (Tied to request & acceptance)
  trips: [
    {
      id: 'trip-501',
      tripNumber: 'TRIP-EG-9102',
      requestId: 'req-1001',
      acceptanceId: 'acc-301',
      shipperId: 'comp-suez-steel',
      shipperName: 'الشركة المصرية لمنتجات الصلب والحديد',
      shipperRole: 'company',
      transporterId: 'owner-ahmed-mansour',
      transporterName: 'الحاج أحمد منصور الشناوي',
      transporterRole: 'vehicle_owner',
      driverId: 'drv-201',
      driverName: 'أسامة فؤاد السقا',
      driverPhone: '01511224466',
      vehiclePlate: 'ط ع ص ٩١٨٢',
      fromLocation: 'العين السخنة (المنطقة الصناعية)',
      toLocation: 'مدينة 6 أكتوبر (المنطقة الصناعية الثالثة)',
      cargoType: 'حديد تسليح ولفائف صاج صلب',
      quantity: 1,
      status: 'in_progress',
      statusHistory: [
        { status: 'pending', timestamp: '2026-02-01T11:20:00Z', note: 'تم تأكيد القبول وإنشاء أمر الرحلة' },
        { status: 'assigned', timestamp: '2026-02-01T12:00:00Z', note: 'تعيين السائق أسامة فؤاد والشاحنة' },
        { status: 'in_progress', timestamp: '2026-02-01T14:30:00Z', note: 'الانتهاء من التحميل والتحرك على طريق القطامية - العين السخنة' }
      ],
      currentLocation: 'طريق القطامية السريع (بوابة تحصيل الرسوم)',
      progressPercent: 65,
      price: 3800,
      commission: 0,
      createdAt: '2026-02-01T11:20:00Z',
      startedAt: '2026-02-01T14:30:00Z'
    },
    {
      id: 'trip-502',
      tripNumber: 'TRIP-EG-8044',
      requestId: 'req-past-99',
      acceptanceId: 'acc-past-99',
      shipperId: 'comp-el-araby-ind',
      shipperName: 'مجموعة الصناعات الهندسية والتجارية',
      shipperRole: 'company',
      transporterId: 'office-delta-transport',
      transporterName: 'مكتب الدلتا للشحن والنقل البري',
      transporterRole: 'office',
      driverId: 'drv-202',
      driverName: 'وليد عبد ربه',
      driverPhone: '01044556677',
      vehiclePlate: 'ر م ل ٥٤٣١',
      fromLocation: 'العاشر من رمضان (الشرقية)',
      toLocation: 'ميناء الإسكندرية',
      cargoType: 'كرتون وتغليف مواد إلكترونية',
      quantity: 1,
      status: 'completed',
      statusHistory: [
        { status: 'pending', timestamp: '2026-01-28T08:00:00Z' },
        { status: 'in_progress', timestamp: '2026-01-28T10:00:00Z' },
        { status: 'completed', timestamp: '2026-01-28T18:30:00Z', note: 'تم التسليم وتفريغ الحمولة بالكامل واستلام بوليصة التسليم' }
      ],
      progressPercent: 100,
      price: 4100,
      commission: 0,
      createdAt: '2026-01-28T08:00:00Z',
      startedAt: '2026-01-28T10:00:00Z',
      completedAt: '2026-01-28T18:30:00Z',
      ratedByShipper: true,
      ratedByTransporter: true
    }
  ],

  // Real Ratings (Only for completed trips)
  ratings: [
    {
      id: 'rate-1',
      tripId: 'trip-502',
      tripNumber: 'TRIP-EG-8044',
      fromUserId: 'comp-el-araby-ind',
      fromUserName: 'مجموعة الصناعات الهندسية والتجارية',
      fromUserRole: 'company',
      toUserId: 'office-delta-transport',
      toUserName: 'مكتب الدلتا للشحن والنقل البري',
      toUserRole: 'office',
      rating: 5,
      comment: 'التزام كامل بمواعيد التحميل والتسليم ومحافظة تامة على كراتين الأجهزة.',
      createdAt: '2026-01-29T10:15:00Z'
    },
    {
      id: 'rate-2',
      tripId: 'trip-502',
      tripNumber: 'TRIP-EG-8044',
      fromUserId: 'office-delta-transport',
      fromUserName: 'مكتب الدلتا للشحن والنقل البري',
      fromUserRole: 'office',
      toUserId: 'comp-el-araby-ind',
      toUserName: 'مجموعة الصناعات الهندسية والتجارية',
      toUserRole: 'company',
      rating: 5,
      comment: 'جهة محترمة وسرعة في إجراءات الميزان والتفريغ دون أي تأخير.',
      createdAt: '2026-01-29T11:00:00Z'
    }
  ],

  // Audit Logs for real system changes
  auditLogs: [
    {
      id: 'log-1',
      actorId: 'admin',
      actorName: 'ConnectTrans Super Admin',
      actorRole: 'admin',
      action: 'APPROVE',
      entity: 'office',
      entityId: 'office-connecttrans-internal',
      newValue: 'approved',
      metadata: { role: 'office', note: 'اعتماد المكتب التشغيلي الداخلي' },
      timestamp: '2026-01-10T10:05:00Z'
    },
    {
      id: 'log-2',
      actorId: 'owner-ahmed-mansour',
      actorName: 'الحاج أحمد منصور الشناوي',
      actorRole: 'vehicle_owner',
      action: 'ACCEPT_REQUEST',
      entity: 'request',
      entityId: 'req-1001',
      oldValue: 'remaining: 5',
      newValue: 'remaining: 4',
      metadata: { acceptedQuantity: 1, requestNumber: 'REQ-2026-001' },
      timestamp: '2026-02-01T11:20:00Z'
    },
    {
      id: 'log-3',
      actorId: 'system',
      actorName: 'ConnectTrans Core Engine',
      actorRole: 'system',
      action: 'RELEASE_CONTACTS',
      entity: 'acceptance',
      entityId: 'acc-301',
      newValue: 'released',
      metadata: { requestNumber: 'REQ-2026-001', parties: ['comp-suez-steel', 'owner-ahmed-mansour'] },
      timestamp: '2026-02-01T11:20:00Z'
    }
  ]
};

// 2. Storage Manager (Local Portable Database - Zero external dependencies)
export class ConnectTransStorage {
  private static instance: ConnectTransStorage;

  private constructor() {}

  public static getInstance(): ConnectTransStorage {
    if (!ConnectTransStorage.instance) {
      ConnectTransStorage.instance = new ConnectTransStorage();
    }
    return ConnectTransStorage.instance;
  }

  // Get current DB or initialize cleanly if empty
  public getDatabase(): ConnectTransDatabase {
    try {
      if (typeof window === 'undefined') {
        return INITIAL_CONNECTTRANS_DB;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveDatabase(INITIAL_CONNECTTRANS_DB);
        return INITIAL_CONNECTTRANS_DB;
      }
      const parsed = JSON.parse(raw);
      // Ensure essential arrays exist
      return {
        ...INITIAL_CONNECTTRANS_DB,
        ...parsed,
        offices: parsed.offices || INITIAL_CONNECTTRANS_DB.offices,
        companies: parsed.companies || INITIAL_CONNECTTRANS_DB.companies,
        vehicleOwners: parsed.vehicleOwners || INITIAL_CONNECTTRANS_DB.vehicleOwners,
        vehicles: parsed.vehicles || INITIAL_CONNECTTRANS_DB.vehicles,
        drivers: parsed.drivers || INITIAL_CONNECTTRANS_DB.drivers,
        requests: parsed.requests || INITIAL_CONNECTTRANS_DB.requests,
        officeOffers: parsed.officeOffers || INITIAL_CONNECTTRANS_DB.officeOffers,
        companyInquiries: parsed.companyInquiries || INITIAL_CONNECTTRANS_DB.companyInquiries,
        acceptances: parsed.acceptances || INITIAL_CONNECTTRANS_DB.acceptances,
        trips: parsed.trips || INITIAL_CONNECTTRANS_DB.trips,
        ratings: parsed.ratings || INITIAL_CONNECTTRANS_DB.ratings,
        feeProfiles: parsed.feeProfiles || INITIAL_CONNECTTRANS_DB.feeProfiles,
        auditLogs: parsed.auditLogs || INITIAL_CONNECTTRANS_DB.auditLogs,
      };
    } catch (e) {
      console.error('Error reading ConnectTrans local database, fallback to initial state', e);
      return INITIAL_CONNECTTRANS_DB;
    }
  }

  // Save DB safely
  public saveDatabase(db: ConnectTransDatabase): void {
    try {
      if (typeof window !== 'undefined') {
        db.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      }
    } catch (e) {
      console.error('Error persisting ConnectTrans database', e);
    }
  }

  // 1. Submit Company Direct Cooperation Inquiry / Registration
  public submitCompanyInquiry(inquiryData: Omit<CompanyDirectInquiry, 'id' | 'createdAt' | 'status'>): CompanyDirectInquiry {
    const db = this.getDatabase();
    const id = `inq-${Date.now()}`;
    const inquiry: CompanyDirectInquiry = {
      ...inquiryData,
      id,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    db.companyInquiries.unshift(inquiry);

    // Also ensure company exists or is created in companies list if not present
    const existingComp = db.companies.find(c => c.companyName === inquiryData.companyName || c.contacts.phone === inquiryData.phone);
    if (!existingComp) {
      db.companies.push({
        id: `comp-${Date.now()}`,
        companyName: inquiryData.companyName,
        displayName: inquiryData.companyName,
        contactPerson: inquiryData.contactPerson,
        commercialRegister: inquiryData.commercialRegister || 'تحت المراجعة',
        taxCard: 'تحت المراجعة',
        contacts: {
          phone: inquiryData.phone,
          email: inquiryData.email,
          whatsapp: inquiryData.phone
        },
        governorate: inquiryData.governorate,
        city: inquiryData.city,
        status: 'pending',
        documents: [],
        createdAt: new Date().toISOString(),
        notes: `طلب تعاون مباشر: ${inquiryData.cooperationType}`
      });
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: 'company',
      actorName: inquiryData.companyName,
      actorRole: 'company',
      action: 'COMPANY_DIRECT_INQUIRY',
      entity: 'company',
      entityId: id,
      newValue: `طلب تعاون وتواصل مباشر مع ConnectTrans (${inquiryData.cooperationType})`,
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return inquiry;
  }

  // 2. Transport Office Submits Offer on Transport Request
  public submitOfficeOffer(params: {
    requestId: string;
    officeId: string;
    officeName: string;
    officeCity: string;
    offeredPricePerUnit: number;
    availableQuantity: number;
    truckTypesAvailable: string;
    notes?: string;
    officeContacts: { phone: string; email: string; whatsapp?: string };
  }): { success: boolean; message: string; offer?: TransportOfficeOffer } {
    const db = this.getDatabase();
    const req = db.requests.find(r => r.id === params.requestId);
    if (!req) {
      return { success: false, message: 'طلب النقل غير موجود' };
    }
    if (req.status === 'closed' || req.remainingQuantity <= 0) {
      return { success: false, message: 'عذراً، هذا الطلب مغلق ومكتمل النقلات' };
    }
    if (params.availableQuantity <= 0) {
      return { success: false, message: 'يرجى تحديد كمية متاحة صحيحة' };
    }

    const offerId = `off-${Date.now()}`;
    const newOffer: TransportOfficeOffer = {
      id: offerId,
      requestId: req.id,
      requestNumber: req.requestNumber,
      officeId: params.officeId,
      officeName: params.officeName,
      officeCity: params.officeCity,
      offeredPricePerUnit: params.offeredPricePerUnit,
      availableQuantity: params.availableQuantity,
      remainingQuantity: params.availableQuantity,
      acceptedQuantity: 0,
      truckTypesAvailable: params.truckTypesAvailable,
      notes: params.notes,
      status: 'active',
      createdAt: new Date().toISOString(),
      officeContacts: params.officeContacts
    };

    db.officeOffers.unshift(newOffer);

    // Update request state
    req.offersCount = (req.offersCount || 0) + 1;
    if (req.status === 'open') {
      req.status = 'has_offers';
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: params.officeId,
      actorName: params.officeName,
      actorRole: 'office',
      action: 'SUBMIT_OFFER',
      entity: 'offer',
      entityId: offerId,
      newValue: `تقديم عرض بسعر ${params.offeredPricePerUnit} ج.م وكمية ${params.availableQuantity} شاحنة على الطلب ${req.requestNumber}`,
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return { 
      success: true, 
      message: `تم تقديم عرض مكتب النقل بنجاح على الطلب ${req.requestNumber}، وسيظهر فوراً لأصحاب السيارات للاختيار والقبول.`, 
      offer: newOffer 
    };
  }

  // 3. Vehicle Owner Accepts an Office Offer (The key user flow!)
  public acceptOfficeOfferByVehicleOwner(params: {
    offerId: string;
    vehicleOwnerId: string;
    vehicleOwnerName: string;
    acceptedQuantity: number;
    vehiclePlate?: string;
    driverName?: string;
    driverPhone?: string;
    ownerContacts: { phone: string; email: string; whatsapp?: string };
  }): { success: boolean; message: string; trip?: Trip; acceptance?: RequestAcceptance } {
    const db = this.getDatabase();
    const offerIndex = db.officeOffers.findIndex(o => o.id === params.offerId);
    if (offerIndex === -1) {
      return { success: false, message: 'عرض مكتب النقل غير موجود' };
    }

    const offer = db.officeOffers[offerIndex];
    if (offer.status === 'exhausted' || offer.remainingQuantity <= 0) {
      return { success: false, message: 'عذراً، هذا العرض تم استيفاء كافة كمياته المتاحة بالكامل' };
    }

    if (params.acceptedQuantity <= 0) {
      return { success: false, message: 'يرجى تحديد كمية صحيحة أكبر من الصفر' };
    }

    if (params.acceptedQuantity > offer.remainingQuantity) {
      return { 
        success: false, 
        message: `الكمية المطلوبة (${params.acceptedQuantity}) تتجاوز الكمية المتبقية المتاحة بالعرض (${offer.remainingQuantity})` 
      };
    }

    const requestIndex = db.requests.findIndex(r => r.id === offer.requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'طلب النقل المرتبط بهذا العرض غير متوفر' };
    }
    const request = db.requests[requestIndex];

    // Check if request itself has remaining
    const actualAccepted = Math.min(params.acceptedQuantity, request.remainingQuantity);
    if (actualAccepted <= 0) {
      return { success: false, message: 'عذراً، هذا الطلب مكتمل بالفعل' };
    }

    // Active fee profile (Trial = 0)
    const activeFee = db.feeProfiles.find(f => f.isDefault) || db.feeProfiles[0];
    const isTrial = activeFee.isTrialPromo;

    // 1. Update Offer
    const offerRemainingBefore = offer.remainingQuantity;
    offer.remainingQuantity -= actualAccepted;
    offer.acceptedQuantity += actualAccepted;
    if (offer.remainingQuantity === 0) {
      offer.status = 'exhausted';
    } else {
      offer.status = 'partially_accepted';
    }

    // 2. Update Request
    const reqRemainingBefore = request.remainingQuantity;
    const reqRemainingAfter = reqRemainingBefore - actualAccepted;
    request.remainingQuantity = reqRemainingAfter;
    request.acceptedQuantity += actualAccepted;
    if (reqRemainingAfter === 0) {
      request.status = 'closed';
      request.closedAt = new Date().toISOString();
    } else {
      request.status = 'partially_accepted';
    }

    // 3. Create Acceptance Record linking all 3 parties (Company + Office + Vehicle Owner)
    const acceptanceId = `acc-${Date.now()}`;
    const acceptance: RequestAcceptance = {
      id: acceptanceId,
      requestId: request.id,
      requestNumber: request.requestNumber,
      offerId: offer.id,
      intermediaryOfficeId: offer.officeId,
      intermediaryOfficeName: offer.officeName,
      acceptedByUserId: params.vehicleOwnerId,
      acceptedByUserName: params.vehicleOwnerName,
      acceptedByUserType: 'vehicle_owner',
      acceptedQuantity: actualAccepted,
      remainingBefore: reqRemainingBefore,
      remainingAfter: reqRemainingAfter,
      agreedPrice: offer.offeredPricePerUnit,
      totalAmount: offer.offeredPricePerUnit * actualAccepted,
      officeFee: isTrial ? 0 : activeFee.officeFee,
      vehicleOwnerFee: isTrial ? 0 : activeFee.vehicleOwnerFee,
      connectTransCommission: isTrial ? 0 : activeFee.connectTransCommission,
      paymentStatus: isTrial ? 'waived' : 'pending',
      status: 'active',
      acceptedAt: new Date().toISOString(),
      releasedContacts: {
        creatorContacts: request.contacts,
        acceptorContacts: params.ownerContacts,
        officeContacts: offer.officeContacts,
        releasedAt: new Date().toISOString(),
      }
    };
    db.acceptances.unshift(acceptance);

    // 4. Create Trip
    const tripId = `trip-${Date.now()}`;
    const tripNumber = `TRIP-EG-${Math.floor(1000 + Math.random() * 9000)}`;
    const trip: Trip = {
      id: tripId,
      tripNumber,
      requestId: request.id,
      acceptanceId: acceptance.id,
      offerId: offer.id,
      intermediaryOfficeId: offer.officeId,
      intermediaryOfficeName: offer.officeName,
      shipperId: request.creatorId,
      shipperName: request.creatorName,
      shipperRole: request.creatorType,
      transporterId: params.vehicleOwnerId,
      transporterName: params.vehicleOwnerName,
      transporterRole: 'vehicle_owner',
      driverName: params.driverName || 'سائق معتمد',
      driverPhone: params.driverPhone || params.ownerContacts.phone,
      vehiclePlate: params.vehiclePlate || 'ط ع ص ٩١٨٢',
      fromLocation: `${request.fromCity} (${request.fromGovernorate})`,
      toLocation: `${request.toCity} (${request.toGovernorate})`,
      cargoType: request.cargoType,
      quantity: actualAccepted,
      status: 'accepted',
      statusHistory: [
        { status: 'pending', timestamp: new Date().toISOString(), note: 'تم قبول عرض مكتب النقل بواسطة صاحب السيارة' },
        { status: 'accepted', timestamp: new Date().toISOString(), note: `تم تحرير بيانات التواصل بين (الشركة، مكتب النقل: ${offer.officeName}، وصاحب السيارة: ${params.vehicleOwnerName})` }
      ],
      progressPercent: 15,
      price: offer.offeredPricePerUnit * actualAccepted,
      commission: isTrial ? 0 : activeFee.connectTransCommission,
      createdAt: new Date().toISOString()
    };
    db.trips.unshift(trip);

    // 5. Audit logs for each step
    db.auditLogs.unshift({
      id: `log-${Date.now()}-1`,
      actorId: params.vehicleOwnerId,
      actorName: params.vehicleOwnerName,
      actorRole: 'vehicle_owner',
      action: 'ACCEPT_OFFER',
      entity: 'offer',
      entityId: offer.id,
      oldValue: `offer_rem: ${offerRemainingBefore}`,
      newValue: `offer_rem: ${offer.remainingQuantity}, accepted_qty: ${actualAccepted}`,
      metadata: { requestNumber: request.requestNumber, offerId: offer.id },
      timestamp: new Date().toISOString()
    });

    db.auditLogs.unshift({
      id: `log-${Date.now()}-2`,
      actorId: 'system',
      actorName: 'ConnectTrans Broker Engine',
      actorRole: 'system',
      action: 'CREATE_TRIP',
      entity: 'trip',
      entityId: trip.id,
      newValue: `إنشاء الرحلة ${tripNumber} وتحرير بيانات التواصل للشركة ومكتب النقل وصاحب الشاحنة فوراً`,
      metadata: { tripNumber, requestNumber: request.requestNumber },
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return {
      success: true,
      message: `تم قبول العرض بنجاح! تم إنشاء الرحلة ${tripNumber}، وتحديث الكمية المتبقية، وفتح بيانات التواصل لكافة الأطراف.`,
      trip,
      acceptance
    };
  }

  // Direct Request Acceptance (Fallback / Direct)
  public acceptRequest(params: {
    requestId: string;
    acceptedByUserId: string;
    acceptedByUserName: string;
    acceptedByUserType: 'office' | 'vehicle_owner';
    acceptedQuantity: number;
    acceptorContacts: { phone: string; email: string; whatsapp?: string };
    actorRole: string;
  }): { success: boolean; message: string; trip?: Trip; acceptance?: RequestAcceptance } {
    const db = this.getDatabase();
    const requestIndex = db.requests.findIndex(r => r.id === params.requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'طلب النقل غير موجود' };
    }

    const request = db.requests[requestIndex];

    if (request.status === 'closed' || request.remainingQuantity <= 0) {
      return { success: false, message: 'عذراً، هذا الطلب مكتمل أو مغلق ولا توجد كميات متبقية للقبول' };
    }

    if (params.acceptedQuantity <= 0) {
      return { success: false, message: 'يرجى تحديد كمية صحيحة أكبر من الصفر' };
    }

    if (params.acceptedQuantity > request.remainingQuantity) {
      return { 
        success: false, 
        message: `الكمية المطلوبة (${params.acceptedQuantity}) تتجاوز الكمية المتبقية المتاحة (${request.remainingQuantity})` 
      };
    }

    // Active fee profile
    const activeFee = db.feeProfiles.find(f => f.isDefault) || db.feeProfiles[0];
    const isTrial = activeFee.isTrialPromo;

    const remainingBefore = request.remainingQuantity;
    const remainingAfter = remainingBefore - params.acceptedQuantity;
    const acceptedQuantityNew = request.acceptedQuantity + params.acceptedQuantity;

    // Update Request
    request.remainingQuantity = remainingAfter;
    request.acceptedQuantity = acceptedQuantityNew;
    
    // Automatically close request if remaining quantity is 0
    if (remainingAfter === 0) {
      request.status = 'closed';
      request.closedAt = new Date().toISOString();
    } else {
      request.status = 'partially_accepted';
    }

    // Record Acceptance
    const acceptanceId = `acc-${Date.now()}`;
    const acceptance: RequestAcceptance = {
      id: acceptanceId,
      requestId: request.id,
      requestNumber: request.requestNumber,
      acceptedByUserId: params.acceptedByUserId,
      acceptedByUserName: params.acceptedByUserName,
      acceptedByUserType: params.acceptedByUserType,
      acceptedQuantity: params.acceptedQuantity,
      remainingBefore,
      remainingAfter,
      agreedPrice: request.pricePerUnit,
      totalAmount: request.pricePerUnit * params.acceptedQuantity,
      officeFee: isTrial ? 0 : activeFee.officeFee,
      vehicleOwnerFee: isTrial ? 0 : activeFee.vehicleOwnerFee,
      connectTransCommission: isTrial ? 0 : activeFee.connectTransCommission,
      paymentStatus: isTrial ? 'waived' : 'pending',
      status: 'active',
      acceptedAt: new Date().toISOString(),
      releasedContacts: {
        creatorContacts: request.contacts,
        acceptorContacts: params.acceptorContacts,
        releasedAt: new Date().toISOString(),
      }
    };
    db.acceptances.unshift(acceptance);

    // Create corresponding Trip / Order
    const tripId = `trip-${Date.now()}`;
    const tripNumber = `TRIP-EG-${Math.floor(1000 + Math.random() * 9000)}`;
    const trip: Trip = {
      id: tripId,
      tripNumber,
      requestId: request.id,
      acceptanceId: acceptance.id,
      shipperId: request.creatorId,
      shipperName: request.creatorName,
      shipperRole: request.creatorType,
      transporterId: params.acceptedByUserId,
      transporterName: params.acceptedByUserName,
      transporterRole: params.acceptedByUserType,
      fromLocation: `${request.fromCity} (${request.fromGovernorate})`,
      toLocation: `${request.toCity} (${request.toGovernorate})`,
      cargoType: request.cargoType,
      quantity: params.acceptedQuantity,
      status: 'accepted',
      statusHistory: [
        { status: 'pending', timestamp: new Date().toISOString(), note: 'تم إنشاء حجز الرحلة بنجاح بعد قبول الطلب' },
        { status: 'accepted', timestamp: new Date().toISOString(), note: 'تم تحرير بيانات الاتصال للطرفين' }
      ],
      progressPercent: 10,
      price: request.pricePerUnit * params.acceptedQuantity,
      commission: isTrial ? 0 : activeFee.connectTransCommission,
      createdAt: new Date().toISOString()
    };
    db.trips.unshift(trip);

    // Add Audit Logs
    db.auditLogs.unshift({
      id: `log-${Date.now()}-1`,
      actorId: params.acceptedByUserId,
      actorName: params.acceptedByUserName,
      actorRole: params.actorRole,
      action: 'ACCEPT_REQUEST',
      entity: 'request',
      entityId: request.id,
      oldValue: `remaining: ${remainingBefore}`,
      newValue: `remaining: ${remainingAfter}, status: ${request.status}`,
      metadata: { requestNumber: request.requestNumber, acceptedQty: params.acceptedQuantity },
      timestamp: new Date().toISOString()
    });

    db.auditLogs.unshift({
      id: `log-${Date.now()}-2`,
      actorId: 'system',
      actorName: 'ConnectTrans Policy Engine',
      actorRole: 'system',
      action: 'RELEASE_CONTACTS',
      entity: 'acceptance',
      entityId: acceptance.id,
      newValue: 'Contacts released for both parties',
      metadata: { requestNumber: request.requestNumber },
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return { 
      success: true, 
      message: `تم قبول ${params.acceptedQuantity} حمولة بنجاح، والكمية المتبقية الآن: ${remainingAfter}. تم تحرير بيانات الاتصال وإصدار أمر الرحلة ${tripNumber}.`,
      trip,
      acceptance
    };
  }

  // Create new Transport Request
  public createTransportRequest(reqData: Omit<TransportRequest, 'id' | 'requestNumber' | 'remainingQuantity' | 'acceptedQuantity' | 'status' | 'createdAt'>): TransportRequest {
    const db = this.getDatabase();
    const id = `req-${Date.now()}`;
    const requestNumber = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    
    const newRequest: TransportRequest = {
      ...reqData,
      id,
      requestNumber,
      remainingQuantity: reqData.requiredQuantity,
      acceptedQuantity: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    db.requests.unshift(newRequest);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: reqData.creatorId,
      actorName: reqData.creatorName,
      actorRole: reqData.creatorType,
      action: 'CREATE_REQUEST',
      entity: 'request',
      entityId: id,
      newValue: `Created request for ${reqData.requiredQuantity} units (${reqData.truckType})`,
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return newRequest;
  }

  // Update Trip Status (e.g. Complete Trip)
  public updateTripStatus(tripId: string, status: Trip['status'], actor: { id: string; name: string; role: string }, note?: string): boolean {
    const db = this.getDatabase();
    const trip = db.trips.find(t => t.id === tripId);
    if (!trip) return false;

    const oldStatus = trip.status;
    trip.status = status;
    trip.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `تحديث حالة الرحلة إلى ${status}`
    });

    if (status === 'in_progress' && !trip.startedAt) {
      trip.startedAt = new Date().toISOString();
      trip.progressPercent = 50;
    } else if (status === 'completed') {
      trip.completedAt = new Date().toISOString();
      trip.progressPercent = 100;
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: status === 'completed' ? 'COMPLETE_TRIP' : 'UPDATE_TRIP',
      entity: 'trip',
      entityId: trip.id,
      oldValue: oldStatus,
      newValue: status,
      metadata: { tripNumber: trip.tripNumber, note },
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return true;
  }

  // Submit Rating (Only allowed when trip is completed)
  public submitRating(params: {
    tripId: string;
    fromUserId: string;
    fromUserName: string;
    fromUserRole: any;
    toUserId: string;
    toUserName: string;
    toUserRole: any;
    rating: number;
    comment: string;
  }): { success: boolean; message: string } {
    const db = this.getDatabase();
    const trip = db.trips.find(t => t.id === params.tripId);
    
    if (!trip) {
      return { success: false, message: 'الرحلة غير موجودة' };
    }

    if (trip.status !== 'completed') {
      return { success: false, message: 'لا يمكن تقديم التقييم إلا بعد اكتمال الرحلة بنجاح' };
    }

    const ratingRecord: TripRating = {
      id: `rate-${Date.now()}`,
      tripId: trip.id,
      tripNumber: trip.tripNumber,
      fromUserId: params.fromUserId,
      fromUserName: params.fromUserName,
      fromUserRole: params.fromUserRole,
      toUserId: params.toUserId,
      toUserName: params.toUserName,
      toUserRole: params.toUserRole,
      rating: Math.max(1, Math.min(5, params.rating)),
      comment: params.comment,
      createdAt: new Date().toISOString()
    };

    db.ratings.unshift(ratingRecord);

    if (params.fromUserId === trip.shipperId) {
      trip.ratedByShipper = true;
    } else {
      trip.ratedByTransporter = true;
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: params.fromUserId,
      actorName: params.fromUserName,
      actorRole: params.fromUserRole,
      action: 'RATE_TRIP',
      entity: 'rating',
      entityId: ratingRecord.id,
      newValue: `${params.rating}/5 stars for trip ${trip.tripNumber}`,
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(db);
    return { success: true, message: 'شكراً لك، تم تسجيل التقييم بنجاح' };
  }

  // Admin Account Approval / Status Updates
  public updateAccountStatus(entityType: 'company' | 'office' | 'vehicle_owner' | 'driver' | 'vehicle', id: string, status: any, adminName = 'Admin'): boolean {
    const db = this.getDatabase();
    let found = false;

    if (entityType === 'company') {
      const item = db.companies.find(c => c.id === id);
      if (item) { item.status = status; found = true; }
    } else if (entityType === 'office') {
      const item = db.offices.find(o => o.id === id);
      if (item) { item.status = status; found = true; }
    } else if (entityType === 'vehicle_owner') {
      const item = db.vehicleOwners.find(v => v.id === id);
      if (item) { item.status = status; found = true; }
    } else if (entityType === 'driver') {
      const item = db.drivers.find(d => d.id === id);
      if (item) { item.status = status; found = true; }
    } else if (entityType === 'vehicle') {
      const item = db.vehicles.find(v => v.id === id);
      if (item) { item.status = status; found = true; }
    }

    if (found) {
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        actorId: 'admin',
        actorName: adminName,
        actorRole: 'admin',
        action: status === 'approved' ? 'APPROVE' : status === 'suspended' ? 'SUSPEND' : 'EDIT',
        entity: entityType as any,
        entityId: id,
        newValue: status,
        timestamp: new Date().toISOString()
      });
      this.saveDatabase(db);
    }

    return found;
  }

  // Backup & Restore Utilities
  public createLocalBackup(): { timestamp: string; sizeBytes: number } {
    const db = this.getDatabase();
    const backupJson = JSON.stringify(db);
    const timestamp = new Date().toISOString();
    
    try {
      if (typeof window !== 'undefined') {
        const existingRaw = localStorage.getItem(BACKUP_STORAGE_KEY);
        const backups: { timestamp: string; data: string }[] = existingRaw ? JSON.parse(existingRaw) : [];
        backups.unshift({ timestamp, data: backupJson });
        // Keep last 5 backups
        if (backups.length > 5) backups.pop();
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
      }
    } catch (e) {
      console.error('Backup write failed', e);
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorId: 'admin',
      actorName: 'Admin System',
      actorRole: 'admin',
      action: 'BACKUP_CREATED',
      entity: 'system',
      entityId: `backup-${timestamp}`,
      timestamp
    });
    this.saveDatabase(db);

    return { timestamp, sizeBytes: backupJson.length };
  }

  public exportBackupJson(): string {
    const db = this.getDatabase();
    return JSON.stringify(db, null, 2);
  }

  public restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as ConnectTransDatabase;
      if (!parsed.companies || !parsed.offices || !parsed.requests) {
        throw new Error('Invalid ConnectTrans schema');
      }
      this.saveDatabase(parsed);
      return true;
    } catch (e) {
      console.error('Restore error', e);
      return false;
    }
  }
}

export const ctStorage = ConnectTransStorage.getInstance();
