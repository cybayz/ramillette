import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";

export function CustomerReviewsSection() {
  const reviews = [
    {
      name: "Tariq Al-Kuwari",
      location: "Al Wakrah, Qatar",
      rating: 5,
      perfume: "Amber Code (80ml)",
      comment:
        "Amber Code is unmatched. The combination of rich amber and oud has incredible depth. I sprayed it in the morning and could still clearly smell it the next day.",
    },
    {
      name: "Fatima Al-Sulaiti",
      location: "Doha, Qatar",
      rating: 5,
      perfume: "Delina Inspired",
      comment:
        "The delivery took under 2 hours to West Bay. The floral rose notes are exact, and the sillage is intense. Definitely making Ramillette my go-to fragrance house.",
    },
    {
      name: "Mohammed Al-Marri",
      location: "Lusail, Qatar",
      rating: 5,
      perfume: "Bin Shaikh & Sauvage",
      comment:
        "Ordered both Bin Shaikh and Sauvage. Both bottles are exceptional quality. Cash on delivery was seamless and the courier was very polite.",
    },
  ];

  return (
    <section className="py-18 bg-[#ffffff]">
      <div className="ramillette-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e] block mb-1">
            Real Customer Impressions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c]">
            Loved Across Qatar
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Over 2,500+ happy fragrance collectors in Doha and across the GCC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
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
                  <Quote size={20} className="text-[#b6713e]/20" />
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-4">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#ecdec1]/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
                    <span>{r.name}</span>
                    <CheckCircle size={12} className="text-[#0d9d00]" />
                  </h4>
                  <p className="text-[10px] text-neutral-400">{r.location}</p>
                </div>
                <span className="text-[11px] font-semibold text-[#b6713e] bg-[#faedcd] px-2 py-0.5 rounded border border-[#ecdec1]">
                  {r.perfume}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
