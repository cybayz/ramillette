import React from "react";
import Link from "next/link";
import { Crown, Sparkles, Flame, Gem, Tag } from "lucide-react";

export function CategoryShortcuts() {
  const categories = [
    {
      title: "Own Brand",
      subtitle: "Amber Code Flagship",
      href: "/shop/own-brand",
      icon: Crown,
      bg: "from-[#faedcd]/40 to-[#ecdec1]/20",
      accent: "text-[#b6713e]",
    },
    {
      title: "Inspired",
      subtitle: "Designer Masterpieces",
      href: "/shop/inspired",
      icon: Sparkles,
      bg: "from-neutral-100 to-neutral-50",
      accent: "text-[#1c1c1c]",
    },
    {
      title: "Luxury Perfumes",
      subtitle: "Arabian Oud & Amber",
      href: "/shop/luxury-perfumes",
      icon: Gem,
      bg: "from-[#faedcd]/30 to-[#f6f3ed]",
      accent: "text-[#b6713e]",
    },
    {
      title: "Best Sellers",
      subtitle: "Most Loved in Qatar",
      href: "/shop/best-sellers",
      icon: Flame,
      bg: "from-amber-50 to-orange-50/50",
      accent: "text-amber-700",
    },
    {
      title: "New Arrivals",
      subtitle: "Fresh Seasonal Drops",
      href: "/shop/new-arrivals",
      icon: Tag,
      bg: "from-emerald-50 to-teal-50/50",
      accent: "text-emerald-700",
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-[#f0ece1]">
      <div className="ramillette-container">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative flex flex-col items-center text-center p-5 rounded-[6px] border border-[#e5e5e5] hover:border-[#b6713e] hover:shadow-md transition-all duration-300 bg-gradient-to-b hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${cat.accent} border border-[#e5e5e5]`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-bold text-[#1c1c1c] group-hover:text-[#b6713e] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {cat.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
