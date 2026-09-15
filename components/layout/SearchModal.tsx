"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(query.trim())}&limit=6`
        );
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-2xl overflow-hidden z-10 border border-[#e5e5e5] animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center px-4 py-3.5 border-b border-[#e5e5e5] bg-[#fbf9f5]"
        >
          <Search size={20} className="text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search perfumes, brands, notes (e.g. Amber Code, Sauvage, Oud)..."
            className="flex-1 bg-transparent text-sm md:text-base text-[#1c1c1c] placeholder:text-neutral-400 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-[#b6713e] mr-2" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-[#1c1c1c] mr-2"
            >
              <X size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-[#1c1c1c] rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </form>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === "" ? (
            <div className="py-6 text-center">
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
                Trending Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Amber Code",
                  "Sauvage",
                  "Delina",
                  "Bin Shaikh",
                  "Baccarat Rouge 540",
                  "Oudh",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 text-xs rounded-full bg-neutral-100 hover:bg-[#faedcd] text-neutral-700 hover:text-[#1c1c1c] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-[#f0ece1]">
              <div className="pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Products ({results.length})
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3 px-2 rounded-md hover:bg-[#fbf9f5] transition-colors group"
                >
                  <div className="relative w-14 h-14 bg-[#fbf9f5] rounded-[4px] overflow-hidden shrink-0 border border-[#e5e5e5]">
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform"
                        sizes="56px"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">
                      {product.brand || "Ramillette"}
                    </p>
                    <p className="text-sm font-semibold text-[#1c1c1c] group-hover:text-[#b6713e] transition-colors truncate">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-[#1c1c1c] mt-0.5">
                      {formatPrice(product.basePrice)}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-neutral-300 group-hover:text-[#b6713e] group-hover:translate-x-1 transition-all"
                  />
                </Link>
              ))}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full btn-secondary h-10 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>See all results for "{query}"</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="py-8 text-center text-neutral-500 text-sm">
              No fragrances found matching "<strong>{query}</strong>". Try searching for "Oud", "Amber", or another scent.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
