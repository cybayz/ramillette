import React from "react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 0; // Dynamic search

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q
      ? `Search results for "${q}" | Ramillette Perfumes Qatar`
      : "Search Fragrances | Ramillette",
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const where: any = { active: true };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
    ];
  }

  const [productsRaw, popularRaw] = await Promise.all([
    query
      ? prisma.product.findMany({
          where,
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: { where: { active: true }, orderBy: { price: "asc" } },
            reviews: { where: { approved: true } },
            category: true,
          },
          take: 40,
        })
      : Promise.resolve([]),
    prisma.product.findMany({
      where: { active: true, bestseller: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true }, orderBy: { price: "asc" } },
        reviews: { where: { approved: true } },
        category: true,
      },
      take: 4,
    }),
  ]);

  const formatCard = (p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    categoryName: p.category?.name,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    bestseller: p.bestseller,
    newArrival: p.newArrival,
    images: p.images.map((img: any) => ({ url: img.url, alt: img.alt })),
    variants: p.variants.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
    })),
    rating:
      p.reviews.length > 0
        ? Math.round(
            (p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              p.reviews.length) *
              10
          ) / 10
        : 5,
    reviewsCount: p.reviews.length ?? 12,
  });

  const products = productsRaw.map(formatCard);
  const popularProducts = popularRaw.map(formatCard);

  return (
    <div className="bg-[#ffffff] min-h-screen py-10">
      <div className="ramillette-container">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            Fragrance Search
          </span>
          <h1 className="text-3xl font-extrabold text-[#1c1c1c] mt-1 mb-4">
            {query ? `Results for "${query}"` : "Search Ramillette Perfumes"}
          </h1>

          {/* Search Input Box */}
          <form action="/search" method="GET" className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-4 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by perfume name, notes, or collection..."
              className="w-full bg-[#fbf9f5] border border-[#e5e5e5] rounded-[6px] pl-11 pr-24 py-3 text-sm focus:outline-none focus:border-[#b6713e]"
            />
            <button
              type="submit"
              className="absolute right-1.5 btn-primary h-9 px-4 text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {query && (
            <p className="text-xs text-neutral-500 mt-3">
              Found <strong>{products.length}</strong> matching fragrance{products.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Search Results */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-16 bg-[#fbf9f5] rounded-[8px] border border-[#e5e5e5] max-w-2xl mx-auto p-8">
            <h3 className="text-lg font-bold text-[#1c1c1c] mb-2">
              No matching fragrances found
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              We couldn't find any fragrances matching "<strong>{query}</strong>". Try searching for popular scents like "Amber Code", "Sauvage", or "Oud".
            </p>
            <Link href="/shop" className="btn-primary h-10 px-6 text-xs inline-flex items-center">
              Explore All Fragrances
            </Link>
          </div>
        ) : null}

        {/* Popular Fragrances Recommendations */}
        {products.length === 0 && (
          <div className="mt-16 pt-12 border-t border-[#e5e5e5]">
            <h3 className="text-xl font-bold text-[#1c1c1c] mb-6 text-center">
              Popular Fragrances You Might Love
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {popularProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
