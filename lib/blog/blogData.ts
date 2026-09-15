export interface BlogPost {
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  contentHtml: string;
  contentHtmlAr: string;
  category: string;
  categoryAr: string;
  author: string;
  authorAr: string;
  date: string;
  dateAr: string;
  dateIso: string;
  image: string;
  tags: string[];
  tagsAr: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "inside-ramillette",
    title: "Inside Ramillette: Where Fragrance Becomes Identity",
    titleAr: "داخل راميلليت: حيث يصبح العطر هوية",
    excerpt:
      "Since 2010, Ramillette has grown into one of Qatar's leading perfume houses — online and across the country.",
    excerptAr:
      "منذ عام 2010، نمت راميلليت لتصبح واحدة من أبرز دور العطور في قطر — عبر الإنترنت وفي جميع أنحاء البلاد.",
    contentHtml: `
      <p class="mb-5 leading-relaxed text-neutral-700">Established in 2010, Ramillette has become a destination for fragrance lovers in Qatar. With stores in Doha, Al Rayyan, Al Wakrah, and Al Khor — and delivery across the country — we bring curated scents to your doorstep and your everyday rituals.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">Our promise</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">Every fragrance is inspected before dispatch. Clear policies for cancellations, returns, and exchanges protect your experience. Thank you for choosing Ramillette — where fragrance becomes identity.</p>
      <p class="mb-5 leading-relaxed text-neutral-700">From our marquee boutique at Souq Al Wakra to homes across Doha, our artisanal creations merge traditional Middle Eastern aromatic heritage with the precision of contemporary European perfumery.</p>
    `,
    contentHtmlAr: `
      <p class="mb-5 leading-relaxed text-neutral-700">تأسست راميلليت في عام 2010، وأصبحت وجهة لعشاق العطور في قطر. مع متاجر في الدوحة والريان والوكرة والخور — وخدمة التوصيل السريع لجميع أنحاء البلاد — نقدم عطوراً منتقاة بعناية حتى عتبة داركم.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">وعدنا لكم</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">يتم فحص كل عطر بدقة فائقة قبل إرساله. سياساتنا الواضحة للإلغاء والإرجاع والاستبدال تحمي تجربتكم دوماً. شكراً لاختياركم راميلليت — حيث يصبح العطر هوية.</p>
    `,
    category: "News",
    categoryAr: "أخبار",
    author: "Ramillette",
    authorAr: "راميلليت",
    date: "JUL 18, 2026",
    dateAr: "18 يوليو 2026",
    dateIso: "2026-07-18",
    image:
      "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/ombre_leather.png?v=1788027277",
    tags: [
      "Brand",
      "Culture",
      "Education",
      "Fragrance",
      "Guides",
      "Lifestyle",
      "Oud",
      "Qatar",
      "Story",
      "Tips",
    ],
    tagsAr: [
      "العلامة التجارية",
      "ثقافة",
      "تعليم",
      "عطور",
      "دليل",
      "أسلوب حياة",
      "عود",
      "قطر",
      "قصة",
      "نصائح",
    ],
  },
  {
    slug: "fragrance-wardrobe-every-season-qatar",
    title: "A Fragrance Wardrobe for Every Season in Qatar",
    titleAr: "خزانة عطور تناسب جميع فصول السنة في قطر",
    excerpt:
      "Fresh opens for warmer days, richer trails for cooler evenings — building a smart, versatile collection.",
    excerptAr:
      "نفحات منعشة للأيام الدافئة، وأثر عطري غني للأمسيات اللطيفة — بناء مجموعة عطور ذكية ومتنوعة.",
    contentHtml: `
      <p class="mb-5 leading-relaxed text-neutral-700">Selecting fragrances that adapt gracefully to Qatar's unique climate transitions requires understanding temperature, skin projection, and aromatic composition. During sun-drenched coastal days, bright bergamot, neroli, and crisp marine accords keep you refreshed without overwhelming the senses.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">Transitioning to Evening Opulence</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">As twilight settles across the Doha Corniche and temperatures mellow, deep amber accords, saffron, and velvety damascena rose create an enchanting sillage perfect for dining, gatherings, and formal occasions.</p>
    `,
    contentHtmlAr: `
      <p class="mb-5 leading-relaxed text-neutral-700">يتطلب اختيار العطور التي تتكيف بشكل جميل مع مناخ قطر فهم درجات الحرارة ونسبة التركيز على البشرة. خلال ساعات النهار المشرقة، تمنحك نفحات البرغموت وزهر البرتقال انتعاشاً يدوم طوال اليوم.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">الانتقال إلى سحر المساء</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">ومع حلول المساء، تبرز نفحات العنبر الدافئ والزعفران والورد الجوري لتخلق هالة ساحرة تناسب الجلسات والمناسبات الراقية.</p>
    `,
    category: "News",
    categoryAr: "أخبار",
    author: "Ramillette",
    authorAr: "راميلليت",
    date: "JUL 16, 2026",
    dateAr: "16 يوليو 2026",
    dateIso: "2026-07-16",
    image:
      "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/imperial_valley.png?v=1788027235",
    tags: ["Fragrance", "Guides", "Lifestyle", "Qatar", "Tips"],
    tagsAr: ["عطور", "دليل", "أسلوب حياة", "قطر", "نصائح"],
  },
  {
    slug: "how-to-make-your-perfume-last-longer",
    title: "How to Make Your Perfume Last Longer",
    titleAr: "كيف تجعل عطرك يدوم لفترة أطول",
    excerpt:
      "Practical tips so your favorite bottle stays with you from morning meetings to evening plans.",
    excerptAr:
      "نصائح عملية ليبقى عطرك المفضل يرافقك بثبات من الاجتماعات الصباحية حتى أمسيات المساء.",
    contentHtml: `
      <p class="mb-5 leading-relaxed text-neutral-700">Longevity is one of the most desired traits in luxury perfumery. Because Qatar's air-conditioned environments can dry out the skin, moisture is your fragrance's best ally. Applying an unscented moisturizer or body oil before spraying helps anchor the aromatic molecules.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">Key Pulse Points</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">Apply to warm pulse points — sides of the neck, collarbones, and wrists. Crucially, resist rubbing your wrists together, which crushes delicate top notes and causes early dissipation.</p>
    `,
    contentHtmlAr: `
      <p class="mb-5 leading-relaxed text-neutral-700">ثبات العطر هو أحد أهم مميزات العطور الفاخرة. ترطيب البشرة قبل وضع العطر يعتبر الخطوة الذهبية لتثبيت الجزيئات العطرية لأطول فترة ممكنة.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">أماكن النبض الأساسية</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">رش العطر على أماكن النبض الدافئة مثل الرقبة ومعصم اليد، وتجنب فرك المعصمين للحفاظ على التركيبة العطرية الأصلية.</p>
    `,
    category: "News",
    categoryAr: "أخبار",
    author: "Ramillette",
    authorAr: "راميلليت",
    date: "JUL 14, 2026",
    dateAr: "14 يوليو 2026",
    dateIso: "2026-07-14",
    image:
      "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/ChatGPT_Image_Aug_18_2026_04_09_56_PM.png?v=1788027159",
    tags: ["Education", "Guides", "Tips", "Fragrance"],
    tagsAr: ["تعليم", "دليل", "نصائح", "عطور"],
  },
  {
    slug: "oud-in-modern-perfumery",
    title: "Oud in Modern Perfumery",
    titleAr: "العود في صناعة العطور الحديثة",
    excerpt:
      "From traditional attars to contemporary extrait — how oud became a global sensation.",
    excerptAr:
      "من الأدهان التقليدية إلى مستخلصات العطور المعاصرة — كيف تحول العود إلى شغف عالمي.",
    contentHtml: `
      <p class="mb-5 leading-relaxed text-neutral-700">Revered as 'black gold' in Arabian culture, Dehn Al Oud holds centuries of heritage across the Gulf. In contemporary luxury perfumery, skilled noses have innovated by pairing smoky, balsamic agarwood with crisp Italian citrus, powdery iris, and Madagascar vanilla.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">The Ramillette Philosophy</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">We source ethical, wild-harvested oud extracts to ensure depth, rich warmth, and a sillage that commands respect in every room you enter.</p>
    `,
    contentHtmlAr: `
      <p class="mb-5 leading-relaxed text-neutral-700">يعد دهن العود أحد أعرق الكنوز العطرية في الثقافة العربية. في العطور المعاصرة، يمتزج العود بنعومة مع نفحات الفانيليا والورود والبرغموت ليقدم تجربة شرقية معاصرة لا تُنسى.</p>
    `,
    category: "News",
    categoryAr: "أخبار",
    author: "Ramillette",
    authorAr: "راميلليت",
    date: "JUL 12, 2026",
    dateAr: "12 يوليو 2026",
    dateIso: "2026-07-12",
    image:
      "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/marj.png?v=1788027261",
    tags: ["Culture", "Oud", "Education", "Fragrance"],
    tagsAr: ["ثقافة", "عود", "تعليم", "عطور"],
  },
  {
    slug: "understanding-fragrance-notes-top-heart-base",
    title: "Understanding Fragrance Notes: Top, Heart & Base",
    titleAr: "فهم الهرم العطري: المقدمة، القلب، والقاعدة",
    excerpt:
      "How scent pyramids evolve on your skin over hours, from the initial burst to the dry down.",
    excerptAr:
      "كيف يتطور الهرم العطري على بشرتك عبر الساعات، من الرشة الأولى وحتى الاستقرار.",
    contentHtml: `
      <p class="mb-5 leading-relaxed text-neutral-700">A perfume is not a single static aroma — it is an evolving multi-layered story. The initial burst represents the Top Notes (citrus, aldehydes, aromatics) lasting 15-30 minutes.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">Heart and Base Harmony</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">As the heart unfolds, florals and warm spices reveal the core character for 4-6 hours. Finally, heavy base molecules (amber, cedarwood, musk, oud) anchor the composition to your clothes and skin for over 24 hours.</p>
    `,
    contentHtmlAr: `
      <p class="mb-5 leading-relaxed text-neutral-700">العطر قصة متعددة الفصول؛ تبدأ بالمقدمة المنعشة التي تمهد الطريق لقلب العطر الدافئ، وتستقر أخيراً على قاعدة غنية من الأخشاب والمسك والعنبر تمنحك ثباتاً لا يضاهى.</p>
    `,
    category: "News",
    categoryAr: "أخبار",
    author: "Ramillette",
    authorAr: "راميلليت",
    date: "JUL 10, 2026",
    dateAr: "10 يوليو 2026",
    dateIso: "2026-07-10",
    image:
      "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/musk_rijali.png?v=1788027272",
    tags: ["Education", "Fragrance", "Guides"],
    tagsAr: ["تعليم", "عطور", "دليل"],
  },
  {
    slug: "how-to-choose-your-signature-scent",
    title: "How to Choose Your Signature Scent",
    titleAr: "كيف تختار عطرك المميز والشخصي",
    excerpt:
      "Finding a scent that reflects your personality and leaves an unforgettable impression.",
    excerptAr:
      "العثور على عطر يعكس شخصيتك ويترك انطباعاً لا يُنسى أينما حللت.",
    contentHtml: `
      <p class="mb-5 leading-relaxed text-neutral-700">Your signature fragrance is your invisible trademark — an extension of your persona before you speak and long after you depart. Avoid testing too many scents at once; allow your nose to reset and observe how the scent performs on your skin throughout the day.</p>
      <h3 class="text-xl font-bold text-neutral-900 mt-8 mb-3">Matching Personality with Scent Families</h3>
      <p class="mb-5 leading-relaxed text-neutral-700">Whether you are drawn to clean woody minimalism for professional poise or bold oriental ambers for commanding charisma, Ramillette curates formulations tailored for every taste.</p>
    `,
    contentHtmlAr: `
      <p class="mb-5 leading-relaxed text-neutral-700">عطرك الخاص هو بصمتك غير المرئية التي تعبر عن حضورك. اختر العائلة العطرية التي تلائم أسلوب حياتك واشعر بالثقة في كل لحظة.</p>
    `,
    category: "News",
    categoryAr: "أخبار",
    author: "Ramillette",
    authorAr: "راميلليت",
    date: "JUL 06, 2026",
    dateAr: "06 يوليو 2026",
    dateIso: "2026-07-06",
    image:
      "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/tuscan_leather.png?v=1788027340",
    tags: ["Guides", "Lifestyle", "Tips", "Brand"],
    tagsAr: ["دليل", "أسلوب حياة", "نصائح", "العلامة التجارية"],
  },
];

export const ALL_TAGS = [
  "Brand",
  "Culture",
  "Education",
  "Fragrance",
  "Guides",
  "Lifestyle",
  "Oud",
  "Qatar",
  "Story",
  "Tips",
];
