import { Shipment, Testimonial, FaqItem } from '../types';
import { EGYPT_CITIES_LIST } from './egyptLocations';

export const CITIES = EGYPT_CITIES_LIST;

export const TRUCK_TYPES = [
  { id: 'flatbed', name: 'تريلا فرش / سطحة (Flatbed)', capacity: '25-30 طن' },
  { id: 'curtain', name: 'تريلا جوانب وستارة (Curtainsider)', capacity: '25-30 طن' },
  { id: 'box', name: 'شاحنة صندوق مقفول (Box Truck)', capacity: '15-20 طن' },
  { id: 'reefer', name: 'ثلاجة مبردة ومجمدة (Reefer)', capacity: '20-25 طن' },
  { id: 'jumbo', name: 'سيارة جامبو نقل متوسط (Jumbo)', capacity: '4-8 طن' },
  { id: 'quarter', name: 'سيارة ربع نقل / دبابة (Pick-up)', capacity: '1.5-2.5 طن' },
  { id: 'lowboy', name: 'لوبد نقل ثقيل ومعدات (Lowboy)', capacity: '40-70 طن' },
];

export const SAMPLE_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'EG-90214',
    sender: 'مجموعة النساجون الشرقيون العالمية',
    fromGovernorate: 'الشرقية',
    fromCity: 'العاشر من رمضان (المنطقة الصناعية B1)',
    toGovernorate: 'القاهرة',
    toCity: 'مدينة نصر (مكرم عبيد)',
    specificPickupLocation: 'مصنع السجاد 3، بوابة الشحن المركزية',
    specificDropoffLocation: 'معرض النساجون، تقاطع مكرم عبيد',
    truckType: 'تريلا جوانب وستارة (25 طن)',
    cargoType: 'سجاد ومنسوجات تصدير ومفروشات',
    weightTons: 18,
    price: 4500,
    status: 'in_transit',
    currentLocation: 'طريق القاهرة - الإسماعيلية الصحراوي (أمام العبور)',
    progressPercent: 75,
    estimatedArrival: 'اليوم، 04:30 مساءً',
    commissionAmount: 15
  },
  {
    id: '2',
    trackingNumber: 'EG-88410',
    sender: 'شركة سيراميكا كليوباترا للصناعات',
    fromGovernorate: 'السويس',
    fromCity: 'العين السخنة (المنطقة الصناعية)',
    toGovernorate: 'الدقهلية',
    toCity: 'المنصورة (سندوب الصناعية)',
    specificPickupLocation: 'مستودع كليوباترا الرئيسي، السخنة',
    specificDropoffLocation: 'مخازن الدقهلية لمواد البناء - سندوب',
    truckType: 'تريلا فرش / سطحة (30 طن)',
    cargoType: 'سيراميك وبورسلين أرضيات',
    weightTons: 28,
    price: 8500,
    status: 'in_transit',
    currentLocation: 'طريق بنها الحر (اتجاه المنصورة)',
    progressPercent: 60,
    estimatedArrival: 'اليوم، 08:00 مساءً',
    commissionAmount: 80
  },
  {
    id: '3',
    trackingNumber: 'EG-77320',
    sender: 'شركة الدلتا للصناعات الغذائية',
    fromGovernorate: 'البحيرة',
    fromCity: 'النوبارية الجديدة (بنجر السكر)',
    toGovernorate: 'الإسكندرية',
    toCity: 'ميناء الإسكندرية (باب 10)',
    specificPickupLocation: 'محطة الفرز والتعبئة رقم 4',
    specificDropoffLocation: 'رصيف الحاويات 54 بميناء الإسكندرية',
    truckType: 'ثلاجة مبردة ومجمدة (20 طن)',
    cargoType: 'خضروات وفواكه طازجة للتصدير',
    weightTons: 20,
    price: 3800,
    status: 'pending',
    currentLocation: 'النوبارية - بانتظار استكمال أوراق الحجر الزراعي',
    progressPercent: 15,
    estimatedArrival: 'غداً، 09:00 صباحاً',
    commissionAmount: 15
  },
  {
    id: '4',
    trackingNumber: 'EG-66115',
    sender: 'مصنع الألومنيوم بنجع حمادي',
    fromGovernorate: 'قنا والأقصر وأسوان',
    fromCity: 'نجع حمادي (مجمع الألومنيوم)',
    toGovernorate: 'الجيزة',
    toCity: 'السادس من أكتوبر (المنطقة الصناعية الأولى)',
    specificPickupLocation: 'بوابة خروج القوالب والمعادن',
    specificDropoffLocation: 'مصنع أكتوبر لقطاعات الألومنيوم',
    truckType: 'تريلا فرش / سطحة (30 طن)',
    cargoType: 'سبائك وقوالب ألومنيوم خام',
    weightTons: 29,
    price: 16500,
    status: 'in_transit',
    currentLocation: 'طريق الصعيد الصحراوي الغربي (قرب المنيا)',
    progressPercent: 55,
    estimatedArrival: 'الليلة، 11:30 مساءً',
    commissionAmount: 80
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'م. أشرف عبد الفتاح',
    role: 'مدير سلاسل الإمداد والتوزيع',
    company: 'مصانع العاشر لمنتجات الكرتون',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'منصة ConnectTrans وفرت علينا البحث اليدوي والاتصالات بالمواقف والمكاتب. نطلب 5 ترلات يومياً من العاشر إلى كافة محافظات الصعيد والدلتا والأسعار عادلة جداً بدون مبالغة.',
    city: 'العاشر من رمضان'
  },
  {
    id: '2',
    name: 'الأسطى محروس عبد الجواد',
    role: 'مالك وسائق تريلا نقل ثقيل',
    company: 'أسطول الدقهلية الحر',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'كنت بروح إسكندرية أو السويس وارجع فاضي للدقهلية. دلوقتي من على المنصة بحجز نقلة الرجوع وأنا لسه بفرغ، ونظام العمولة بالجنيه رمزي جداً وما بيظلمش السواق.',
    city: 'ميت غمر، الدقهلية'
  },
  {
    id: '3',
    name: 'أ/ مدحت الهواري',
    role: 'مدير مكتب نقل وسيط',
    company: 'مكتب الهواري للخدمات اللوجستية',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'كمكتب نقل المنصة فتحت لينا سوق مباشر مع مصانع السخنة وبرج العرب والسادات، وبندير عربياتنا وسواقينا بعقود موثقة وإيصالات استلام سريعة.',
    city: 'الإسكندرية'
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'general',
    question: 'ما هي منصة ConnectTrans مصر؟',
    answer: 'منظومة إلكترونية متخصصة في خدمات نقل البضائع والشاحنات داخل جمهورية مصر العربية، تجمع الشركات والمصانع، مكاتب النقل، وأصحاب وسائقي السيارات لنقل البضائع بكفاءة وبأعلى ربحية وأمان.'
  },
  {
    category: 'trucks',
    question: 'هل تدعم المنصة جميع أنواع السيارات والقرى والمراكز؟',
    answer: 'نعم، تدعم المنصة التريلات بمختلف أنواعها، الجوانب، الثلاجات، الجامبو، الربع نقل (الدبابة)، وتغطي كل مدن وقرى ومراكز محافظات مصر من الإسكندرية ومطروح وحتى أسوان والوادي الجديد والموانئ والمناطق الصناعية.'
  },
  {
    category: 'payment',
    question: 'كيف يتم احتساب العمولة للطرفين؟',
    answer: 'يعتمد نظام العمولة على بروفايل مرن محدد من إدارة المنصة: عمولة رمزية تبدأ من 10 جنيهات فقط للمبالغ الصغيرة (أقل من 5,000 ج.م)، ومبالغ ثابتة أو نسب مئوية خفيفة للمشاوير الأكبر، مع إمكانية تفعيل فترات إطلاق مجانية 0% بالكامل.'
  },
  {
    category: 'docs',
    question: 'كيف يتم إصدار بوالص الشحن الإلكترونية والعقود؟',
    answer: 'يتم إنشاء بوليصة الشحن وعقد الرحلة إلكترونياً بمجرد الاتفاق، موضحاً بها بيانات السيارة، السائق، الحمولة، السعر، وجهة التحميل والتسليم بالدقة وتوقيع الاستلام.'
  },
  {
    category: 'general',
    question: 'ما هي شروط تسجيل السيارات والسائقين والشركات؟',
    answer: 'لأصحاب السيارات: رخصة قيادة مهنية سارية، رخصة تسيير المركبة، وفحص الصلاحية. للشركات ومكاتب النقل: السجل التجاري والبطاقة الضريبية وترخيص النقل.'
  }
];

