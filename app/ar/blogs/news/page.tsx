import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog/blogData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأخبار والمقالات | عطور راميلليت قطر",
  description: "قصص وعوالم العطور ونفحاتها الحصرية وأحدث الأخبار من دار راميلليت للعطور في الدوحة.",
};

export default function ArabicBlogListingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header Hero Banner matching reference screenshot */}
      <div className="w-full bg-[#f6f4ee] border-b border-neutral-200/60 py-10 sm:py-14">
        <div className="ramillette-container px-4 sm:px-6 lg:px-8 text-start">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-neutral-500 mb-4 flex items-center gap-2"
          >
            <Link href="/ar" className="hover:text-neutral-900 transition-colors">
              الرئيسية
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-900 font-semibold">الأخبار</span>
          </nav>

          {/* Eyebrow */}
          <span className="text-xs font-bold uppercase tracking-widest text-[#8c4c1d] block mb-1">
            المجلة
          </span>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-neutral-900 tracking-tight">
            الأخبار والمقالات
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-xl leading-relaxed">
            قصص عطرية، نفحات مميزة، وأحدث أخبار دار راميلليت للعطور.
          </p>
        </div>
      </div>

      {/* 2. Blog Posts Grid: 3 columns */}
      <div className="ramillette-container px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl overflow-hidden border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all duration-300 group flex flex-col"
            >
              {/* Image Container */}
              <Link
                href={`/ar/blogs/news/${post.slug}`}
                className="block relative aspect-[4/3] w-full overflow-hidden bg-[#f7f5f0]"
              >
                <Image
                  src={post.image}
                  alt={post.titleAr}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </Link>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 text-start justify-between">
                <div>
                  <time
                    dateTime={post.dateIso}
                    className="text-[11px] font-bold text-[#b6713e] uppercase tracking-wider block mb-1.5"
                  >
                    {post.dateAr}
                  </time>

                  <h2 className="text-[16px] sm:text-[17px] font-bold text-neutral-900 group-hover:text-[#4e6648] transition-colors line-clamp-2 leading-snug">
                    <Link href={`/ar/blogs/news/${post.slug}`}>
                      {post.titleAr}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed mt-2.5 line-clamp-3">
                    {post.excerptAr}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100">
                  <Link
                    href={`/ar/blogs/news/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-[#4e6648] transition-colors"
                  >
                    <span>اقرأ المزيد</span>
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
