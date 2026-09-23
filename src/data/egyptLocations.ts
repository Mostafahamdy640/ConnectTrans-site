import type { CommissionProfile, UserAccount, SitePageContent } from '../types.ts';

// Governorates and Cities/Centers of Egypt with Sample Villages & Industrial Zones
export interface EgyptLocation {
  governorate: string;
  cities: {
    name: string;
    subZones?: string[]; // villages, industrial zones, ports
  }[];
}

export const EGYPT_LOCATIONS: EgyptLocation[] = [
  {
    governorate: 'القاهرة',
    cities: [
      { name: 'مدينة نصر', subZones: ['المنطقة الأولى', 'الحي العاشر', 'مكرم عبيد'] },
      { name: 'مصر الجديدة', subZones: ['الكوربة', 'روكسي', 'شيراتون'] },
      { name: 'حلوان', subZones: ['المعصرة', 'كفر العلو', 'المساكن الاقتصادية'] },
      { name: 'المعادي', subZones: ['دجلة', 'زهراء المعادي', 'طرة'] },
      { name: 'بدر والمنطقة الصناعية', subZones: ['المنطقة الصناعية الرابعة', 'الروبيكي للجلود', 'حي النزهة'] },
      { name: 'القاهرة الجديدة', subZones: ['التجمع الخامس', 'التجمع الأول', 'المنطقة الصناعية'] },
      { name: 'شبرا', subZones: ['الساحل', 'روض الفرج', 'مهمشة'] },
      { name: 'عين شمس والمطرية', subZones: ['ميدان الحلمية', 'مسطرد (مستودعات البترول)'] }
    ]
  },
  {
    governorate: 'الجيزة',
    cities: [
      { name: 'السادس من أكتوبر', subZones: ['المنطقة الصناعية الأولى', 'المنطقة الصناعية الثالثة', 'أكتوبر الجديدة'] },
      { name: 'الشيخ زايد', subZones: ['الثورة الخضراء', 'الحي الـ 16', 'المدخل الثاني'] },
      { name: 'الهرم وفيصل', subZones: ['المريوطية', 'اللبيني', 'مشعل'] },
      { name: 'العياط', subZones: ['قرية برنشت', 'قرية المتانيا', 'قرية طهما'] },
      { name: 'البدرشين', subZones: ['قرية ميت رهينة', 'قرية المرازيق', 'قرية سقارة'] },
      { name: 'الصف وأطفيح', subZones: ['منطقة مصانع الطوب', 'قرية الشوبك', 'قرية كفر قنديل'] },
      { name: 'أوسيم ومنشأة القناطر', subZones: ['قرية البراجيل', 'قرية بشتيل', 'قرية ذات الكوم'] }
    ]
  },
  {
    governorate: 'الإسكندرية',
    cities: [
      { name: 'برج العرب الجديدة', subZones: ['المنطقة الصناعية الأولى', 'المنطقة الصناعية الرابعة', 'بنجر السكر'] },
      { name: 'ميناء الإسكندرية ومحرم بك', subZones: ['المنطقة الحرة بالعامرية', 'باب 10', 'القباري'] },
      { name: 'العامرية', subZones: ['النهضة', 'عبد القادر', 'مرغم'] },
      { name: 'سيدي بشر والعصافرة', subZones: ['ميامي', 'المندرة', 'المعمورة'] },
      { name: 'الدخيلة', subZones: ['ميناء الدخيلة', 'البيطاش', 'أبو يوسف'] }
    ]
  },
  {
    governorate: 'الشرقية',
    cities: [
      { name: 'العاشر من رمضان', subZones: ['المنطقة الصناعية B1', 'المنطقة الصناعية A4', 'المطورين'] },
      { name: 'الزقازيق', subZones: ['قرية شيبة النكارية', 'قرية بهنباي', 'الزنكلون'] },
      { name: 'بلبيس', subZones: ['قرية أنشاص الرمل', 'قرية غيتة', 'المنطقة الصناعية بالزوامل'] },
      { name: 'فاقوس', subZones: ['قرية الصالحية القديمة', 'قرية الخطارة', 'الصالحية الجديدة للصناعات'] },
      { name: 'منيا القمح', subZones: ['قرية التلين', 'قرية ميت يزيد', 'قرية العزيزية'] },
      { name: 'ديرب نجم', subZones: ['قرية صافور', 'قرية الصفا', 'قرية بهنية'] }
    ]
  },
  {
    governorate: 'الدقهلية',
    cities: [
      { name: 'المنصورة', subZones: ['قرية ميت مزاح', 'قرية سلكا', 'قرية سندوب والصناعية'] },
      { name: 'ميت غمر', subZones: ['قرية تفهنا الأشراف', 'قرية كوم النور', 'قرية دقادوس'] },
      { name: 'طلخا', subZones: ['قرية ديسط', 'قرية نوسا البحر', 'مجمع الأسمدة'] },
      { name: 'بلقاس', subZones: ['قرية الحفير', 'قرية الستاموني', 'المعصرة'] },
      { name: 'السنبلاوين', subZones: ['قرية طماي الزهايرة', 'قرية نوب طريف', 'قرية غزالة'] }
    ]
  },
  {
    governorate: 'القليوبية',
    cities: [
      { name: 'شبرا الخيمة', subZones: ['بهتيم', 'المنطقة الصناعية', 'منشية الحرية'] },
      { name: 'بنها', subZones: ['قرية كفر الجزار', 'قرية مرصفا', 'قرية شبلنجة'] },
      { name: 'قليوب', subZones: ['قرية سنديون', 'قرية قلما', 'قرية بلقس'] },
      { name: 'الخانكة وأبو زعبل', subZones: ['مصانع الأسمدة', 'قرية المنايل', 'عرب العليقات'] },
      { name: 'طوخ', subZones: ['قرية مشتهر', 'قرية الدير', 'قرية أجهور الكبرى'] }
    ]
  },
  {
    governorate: 'الغربية',
    cities: [
      { name: 'طنطا', subZones: ['قرية سبرباي', 'قرية كفر عصام', 'قرية نواج'] },
      { name: 'المحلة الكبرى', subZones: ['منطقة مصانع الغزل والنسيج', 'قرية صفط تراب', 'قرية بلقينا'] },
      { name: 'زفتى', subZones: ['قرية سنباط', 'قرية دهتورة', 'قرية ميت الرخا'] },
      { name: 'كفر الزيات', subZones: ['المنطقة الصناعية للكيماويات', 'قرية الدلجمون', 'قرية قليب إبيار'] }
    ]
  },
  {
    governorate: 'المنوفية',
    cities: [
      { name: 'السادات', subZones: ['المنطقة الصناعية الخامسة', 'المنطقة السابعة', 'الخطاطبة'] },
      { name: 'شبين الكوم', subZones: ['قرية شنوان', 'قرية الماي', 'قرية الراهب'] },
      { name: 'أشمون', subZones: ['قرية شما', 'قرية سبك الأحد', 'قرية طليا'] },
      { name: 'قويسنا', subZones: ['المنطقة الصناعية بقويسنا', 'قرية ميت برة', 'قرية بجيرم'] }
    ]
  },
  {
    governorate: 'البحيرة',
    cities: [
      { name: 'دمنهور', subZones: ['قرية دنشال', 'قرية الأبعادية', 'قرية زاوية غزال'] },
      { name: 'وادي النطرون', subZones: ['المنطقة الصناعية بوادي النطرون', 'مزارع الطريق الصحراوي'] },
      { name: 'كفر الدوار', subZones: ['المجمع الصناعي للغزل', 'قرية سيدي غازي', 'قرية معمل القزاز'] },
      { name: 'النوبارية الجديدة', subZones: ['قرية بنجر السكر', 'محطة الفرز والتصدير الزراعي'] },
      { name: 'إيتاي البارود', subZones: ['قرية شنديد', 'قرية صفط الحرية', 'قرية معنيا'] }
    ]
  },
  {
    governorate: 'السويس',
    cities: [
      { name: 'السويس وعتاقة', subZones: ['المنطقة الصناعية بالأدبية', 'ميناء السخنة', 'شمال غرب السويس'] },
      { name: 'العين السخنة', subZones: ['الميناء المحوري', 'مجمع البتروكيماويات', 'مجمع الحديد والصلب'] },
      { name: 'حي الأربعين والفيصل', subZones: ['كفر أحمد عبده', 'حي الجناين والأراضي الزراعية'] }
    ]
  },
  {
    governorate: 'بورسعيد',
    cities: [
      { name: 'بورسعيد', subZones: ['ميناء غرب بورسعيد', 'المنطقة الحرة العامة', 'حي الضواحي'] },
      { name: 'شرق بورسعيد', subZones: ['ميناء شرق التفريعة', 'المنطقة الاقتصادية لقناة السويس', 'منطقة الأرصفة'] },
      { name: 'بورفؤاد', subZones: ['الملاحات', 'سهل الطينة'] }
    ]
  },
  {
    governorate: 'دمياط',
    cities: [
      { name: 'دمياط وميناء دمياط', subZones: ['منطقة المستودعات والميناء', 'شطا', 'قرية السنانية'] },
      { name: 'مدينة دمياط للأثاث', subZones: ['المرحلة الأولى', 'المرحلة الثانية'] },
      { name: 'فارسكور والزرقا', subZones: ['قرية كفر الشناوي', 'قرية ميت الخولي', 'قرية شرمساح'] }
    ]
  },
  {
    governorate: 'الإسماعيلية',
    cities: [
      { name: 'الإسماعيلية', subZones: ['المنطقة الصناعية الأولى', 'المنطقة الحرة العامة', 'قرية نفيشة'] },
      { name: 'القنطرة شرق وغرب', subZones: ['المنطقة الصناعية بالقنطرة شرق', 'قرية الأبطال', 'قرية التقدم'] },
      { name: 'فايد والتل الكبير', subZones: ['قرية سرابيوم', 'قرية وادي الملاك'] }
    ]
  },
  {
    governorate: 'بني سويف',
    cities: [
      { name: 'بني سويف الجديدة', subZones: ['منطقة بياض العرب الصناعية', 'منطقة كوم أبو راضي', 'قرية باها'] },
      { name: 'الواسطى', subZones: ['قرية الميمون', 'قرية إطواب', 'قرية قمن العروس'] },
      { name: 'الفشن وببا', subZones: ['قرية تلت', 'قرية سدس الأمراء', 'قرية صفط راشين'] }
    ]
  },
  {
    governorate: 'المنيا',
    cities: [
      { name: 'المنيا الجديدة', subZones: ['المنطقة الصناعية بالمطاهرة', 'قرية البرجاية', 'قرية طهنا الجبل'] },
      { name: 'ملوي', subZones: ['قرية الروضة', 'قرية دروة', 'قرية تندة'] },
      { name: 'بني مزار ومغاغة', subZones: ['قرية القيس', 'قرية أبا الوقف', 'قرية برطباط'] }
    ]
  },
  {
    governorate: 'أسيوط',
    cities: [
      { name: 'أسيوط الجديدة', subZones: ['المنطقة الصناعية بالصفا', 'المنطقة البترولية بجحدم', 'منقباد'] },
      { name: 'ديروط والقوصية', subZones: ['قرية مير', 'قرية صنبو', 'قرية دشلوط'] },
      { name: 'أبنوب والفتح', subZones: ['المنطقة الصناعية بعرب العوامر', 'قرية الواسطى'] }
    ]
  },
  {
    governorate: 'سوهاج',
    cities: [
      { name: 'سوهاج الجديدة', subZones: ['المنطقة الصناعية بغرب جرجا', 'الكوثر الصناعية', 'قرية روافع القصير'] },
      { name: 'طما وطهطا', subZones: ['قرية بنجا', 'قرية شطورة', 'قرية الصوامعة غرب'] },
      { name: 'جرجا والبلينا', subZones: ['قرية بيت داود', 'قرية برديس', 'قرية بيت خلاف'] }
    ]
  },
  {
    governorate: 'قنا والأقصر وأسوان',
    cities: [
      { name: 'قنا وقفط', subZones: ['منطقة قفط الصناعية الحرة', 'قرية دندرة', 'قرية كلاحين قفط'] },
      { name: 'نجع حمادي', subZones: ['مجمع مصانع الألومنيوم', 'قرية هوّ الصناعية', 'قرية بهجورة'] },
      { name: 'الأقصر وإسنا', subZones: ['المنطقة الصناعية بالبغدادي', 'قرية الدير', 'قرية الكيمان'] },
      { name: 'أسوان وإدفو', subZones: ['منطقة العلاقي الصناعية', 'مصانع الفوسفات بالسباعية', 'كيما'] }
    ]
  },
  {
    governorate: 'البحر الأحمر ومطروح وجنوب سيناء',
    cities: [
      { name: 'الغردقة وسفاجا', subZones: ['ميناء سفاجا التعديني والتجاري', 'المنطقة اللوجستية', 'رأس غارب'] },
      { name: 'السلوم والعلمين ومطروح', subZones: ['المنطقة اللوجستية بالعلمين الجديدة', 'ميناء جرجوب', 'منفذ السلوم'] },
      { name: 'شرم الشيخ والطور', subZones: ['المنطقة الصناعية بالطور', 'أبو زنيمة للمحاجر', 'رأس سدر'] }
    ]
  }
];

// Flat list of major Egyptian cities for dropdown quick-pick
export const EGYPT_CITIES_LIST = EGYPT_LOCATIONS.flatMap(loc => 
  loc.cities.map(c => `${c.name} (${loc.governorate})`)
);

// Initial Commission Profiles with Dynamic Pricing Tiers
export const INITIAL_COMMISSION_PROFILES: CommissionProfile[] = [
  {
    id: 'zero-launch',
    name: 'بروفايل الإطلاق المجاني الكامل (0% عمولة)',
    description: 'فترة ترويجية لا تخصم أي مليم من العميل أو صاحب السيارة - عمولة مجانية خلال الفترة التجريبية',
    active: true,
    multiplier: 1.0,
    tiers: [
      {
        id: 'zero-all',
        minPrice: 0,
        maxPrice: 1000000,
        type: 'zero',
        shipperFee: 0,
        transporterFee: 0,
        label: 'مجاني 100% خلال الفترة التجريبية لكافة الأطراف'
      }
    ]
  },
  {
    id: 'standard-egypt',
    name: 'البروفايل القياسي المصري (مدرج حسب قيمة النقل)',
    description: 'عمولة ديناميكية تصاعدية تبدأ من مبالغ رمزية وتنتهي بنسب عادلة لحماية أصحاب السيارات والشركات',
    active: false,
    multiplier: 1.0,
    tiers: [
      {
        id: 'tier-1',
        minPrice: 0,
        maxPrice: 5000,
        type: 'fixed',
        shipperFee: 10,     // 10 جنيه للشركة
        transporterFee: 15, // 15 جنيه للسائق
        label: 'من 0 إلى 5,000 ج.م'
      },
      {
        id: 'tier-2',
        minPrice: 5001,
        maxPrice: 20000,
        type: 'fixed',
        shipperFee: 60,     // 60 جنيه
        transporterFee: 80, // 80 جنيه
        label: 'من 5,001 إلى 20,000 ج.م'
      },
      {
        id: 'tier-3',
        minPrice: 20001,
        maxPrice: 60000,
        type: 'percentage',
        shipperFee: 0.8,     // 0.8%
        transporterFee: 1.2, // 1.2%
        label: 'من 20,001 إلى 60,000 ج.م'
      },
      {
        id: 'tier-4',
        minPrice: 60001,
        maxPrice: 500000,
        type: 'percentage',
        shipperFee: 0.5,     // 0.5%
        transporterFee: 0.8, // 0.8%
        label: 'أكثر من 60,000 ج.م'
      }
    ]
  },
  {
    id: 'flat-percentage',
    name: 'بروفايل النسبة الموحدة (2% للسائق و1% للمصنع)',
    description: 'نظام مبسط بنسبة مئوية واضحة على أي قيمة مشوار',
    active: false,
    multiplier: 1.0,
    tiers: [
      {
        id: 'flat-all',
        minPrice: 0,
        maxPrice: 1000000,
        type: 'percentage',
        shipperFee: 1.0,
        transporterFee: 2.0,
        label: 'نسبة موحدة (1% للشركة و 2% للناقل)'
      }
    ]
  }
];

export const DEFAULT_COMMISSION_PROFILES = INITIAL_COMMISSION_PROFILES;

// Calculate Commission based on active profile and price
export function calculateTripCommission(price: number, profile: CommissionProfile) {
  const effectiveMultiplier = profile.multiplier || 1.0;
  
  // Find matching tier
  const tier = profile.tiers.find(t => price >= t.minPrice && price <= t.maxPrice) 
    || profile.tiers[profile.tiers.length - 1];

  if (!tier || tier.type === 'zero') {
    return {
      shipperFee: 0,
      transporterFee: 0,
      totalCommission: 0,
      tierLabel: 'مجاني 0%'
    };
  }

  let shipperAmount = 0;
  let transporterAmount = 0;

  if (tier.type === 'fixed') {
    shipperAmount = tier.shipperFee * effectiveMultiplier;
    transporterAmount = tier.transporterFee * effectiveMultiplier;
  } else if (tier.type === 'percentage') {
    shipperAmount = Math.round((price * (tier.shipperFee / 100)) * effectiveMultiplier);
    transporterAmount = Math.round((price * (tier.transporterFee / 100)) * effectiveMultiplier);
  }

  return {
    shipperFee: shipperAmount,
    transporterFee: transporterAmount,
    totalCommission: shipperAmount + transporterAmount,
    tierLabel: tier.label
  };
}

// Initial Sample Users for the 4 Roles in Egypt
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-ADM-01',
    name: 'أحمد محمود القاضي (المدير التنفيذي)',
    role: 'admin',
    phone: '01001234567',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    status: 'active',
    verifiedDocs: true,
    walletBalance: 245000,
    rating: 5.0,
    completedTrips: 1840,
  },
  {
    id: 'USR-CMP-01',
    name: 'شركة النيل للصناعات المتطورة',
    role: 'company',
    phone: '01229876543',
    governorate: 'السويس',
    city: 'العين السخنة (المنطقة الصناعية)',
    status: 'active',
    verifiedDocs: true,
    commercialRecordOrLicense: 'سجل تجاري: 44921 / سويس',
    walletBalance: 48200,
    rating: 4.9,
    completedTrips: 340,
  },
  {
    id: 'USR-CMP-02',
    name: 'مجموعة النساجون الشرقيون العالمية',
    role: 'company',
    phone: '01114567890',
    governorate: 'الشرقية',
    city: 'العاشر من رمضان (المنطقة B1)',
    status: 'active',
    verifiedDocs: true,
    commercialRecordOrLicense: 'سجل تجاري: 18720 / شرقية',
    walletBalance: 125000,
    rating: 5.0,
    completedTrips: 620,
  },
  {
    id: 'USR-OFC-01',
    name: 'مكتب الأهرام لنقل البضائع والترلات',
    role: 'office',
    phone: '01099887766',
    governorate: 'الإسكندرية',
    city: 'محرم بك (بجوار ميناء الإسكندرية)',
    status: 'active',
    verifiedDocs: true,
    commercialRecordOrLicense: 'ترخيص نقل بري: 1209 / إسكندرية',
    walletBalance: 32000,
    rating: 4.8,
    completedTrips: 412,
  },
  {
    id: 'USR-OFC-02',
    name: 'مكتب السلام لأسطول النقل الثقيل',
    role: 'office',
    phone: '01556677889',
    governorate: 'الغربية',
    city: 'طنطا (طريق مصر - إسكندرية الزراعي)',
    status: 'active',
    verifiedDocs: true,
    commercialRecordOrLicense: 'ترخيص نقل بضائع: 5543 / غربية',
    walletBalance: 19400,
    rating: 4.7,
    completedTrips: 289,
  },
  {
    id: 'USR-DRV-01',
    name: 'الأسطى محروس عبد الجواد',
    role: 'driver',
    phone: '01067891234',
    governorate: 'الدقهلية',
    city: 'ميت غمر (قرية تفهنا الأشراف)',
    status: 'active',
    verifiedDocs: true,
    truckType: 'تريلا فرش / سطحة (30 طن)',
    plateNumber: 'د ق ص 6814',
    commercialRecordOrLicense: 'رخصة درجة أولى: 99421',
    walletBalance: 6850,
    rating: 4.95,
    completedTrips: 186,
  },
  {
    id: 'USR-DRV-02',
    name: 'الكابتن إبراهيم دسوقي',
    role: 'driver',
    phone: '01278945612',
    governorate: 'البحيرة',
    city: 'دمنهور (قرية دنشال)',
    status: 'active',
    verifiedDocs: true,
    truckType: 'جامبو مقفلة ثلاجة (7 طن)',
    plateNumber: 'ب ح ر 4193',
    commercialRecordOrLicense: 'رخصة درجة ثانية: 33108',
    walletBalance: 4200,
    rating: 4.85,
    completedTrips: 94,
  },
  {
    id: 'USR-DRV-03',
    name: 'الحاج شعبان الصعيدي',
    role: 'driver',
    phone: '01123456781',
    governorate: 'أسيوط',
    city: 'ديروط (قرية صنبو)',
    status: 'pending_verification',
    verifiedDocs: false,
    truckType: 'تريلا جوانب ستارة (25 طن)',
    plateNumber: 'ي و ط 7721',
    commercialRecordOrLicense: 'جاري فحص الرخصة العمومية',
    walletBalance: 0,
    rating: 5.0,
    completedTrips: 0,
  }
];

// Default site editable content for Admin CMS (Every text word is editable by Admin)
export const INITIAL_SITE_CONTENT: SitePageContent = {
  id: 'site-egypt-01',
  title: 'منصة ConnectTrans مصر للنقل واللوجستيات',
  heroHeadline: 'منصة واحدة لإدارة متكاملة',
  heroSecondLine: 'لكافة محافظات وقرى مصر',
  heroSubheadline: 'كل رحلاتك .. كل شحناتك .. وعمولة مجانية بالكامل خلال الفترة التجريبية في مكان واحد',
  heroBadgeText: 'لإدارة النقل والخدمات اللوجستية والشاحنات',
  heroStartBtnText: 'إبدأ الآن',
  heroExploreBtnText: 'اكتشف المزيد',
  announcement: 'عمولة مجانية 0% خلال الفترة التجريبية لمنصة ConnectTrans لكافة الأطراف',
  emergencyPhone: '01001234567',
  officialEmail: 'admin@connecttrans.eg',
  officialWhatsApp: '01001234567',
  officialAddress: 'القاهرة الجديدة، التجمع الخامس، مبنى الأعمال اللوجستية',
  vatNumber: 'سجل تجاري: 1098234-EG | بطاقة ضريبية: 882-910-334',
  aboutHeadline: 'منظومة لوجستية رقمية متطورة تخدم شريان التجارة والصناعة في مصر',
  aboutDescription: 'نربط الشركات والمصانع بمكاتب النقل المعتمدة وأصحاب الشاحنات الأفراد بأمان ومصداقية كاملة مع توثيق إلكتروني ومتابعة لحظية.',
  servicesHeadline: 'حلول وخدمات النقل اللوجستي المخصصة لكافة القطاعات',
  companyPortalTitle: 'بوابة الشركات والمصانع التجارية (قراءة ومتابعة وتواصل مع الإدارة فقط)',
  companyContactNotice: 'وسائل التواصل المتاحة للشركات تقتصر حصرياً على إدارة منصة ConnectTrans المركزية لحماية العقود وحوكمة عمليات الشحن.',
  officePortalTitle: 'بوابة مكاتب النقل والوساطة المعتمدة',
  officePortalNotice: 'الطلبات العامة متاحة للقراءة وإحصائيات الحصص، بينما تظهر الداتا الكاملة وأدوات التحكم حصرياً للطلبات المنشورة بواسطة مكتبكم.',
  driverPortalTitle: 'بوابة أصحاب السيارات والسائقين (حمولة وضمان عودة محملة)',
  driverPortalNotice: 'الطلبات العامة متاحة للقراءة، وتظهر بيانات البوليصة والتواصل وإثبات التسليم للرحلات المسندة لسيارتكم وسائقكم فقط.',
  footerAbout: 'منصة النقل والخدمات اللوجستية الرائدة في جمهورية مصر العربية. ربط موثوق، أسعار عادلة، وتتبع دقيق لكافة الرحلات.',
  footerCopyright: 'جميع الحقوق محفوظة © 2026 ConnectTrans Egypt. مسجلة رسمياً بالهيئة العامة للاستثمار والمناطق الحرة.',
  useLiveDatabaseStats: true,
  pureDatabaseCountOnly: false,
  activeRoadTrucksBaseline: 1454,
  metricCompletedTrips: '',
  metricRegisteredTrucks: '',
  metricActiveRoadTrucks: '',
  metricPartnerCompanies: '',
  metricOnTimeRate: ''
};
