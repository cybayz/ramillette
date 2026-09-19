"use client";

import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";
import { useCountryStore } from "@/lib/store/useCountryStore";
import { useLanguageStore } from "@/lib/store/useLanguageStore";

interface ReviewItem {
  name: string;
  nameAr?: string;
  location: string;
  locationAr?: string;
  rating: number;
  perfume: string;
  comment: string;
  commentAr?: string;
}

const REVIEWS_BY_COUNTRY: Record<string, {
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  items: ReviewItem[];
}> = {
  QA: {
    title: "Loved Across Qatar",
    titleAr: "محبوب في جميع أنحاء قطر",
    subtitle: "Over 2,500+ happy fragrance collectors in Doha, Lusail, and across Qatar.",
    subtitleAr: "أكثر من 2,500 من عشاق العطور الراقية في الدوحة ولوسيل وجميع أنحاء قطر.",
    items: [
      {
        name: "Tariq Al-Kuwari",
        nameAr: "طارق الكواري",
        location: "Al Wakrah, Qatar",
        locationAr: "الوكرة، قطر",
        rating: 5,
        perfume: "Amber Code (80ml)",
        comment:
          "Amber Code is unmatched. The combination of rich amber and oud has incredible depth. I sprayed it in the morning and could still clearly smell it the next day.",
        commentAr:
          "عنبر كود لا يُعلى عليه. مزيج العنبر الغني والعود يعطي عمقًا مذهلاً. رششة في الصباح وظل فوحانه واضحًا لليوم التالي.",
      },
      {
        name: "Fatima Al-Sulaiti",
        nameAr: "فاطمة السليطي",
        location: "Doha, Qatar",
        locationAr: "الدوحة، قطر",
        rating: 5,
        perfume: "Delina Inspired",
        comment:
          "The delivery took under 2 hours to West Bay. The floral rose notes are exact, and the sillage is intense. Definitely making Ramillette my go-to fragrance house.",
        commentAr:
          "وصل الطلب في أقل من ساعتين لمنطقة الخليج الغربي. نوتات الورد الزهرية متطابقة وثباتها قوي جداً. أصبحت داري المفضلة.",
      },
      {
        name: "Mohammed Al-Marri",
        nameAr: "محمد المري",
        location: "Lusail, Qatar",
        locationAr: "لوسيل، قطر",
        rating: 5,
        perfume: "Bin Shaikh & Sauvage",
        comment:
          "Ordered both Bin Shaikh and Sauvage. Both bottles are exceptional quality. Cash on delivery was seamless and the courier was very polite.",
        commentAr:
          "طلبت بن شيخ وسوفاج، الزجاجتان بجودة استثنائية وثبات عالٍ جداً. الدفع عند الاستلام كان سلساً والمندوب في غاية اللباقة.",
      },
    ],
  },
  AE: {
    title: "Loved Across the UAE",
    titleAr: "محبوب في جميع أنحاء الإمارات",
    subtitle: "Treasured by luxury fragrance connoisseurs in Dubai, Abu Dhabi, and the Emirates.",
    subtitleAr: "يحظى بتقدير عشاق العطور الفاخرة في دبي وأبوظبي وجميع الإمارات.",
    items: [
      {
        name: "Zayed Al-Mansoor",
        nameAr: "زايد المنصور",
        location: "Dubai, UAE",
        locationAr: "دبي، الإمارات",
        rating: 5,
        perfume: "Amber Code (80ml)",
        comment:
          "Amber Code has astonishing projection even in the Dubai heat. Sprayed it before meetings at DIFC and received multiple compliments throughout the day.",
        commentAr:
          "عنبر كود يتمتع بفوحان مذهل حتى في أجواء دبي. رششة قبل اجتماعاتي في مركز دبي المالي وتلقيت إطراءات متعددة طوال اليوم.",
      },
      {
        name: "Mariam Al-Qasimi",
        nameAr: "مريم القاسمي",
        location: "Abu Dhabi, UAE",
        locationAr: "أبوظبي، الإمارات",
        rating: 5,
        perfume: "Delina Inspired",
        comment:
          "Next-day express delivery straight to Saadiyat Island. The velvety Turkish rose, lychee, and vanilla drydown is sheer perfection.",
        commentAr:
          "توصيل سريع في اليوم التالي مباشرة إلى جزيرة السعديات. مزيج الورد التركي والليتشي والفانيليا في منتهى النقاء والرقي.",
      },
      {
        name: "Sultan Al-Nuaimi",
        nameAr: "سلطان النعيمي",
        location: "Sharjah, UAE",
        locationAr: "الشارقة، الإمارات",
        rating: 5,
        perfume: "Bin Shaikh & Sauvage",
        comment:
          "Exceptional concentration of fragrance oils. Split the purchase with Tabby at 0% interest and received the package in pristine condition.",
        commentAr:
          "تركيز زيوت عطرية عالي جداً واستثنائي. تم الدفع عبر تابي بكل سهولة والتغليف وصل بحالة ممتازة وفخمة.",
      },
    ],
  },
  BH: {
    title: "Loved Across Bahrain",
    titleAr: "محبوب في جميع أنحاء البحرين",
    subtitle: "Treasured by fragrance lovers in Manama, Riffa, and across the Kingdom.",
    subtitleAr: "مفضل لدى عشاق العطور في المنامة والرفاع وجميع أنحاء المملكة.",
    items: [
      {
        name: "Hamad Al-Khalifa",
        nameAr: "حمد آل خليفة",
        location: "Manama, Bahrain",
        locationAr: "المنامة، البحرين",
        rating: 5,
        perfume: "Amber Code (80ml)",
        comment:
          "Unbelievable sillage and warm royal amber. Delivery was on time in Seef District. Easily ranks among the best GCC perfume creations.",
        commentAr:
          "فوحان خيالي وعنبر ملكي دافئ لا مثيل له. وصل التوصيل في الوقت المحدد في ضاحية السيف. من أرقى عطور الخليج بلا شك.",
      },
      {
        name: "Noor Al-Zayani",
        nameAr: "نور الزياني",
        location: "Riffa, Bahrain",
        locationAr: "الرفاع، البحرين",
        rating: 5,
        perfume: "Delina Inspired",
        comment:
          "BenefitPay instant checkout made ordering seamless. The floral notes linger for over 14 hours. A stunning addition to my collection.",
        commentAr:
          "الدفع الفوري عبر بنفت باي كان سريعاً ومريحاً للغاية. النوتات الزهرية تثبت لأكثر من 14 ساعة. إضافة مذهلة لمجموعتي العطرية.",
      },
      {
        name: "Isa Al-Doseri",
        nameAr: "عيسى الدوسري",
        location: "Muharraq, Bahrain",
        locationAr: "المحرق، البحرين",
        rating: 5,
        perfume: "Bin Shaikh & Sauvage",
        comment:
          "Cash on delivery across Muharraq was fast and hassle-free. The French-Arabian fusion in Bin Shaikh is world-class quality.",
        commentAr:
          "الدفع عند الاستلام في المحرق كان سريعاً وسلساً. المزيج الفرنسي والشرقي في بن شيخ بجودة عالمية تستحق الاقتناء.",
      },
    ],
  },
};

export function CustomerReviewsSection() {
  const { country } = useCountryStore();
  const { language } = useLanguageStore();
  const isAr = language === "ar";

  const data = REVIEWS_BY_COUNTRY[country] || REVIEWS_BY_COUNTRY.QA;

  return (
    <section className="py-18 bg-[#ffffff]">
      <div className="ramillette-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e] block mb-1">
            {isAr ? "انطباعات العملاء الحقيقية" : "Real Customer Impressions"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c]">
            {isAr ? data.titleAr : data.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            {isAr ? data.subtitleAr : data.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((r) => (
            <div
              key={r.name}
              className="bg-[#fbf9f5] border border-[#e5e5e5] rounded-[8px] p-6 flex flex-col justify-between hover:border-[#b6713e] hover:shadow-md transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-[#fbcd0a]">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className="fill-[#fbcd0a] text-[#fbcd0a]"
                      />
                    ))}
                  </div>
                  <Quote size={20} className="text-[#b6713e]/40 stroke-[1.5]" />
                </div>

                <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed italic mb-4">
                  "{isAr && r.commentAr ? r.commentAr : r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#eee] flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1c1c1c]">
                    {isAr && r.nameAr ? r.nameAr : r.name}
                  </h4>
                  <span className="text-[11px] text-neutral-400 block">
                    {isAr && r.locationAr ? r.locationAr : r.location}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#4e6648]">
                  <CheckCircle size={13} />
                  <span>{isAr ? "مشتري موثق" : "Verified"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
