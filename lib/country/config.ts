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
  loyaltyEarnType?: "SPEND_RATIO" | "PERCENTAGE" | "FLAT";
  loyaltyEarnValue?: number; // e.g. 100 for spend ratio (100 QAR = 1 pt) or 10 for flat
  loyaltyPointValue?: number; // e.g. 0.10 QAR (so 10 points = 1 QAR discount)
  loyaltyEnabled?: boolean;
  loyaltyMinRedeemPoints?: number;
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
    loyaltyEnabled: true,
    loyaltyEarnType: "SPEND_RATIO",
    loyaltyEarnValue: 100, // 100 QAR spend = 1 point
    loyaltyPointValue: 0.10, // 1 point = 0.10 QAR (10 points = 1 QAR discount)
    loyaltyMinRedeemPoints: 10,
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
        name: "Pay on Delivery (Cash)",
        nameAr: "الدفع نقداً عند الاستلام",
        description: "Pay with cash upon delivery of your order in Qatar.",
        descriptionAr: "ادفع نقدًا عند استلام طلبك في قطر.",
      },
      {
        id: "CARD_ON_DELIVERY",
        name: "Card on Delivery",
        nameAr: "الدفع بالبطاقة عند الاستلام",
        description: "Pay with debit or credit card via courier's portable card machine.",
        descriptionAr: "ادفع ببطاقة الصراف أو الائتمان عبر جهاز نقاط البيع المحمول مع المندوب في قطر.",
        badge: "Card Machine",
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
    loyaltyEnabled: true,
    loyaltyEarnType: "SPEND_RATIO",
    loyaltyEarnValue: 100, // 100 AED spend = 1 point
    loyaltyPointValue: 0.10, // 1 point = 0.10 AED (10 points = 1 AED discount)
    loyaltyMinRedeemPoints: 10,
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
        name: "Pay on Delivery (Cash)",
        nameAr: "الدفع نقداً عند الاستلام",
        description: "Pay with cash upon arrival anywhere in the UAE.",
        descriptionAr: "ادفع نقدًا عند استلام طلبك في أي مكان بالإمارات.",
      },
      {
        id: "CARD_ON_DELIVERY",
        name: "Card on Delivery",
        nameAr: "الدفع بالبطاقة عند الاستلام",
        description: "Pay with debit or credit card via courier's portable card machine.",
        descriptionAr: "ادفع ببطاقة الصراف أو الائتمان عبر جهاز نقاط البيع المحمول مع المندوب في الإمارات.",
        badge: "Card Machine",
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
    loyaltyEnabled: true,
    loyaltyEarnType: "SPEND_RATIO",
    loyaltyEarnValue: 10, // 10 BHD spend = 1 point
    loyaltyPointValue: 0.100, // 1 point = 0.100 BHD (10 points = 1 BHD discount)
    loyaltyMinRedeemPoints: 10,
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
        name: "Pay on Delivery (Cash)",
        nameAr: "الدفع نقداً عند الاستلام",
        description: "Pay with cash upon physical delivery across the Kingdom of Bahrain.",
        descriptionAr: "ادفع نقدًا عند استلام طلبك في جميع أنحاء مملكة البحرين.",
      },
      {
        id: "CARD_ON_DELIVERY",
        name: "Card on Delivery",
        nameAr: "الدفع بالبطاقة عند الاستلام",
        description: "Pay with debit or credit card via courier's portable card machine.",
        descriptionAr: "ادفع ببطاقة الصراف أو الائتمان عبر جهاز نقاط البيع المحمول مع المندوب في البحرين.",
        badge: "Card Machine",
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
    name: "Pay on Delivery (Cash)",
    nameAr: "الدفع نقداً عند الاستلام",
    description: "Pay with cash upon delivery of your order.",
    descriptionAr: "ادفع نقدًا عند استلام طلبك.",
  },
  CARD_ON_DELIVERY: {
    id: "CARD_ON_DELIVERY",
    name: "Card on Delivery",
    nameAr: "الدفع بالبطاقة عند الاستلام",
    description: "Pay by debit or credit card via courier's portable card machine.",
    descriptionAr: "ادفع ببطاقة الصراف أو الائتمان عبر جهاز نقاط البيع المحمول مع المندوب.",
    badge: "Card Machine",
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

/**
 * Temporary Payment Gateway maintenance status.
 * While TRUE: hides online gateway payment options (ONLINE, TABBY_TAMARA, BENEFIT_PAY)
 * and keeps only "Pay on Delivery (Cash)" and "Card on Delivery".
 * Switch back to FALSE once payment gateway configuration is restored.
 */
export const IS_PAYMENT_GATEWAY_TEMPORARILY_DISABLED = true;

export function resolvePaymentMethods(
  countryCode: string = "QA",
  methods?: (string | PaymentMethodInfo)[]
): PaymentMethodInfo[] {
  const upper = (countryCode || DEFAULT_COUNTRY).toUpperCase() as CountryCode;
  const staticConfig = COUNTRIES[upper] || COUNTRIES[DEFAULT_COUNTRY];

  let resolved: PaymentMethodInfo[] = [];

  if (!methods || methods.length === 0) {
    resolved = staticConfig.paymentMethods;
  } else {
    resolved = methods.map((m) => {
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

  // When payment gateway is temporarily disabled, hide online gateways
  // and ensure only Pay on Delivery (Cash) and Card on Delivery are available.
  if (IS_PAYMENT_GATEWAY_TEMPORARILY_DISABLED) {
    const onlineGatewayIds = new Set(["ONLINE", "TABBY_TAMARA", "BENEFIT_PAY"]);
    const deliveryMethods = resolved.filter((m) => !onlineGatewayIds.has(m.id));

    // Ensure COD is present
    if (!deliveryMethods.some((m) => m.id === "COD")) {
      deliveryMethods.unshift(
        staticConfig.paymentMethods.find((m) => m.id === "COD") || MASTER_PAYMENT_METHODS.COD
      );
    }

    // Ensure CARD_ON_DELIVERY is present
    if (!deliveryMethods.some((m) => m.id === "CARD_ON_DELIVERY")) {
      deliveryMethods.push(
        staticConfig.paymentMethods.find((m) => m.id === "CARD_ON_DELIVERY") || MASTER_PAYMENT_METHODS.CARD_ON_DELIVERY
      );
    }

    return deliveryMethods;
  }

  return resolved;
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

