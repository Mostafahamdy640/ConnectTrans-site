import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import { 
  users, companies, offices, vehicleOwners, vehicles, drivers,
  transportRequests, officeOffers, trips, tripStatusHistory, ratings,
  commissionProfiles, auditLogs
} from './schema.ts';
import { INITIAL_COMMISSION_PROFILES } from '../data/egyptLocations.ts';

export async function seedDatabase() {
  console.log('🌱 Starting ConnectTrans database seed...');

  const initialUserPassword = process.env.INITIAL_USER_PASSWORD || '123456';
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'adminconnect';

  const defaultPasswordHash = await bcrypt.hash(initialUserPassword, 10);
  const adminPasswordHash = await bcrypt.hash(initialAdminPassword, 10);

  // 1. Commission Profiles
  for (const profile of INITIAL_COMMISSION_PROFILES) {
    await db.insert(commissionProfiles)
      .values({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        active: profile.active,
        multiplier: profile.multiplier ? String(profile.multiplier) : '1.00',
        tiersJson: JSON.stringify(profile.tiers),
      })
      .onConflictDoNothing();
  }

  // 2. Users
  const seedUsers = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    }
  ];

  for (const u of seedUsers) {
    await db.insert(users)
      .values(u)
      .onConflictDoNothing();
  }

  // 3. Companies
  await db.insert(companies).values([
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
    }
  ]).onConflictDoNothing();

  // 4. Offices
  await db.insert(offices).values([
    {
      id: 'office-delta-transport',
      userId: 'office-delta-transport',
      officeName: 'مكتب الدلتا للشحن والنقل البري',
      licenseNumber: 'OFF-DELTA-7721',
      governorate: 'الغربية',
      city: 'طنطا',
      address: 'مجمع المواقف الجديد - شارع الجلاء',
      phone: '01099887766',
      status: 'active',
    }
  ]).onConflictDoNothing();

  // 5. Vehicles
  await db.insert(vehicles).values([
    {
      id: 'veh-101',
      ownerId: 'owner-ahmed-mansour',
      plateNumber: 'ط د ق ٧٨١٢',
      truckType: 'تريلا فرش / سطحة (Flatbed)',
      capacityTons: '32.00',
      chassisNumber: 'MERC-ACTROS-2023-9912',
      status: 'active',
    },
    {
      id: 'veh-102',
      ownerId: 'owner-ahmed-mansour',
      plateNumber: 'ر م ل ٥٤٣١',
      truckType: 'تريلا جوانب (Side Open)',
      capacityTons: '28.00',
      chassisNumber: 'VOLVO-FH-2022-4419',
      status: 'active',
    }
  ]).onConflictDoNothing();

  // 6. Drivers
  await db.insert(drivers).values([
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
    }
  ]).onConflictDoNothing();

  // 7. Transport Requests
  await db.insert(transportRequests).values([
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
    }
  ]).onConflictDoNothing();

  // 8. Office Offers
  await db.insert(officeOffers).values([
    {
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
    }
  ]).onConflictDoNothing();

  // 9. Trips
  await db.insert(trips).values([
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
      commission: '0.00',
      status: 'in_progress',
      currentLocation: 'طريق القطامية السريع (بوابة تحصيل الرسوم)',
      latitude: '29.980120',
      longitude: '31.428510',
      progressPercent: 65,
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
      commission: '0.00',
      status: 'completed',
      currentLocation: 'تم التسليم - ميناء الإسكندرية',
      latitude: '31.189500',
      longitude: '29.878400',
      progressPercent: 100,
    }
  ]).onConflictDoNothing();

  // 10. Ratings
  await db.insert(ratings).values([
    {
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
    }
  ]).onConflictDoNothing();

  // 11. Audit Logs
  await db.insert(auditLogs).values([
    {
      id: 'log-seed-1',
      actorId: 'admin',
      actorName: 'ConnectTrans Super Admin',
      actorRole: 'admin',
      action: 'SYSTEM_INIT',
      entity: 'system',
      entityId: 'cloudsql-europe-west2',
      details: 'تهيئة قاعدة بيانات ConnectTrans بنجاح في بيئة الإنتاج السحابية',
    }
  ]).onConflictDoNothing();

  console.log('✅ ConnectTrans seed completed successfully!');
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
