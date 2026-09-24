export type CountryCode = "QA" | "AE" | "BH";

export interface GiftWrapOption {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  description: string;
  descriptionAr?: string;
  image?: string;
  badge?: string;
  badgeAr?: string;
  active?: boolean;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  nameAr: string;
  flag: string;
  currency: string;
  currencyAr: string;
  currencyDecimals: number;
  exchangeRate: number; // Conversion multiplier from QAR base
  phonePrefix: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  giftWrapFee: number;
  allowGiftWrap: boolean;
  giftWrapOptions?: GiftWrapOption[];
  defaultCity: string;
  cities: string[];
  boutiqueName: string;
  boutiqueLocation: string;
  boutiqueLocationAr: string;
  deliveryNotice: string;
  deliveryNoticeAr: string;
  phone: string;
  supportEmail: string;
  orderEmail: string;
  paymentMethods: {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    badge?: string;
  }[];
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  QA: {
    code: "QA",
    name: "Qatar",
    nameAr: "قطر",
    flag: "🇶🇦",
    currency: "QAR",
    currencyAr: "ر.ق",
    currencyDecimals: 2,
    exchangeRate: 1.0,
    phonePrefix: "+974",
    freeShippingThreshold: 900,
    standardShippingFee: 30,
    giftWrapFee: 25,
    allowGiftWrap: true,
    defaultCity: "Doha",
    cities: [
      "Doha",
      "Al Wakrah",
      "Al Rayyan",
      "Lusail",
      "Umm Salal",
      "Al Khor",
      "Al Daayen",
      "Al Shamal",
    ],
    boutiqueName: "Souq Al Wakra Boutique",
    boutiqueLocation: "Souq Al Wakra, Qatar",
    boutiqueLocationAr: "سوق الوكرة، قطر",
    deliveryNotice: "Free 2-Hour Express Delivery across Doha on orders over QAR 900",
    deliveryNoticeAr: "توصيل سريع مجاني خلال ساعتين في الدوحة للطلبات التي تزيد عن 900 ر.ق",
    phone: "+974 5555 1234",
    supportEmail: "support.qa@ramillette.com",
    orderEmail: "orders@ramillette.qa",
    paymentMethods: [
      {
        id: "COD",
        name: "Cash on Delivery",
        nameAr: "الدفع عند الاستلام",
        description: "Pay with cash or card upon delivery in Qatar.",
        descriptionAr: "ادفع نقدًا أو بالبطاقة عند الاستلام في قطر.",
      },
      {
        id: "ONLINE",
        name: "Debit / Credit Card (Qatar)",
        nameAr: "بطاقة الخصم / الائتمان (قطر)",
        description: "Pay securely via SkipCash, QNB SimpliPay & Qatar Card Network.",
        descriptionAr: "ادفع بأمان عبر سكيب كاش وبوابة بنك قطر الوطني.",
        badge: "Instant",
      },
    ],
    giftWrapOptions: [
      {
        id: "free-card",
        name: "Complimentary Luxury Message Card",
        nameAr: "بطاقة إهداء فاخرة مجانية",
        price: 0,
        description: "Handwritten personal note on our signature gold-embossed card with a wax seal envelope.",
        descriptionAr: "رسالة مكتوبة بخط اليد على بطاقة مذهبة ومغلفة بختم شمعي مميز ومغلف ملكي.",
        image: "",
        badge: "Free",
        badgeAr: "مجاناً",
        active: true,
      },
      {
        id: "paper-wrap",
        name: "Classic Artisanal Paper Wrap",
        nameAr: "تغليف ورقي فاخر بشريط حريري",
        price: 10,
        description: "Textured cream & gold foil gift paper with hand-tied satin ribbon and royal wax seal stamp.",
        descriptionAr: "ورق تغليف كريمي فاخر بنقوش ذهبية مع شريط ستان أنيق وختم شمعي ملكي أصلي.",
        image: "/gift-wrap/paper-wrap.jpg",
        active: true,
      },
      {
        id: "custom-box",
        name: "Bespoke Keepsake Gift Box",
        nameAr: "صندوق هدايا ملكي ممغنط ومخملي",
        price: 50,
        description: "Rigid magnetic presentation box, champagne silk velvet cushioning, ribbon and wax emblem.",
        descriptionAr: "صندوق فاخر ببطانة حريرية مخملية وشريط حريري وختم راميليت الملكي المميز.",
        image: "/gift-wrap/custom-box.jpg",
        badge: "Most Popular",
        badgeAr: "الأكثر طلباً",
        active: true,
      },
      {
        id: "flowers-chocolates",
        name: "Royal VIP Box with Flowers & Chocolates",
        nameAr: "باقة ملكية مع ورود طبيعية وشوكولاتة سويسرية",
        price: 100,
        description: "Lavish presentation box, preserved Ecuadorian roses, and gourmet gold-wrapped Swiss chocolates.",
        descriptionAr: "صندوق ملكي متكامل مع باقة ورود إكوادورية دائمة، وشوكولاتة سويسرية فاخرة وبطاقة خاصة.",
        image: "/gift-wrap/flowers-chocolate-box.jpg",
        badge: "Ultimate Luxury",
        badgeAr: "الفخامة المطلقة",
        active: true,
      },
    ],
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    flag: "🇦🇪",
    currency: "AED",
    currencyAr: "د.إ",
    currencyDecimals: 2,
    exchangeRate: 1.01,
    phonePrefix: "+971",
    freeShippingThreshold: 900,
    standardShippingFee: 30,
    giftWrapFee: 25,
    allowGiftWrap: true,
    defaultCity: "Dubai",
    cities: [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
      "Ras Al Khaimah",
      "Fujairah",
      "Umm Al Quwain",
      "Al Ain",
    ],
    boutiqueName: "Downtown Dubai Hub",
    boutiqueLocation: "Downtown Dubai, UAE",
    boutiqueLocationAr: "وسط مدينة دبي، الإمارات",
    deliveryNotice: "Next-Day Express Delivery across Dubai & Abu Dhabi on orders over AED 900",
    deliveryNoticeAr: "توصيل سريع في اليوم التالي في دبي وأبوظبي للطلبات التي تزيد عن 900 د.إ",
    phone: "+971 4 333 5678",
    supportEmail: "support.ae@ramillette.com",
    orderEmail: "orders@ramillette.ae",
    paymentMethods: [
      {
        id: "COD",
        name: "Cash on Delivery",
        nameAr: "الدفع عند الاستلام",
        description: "Pay cash upon arrival anywhere in the UAE.",
        descriptionAr: "ادفع نقدًا عند الاستلام في أي مكان بالإمارات.",
      },
      {
        id: "ONLINE",
        name: "Credit / Debit Card (UAE)",
        nameAr: "بطاقة الائتمان / الخصم (الإمارات)",
        description: "Visa, Mastercard, Apple Pay via Stripe UAE & Network International.",
        descriptionAr: "فيزا، ماستركارد، وأبل باي عبر شبكة الدفع الإماراتية.",
        badge: "Secure",
      },
      {
        id: "TABBY_TAMARA",
        name: "Tabby & Tamara (Split in 4)",
        nameAr: "تابي وتمارا (قسمها على 4 دفعات)",
        description: "Pay 25% today and split the rest over 3 months with 0% interest.",
        descriptionAr: "ادفع 25% اليوم وقسم الباقي على 3 أشهر بدون فوائد.",
        badge: "0% Interest",
      },
    ],
    giftWrapOptions: [
      {
        id: "free-card",
        name: "Complimentary Luxury Message Card",
        nameAr: "بطاقة إهداء فاخرة مجانية",
        price: 0,
        description: "Handwritten personal note on our signature gold-embossed card with a wax seal envelope.",
        descriptionAr: "رسالة مكتوبة بخط اليد على بطاقة مذهبة ومغلفة بختم شمعي مميز ومغلف ملكي.",
        image: "",
        badge: "Free",
        badgeAr: "مجاناً",
        active: true,
      },
      {
        id: "paper-wrap",
        name: "Classic Artisanal Paper Wrap",
        nameAr: "تغليف ورقي فاخر بشريط حريري",
        price: 10,
        description: "Textured cream & gold foil gift paper with hand-tied satin ribbon and royal wax seal stamp.",
        descriptionAr: "ورق تغليف كريمي فاخر بنقوش ذهبية مع شريط ستان أنيق وختم شمعي ملكي أصلي.",
        image: "/gift-wrap/paper-wrap.jpg",
        active: true,
      },
      {
        id: "custom-box",
        name: "Bespoke Keepsake Gift Box",
        nameAr: "صندوق هدايا ملكي ممغنط ومخملي",
        price: 50,
        description: "Rigid magnetic presentation box, champagne silk velvet cushioning, ribbon and wax emblem.",
        descriptionAr: "صندوق فاخر ببطانة حريرية مخملية وشريط حريري وختم راميليت الملكي المميز.",
        image: "/gift-wrap/custom-box.jpg",
        badge: "Most Popular",
        badgeAr: "الأكثر طلباً",
        active: true,
      },
      {
        id: "flowers-chocolates",
        name: "Royal VIP Box with Flowers & Chocolates",
        nameAr: "باقة ملكية مع ورود طبيعية وشوكولاتة سويسرية",
        price: 100,
        description: "Lavish presentation box, preserved Ecuadorian roses, and gourmet gold-wrapped Swiss chocolates.",
        descriptionAr: "صندوق ملكي متكامل مع باقة ورود إكوادورية دائمة، وشوكولاتة سويسرية فاخرة وبطاقة خاصة.",
        image: "/gift-wrap/flowers-chocolate-box.jpg",
        badge: "Ultimate Luxury",
        badgeAr: "الفخامة المطلقة",
        active: true,
      },
    ],
  },
  BH: {
    code: "BH",
    name: "Bahrain",
    nameAr: "البحرين",
    flag: "🇧🇭",
    currency: "BHD",
    currencyAr: "د.ب",
    currencyDecimals: 3,
    exchangeRate: 0.103, // e.g. 350 QAR = 36.050 BHD
    phonePrefix: "+973",
    freeShippingThreshold: 90,
    standardShippingFee: 3,
    giftWrapFee: 3,
    allowGiftWrap: true,
    defaultCity: "Manama",
    cities: [
      "Manama",
      "Muharraq",
      "Riffa",
      "Hamad Town",
      "A'ali",
      "Isa Town",
      "Sitra",
      "Budaiya",
      "Saar",
    ],
    boutiqueName: "Bab Al Bahrain Boutique",
    boutiqueLocation: "Bab Al Bahrain, Manama",
    boutiqueLocationAr: "باب البحرين، المنامة",
    deliveryNotice: "Express Same-Day Delivery across Manama & Riffa on orders over BHD 90",
    deliveryNoticeAr: "توصيل سريع في نفس اليوم في المنامة والرفاع للطلبات التي تزيد عن 90 د.ب",
    phone: "+973 17 888 999",
    supportEmail: "support.bh@ramillette.com",
    orderEmail: "orders@ramillette.bh",
    paymentMethods: [
      {
        id: "COD",
        name: "Cash on Delivery",
        nameAr: "الدفع عند الاستلام",
        description: "Pay upon physical delivery across the Kingdom of Bahrain.",
        descriptionAr: "الدفع نقدًا عند التسليم في جميع أنحاء مملكة البحرين.",
      },
      {
        id: "BENEFIT_PAY",
        name: "BenefitPay & CrediMax",
        nameAr: "بنفت باي وكريديمكس",
        description: "Instant QR & app payment via Bahrain national BenefitPay network.",
        descriptionAr: "دفع فوري سريع عبر شبكة بنفت باي الوطنية وكريديمكس.",
        badge: "National Fav",
      },
      {
        id: "ONLINE",
        name: "Credit / Debit Card",
        nameAr: "بطاقة الائتمان / الخصم",
        description: "Visa, Mastercard & GCC cards via Tap Bahrain.",
        descriptionAr: "فيزا، ماستركارد وبطاقات دول الخليج عبر تاب البحرين.",
      },
    ],
    giftWrapOptions: [
      {
        id: "free-card",
        name: "Complimentary Luxury Message Card",
        nameAr: "بطاقة إهداء فاخرة مجانية",
        price: 0,
        description: "Handwritten personal note on our signature gold-embossed card with a wax seal envelope.",
        descriptionAr: "رسالة مكتوبة بخط اليد على بطاقة مذهبة ومغلفة بختم شمعي مميز ومغلف ملكي.",
        image: "",
        badge: "Free",
        badgeAr: "مجاناً",
        active: true,
      },
      {
        id: "paper-wrap",
        name: "Classic Artisanal Paper Wrap",
        nameAr: "تغليف ورقي فاخر بشريط حريري",
        price: 1,
        description: "Textured cream & gold foil gift paper with hand-tied satin ribbon and royal wax seal stamp.",
        descriptionAr: "ورق تغليف كريمي فاخر بنقوش ذهبية مع شريط ستان أنيق وختم شمعي ملكي أصلي.",
        image: "/gift-wrap/paper-wrap.jpg",
        active: true,
      },
      {
        id: "custom-box",
        name: "Bespoke Keepsake Gift Box",
        nameAr: "صندوق هدايا ملكي ممغنط ومخملي",
        price: 5,
        description: "Rigid magnetic presentation box, champagne silk velvet cushioning, ribbon and wax emblem.",
        descriptionAr: "صندوق فاخر ببطانة حريرية مخملية وشريط حريري وختم راميليت الملكي المميز.",
        image: "/gift-wrap/custom-box.jpg",
        badge: "Most Popular",
        badgeAr: "الأكثر طلباً",
        active: true,
      },
      {
        id: "flowers-chocolates",
        name: "Royal VIP Box with Flowers & Chocolates",
        nameAr: "باقة ملكية مع ورود طبيعية وشوكولاتة سويسرية",
        price: 10,
        description: "Lavish presentation box, preserved Ecuadorian roses, and gourmet gold-wrapped Swiss chocolates.",
        descriptionAr: "صندوق ملكي متكامل مع باقة ورود إكوادورية دائمة، وشوكولاتة سويسرية فاخرة وبطاقة خاصة.",
        image: "/gift-wrap/flowers-chocolate-box.jpg",
        badge: "Ultimate Luxury",
        badgeAr: "الفخامة المطلقة",
        active: true,
      },
    ],
  },
};

export const DEFAULT_COUNTRY: CountryCode = "QA";

export interface PaymentMethodInfo {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  badge?: string;
}

export const MASTER_PAYMENT_METHODS: Record<string, PaymentMethodInfo> = {
  COD: {
    id: "COD",
    name: "Cash on Delivery",
    nameAr: "الدفع عند الاستلام",
    description: "Pay with cash or card upon delivery.",
    descriptionAr: "ادفع نقدًا أو بالبطاقة عند الاستلام.",
  },
  ONLINE: {
    id: "ONLINE",
    name: "Debit / Credit Card",
    nameAr: "بطاقة الخصم / الائتمان",
    description: "Visa, Mastercard & GCC cards via secure payment gateway.",
    descriptionAr: "فيزا، ماستركارد وبطاقات دول الخليج عبر بوابة دفع آمنة.",
    badge: "Secure",
  },
  TABBY_TAMARA: {
    id: "TABBY_TAMARA",
    name: "Tabby & Tamara (Split in 4)",
    nameAr: "تابي وتمارا (قسمها على 4 دفعات)",
    description: "Pay 25% today and split the rest over 3 months with 0% interest.",
    descriptionAr: "ادفع 25% اليوم وقسم الباقي على 3 أشهر بدون فوائد.",
    badge: "0% Interest",
  },
  BENEFIT_PAY: {
    id: "BENEFIT_PAY",
    name: "BenefitPay & CrediMax",
    nameAr: "بنفت باي وكريديمكس",
    description: "Instant QR & app payment via Bahrain national BenefitPay network.",
    descriptionAr: "دفع فوري سريع عبر شبكة بنفت باي الوطنية وكريديمكس.",
    badge: "National Fav",
  },
};

export function resolvePaymentMethods(
  countryCode: string = "QA",
  methods?: (string | PaymentMethodInfo)[]
): PaymentMethodInfo[] {
  const upper = (countryCode || DEFAULT_COUNTRY).toUpperCase() as CountryCode;
  const staticConfig = COUNTRIES[upper] || COUNTRIES[DEFAULT_COUNTRY];

  if (!methods || methods.length === 0) {
    return staticConfig.paymentMethods;
  }

  return methods.map((m) => {
    if (typeof m === "string") {
      const found = staticConfig.paymentMethods.find((pm) => pm.id === m);
      if (found) return found;
      if (MASTER_PAYMENT_METHODS[m]) return MASTER_PAYMENT_METHODS[m];
      return {
        id: m,
        name: m,
        nameAr: m,
        description: `Pay securely using ${m}`,
        descriptionAr: `الدفع بأمان عبر ${m}`,
      };
    }
    return m;
  });
}

export function getCountryConfig(code?: string | null): CountryConfig {
  if (code && code.toUpperCase() in COUNTRIES) {
    return COUNTRIES[code.toUpperCase() as CountryCode];
  }
  return COUNTRIES[DEFAULT_COUNTRY];
}

export function isValidCountry(code?: string | null): code is CountryCode {
  return Boolean(code && code.toUpperCase() in COUNTRIES);
}

