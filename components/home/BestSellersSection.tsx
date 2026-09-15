import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { ProductCard, CardProduct } from "@/components/product/ProductCard";

interface BestSellersSectionProps {
  products: CardProduct[];
}

export function BestSellersSection({ products }: BestSellersSectionProps) {
  return (
    <section className="py-16 bg-[#ffffff]">
      <div className="ramillette-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#e5e5e5]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b6713e] mb-1">
              <Flame size={15} />
              <span>Trending in Doha</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c]">
              Best Sellers
            </h2>
          </div>

          <Link
            href="/shop/best-sellers"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1c1c1c] hover:text-[#b6713e] transition-colors mt-2 sm:mt-0"
          >
            <span>View all Best Sellers</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
