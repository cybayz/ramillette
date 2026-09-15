"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost, BLOG_POSTS, ALL_TAGS } from "@/lib/blog/blogData";
import {
  Folder,
  Search,
  Share2,
  Printer,
  Calendar,
  User,
  ArrowRight,
  Check,
} from "lucide-react";

interface BlogPostViewProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  recentPosts: BlogPost[];
  isArabic?: boolean;
}

export function BlogPostView({
  post,
  relatedPosts,
  recentPosts,
  isArabic = false,
}: BlogPostViewProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: post.title,
            text: post.excerpt,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      } catch {
        // Fallback clipboard
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Filter recent posts by search query if typed
  const displayedRecentPosts = searchQuery.trim()
    ? BLOG_POSTS.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentPosts;

  const title = isArabic ? post.titleAr : post.title;
  const excerpt = isArabic ? post.excerptAr : post.excerpt;
  const content = isArabic ? post.contentHtmlAr : post.contentHtml;
  const date = isArabic ? post.dateAr : post.date;
  const author = isArabic ? post.authorAr : post.author;
  const category = isArabic ? post.categoryAr : post.category;
  const tags = isArabic ? post.tagsAr : post.tags;

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header Banner: Uppercase Title + Breadcrumb matching Screenshot 2 */}
      <div className="w-full bg-[#faf9f6] border-b border-neutral-200/60 py-10 sm:py-14 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-neutral-900">
            {title}
          </h1>

          <nav
            aria-label="Breadcrumb"
            className="text-xs uppercase tracking-wider text-neutral-500 mt-3 flex items-center justify-center gap-2 flex-wrap"
          >
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              {isArabic ? "الرئيسية" : "HOME"}
            </Link>
            <span>•</span>
            <Link
              href="/blogs/news"
              className="hover:text-neutral-900 transition-colors"
            >
              {isArabic ? "الأخبار" : "NEWS"}
            </Link>
            <span>•</span>
            <span className="text-neutral-800 font-semibold">{title}</span>
          </nav>
        </div>
      </div>

      {/* 2. Main 2-Column Grid Layout */}
      <div className="ramillette-container px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Sidebar (Width ~ 4 cols) matching Screenshot 2 */}
          <aside className="lg:col-span-4 space-y-6 select-none">
            {/* Box 1: CATEGORIES */}
            <div className="bg-[#fcf7ec] border border-[#e8dcb8] rounded-xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 text-neutral-900 font-extrabold text-xs uppercase tracking-wider">
                <Folder size={16} className="text-[#8c4c1d]" />
                <span>{isArabic ? "الفئات" : "CATEGORIES"}</span>
              </div>
              <Link
                href="/blogs/news"
                className="text-xs font-bold text-[#8c4c1d] hover:underline"
              >
                {category} ({BLOG_POSTS.length})
              </Link>
            </div>

            {/* Box 2: SEARCH */}
            <div className="relative rounded-xl border border-neutral-200/80 bg-[#fafafa] p-1 shadow-2xs flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "بحث في الأخبار..." : "Search ..."}
                className="w-full bg-transparent px-3 py-2 text-xs text-neutral-900 focus:outline-none placeholder:text-neutral-400"
              />
              <div className="p-2 text-neutral-400">
                <Search size={15} />
              </div>
            </div>

            {/* Box 3: RECENT POST */}
            <div className="rounded-xl border border-neutral-200/80 p-5 bg-white shadow-2xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-100">
                {isArabic ? "أحدث المقالات" : "RECENT POST"}
              </h3>
              <div className="mt-4 space-y-4">
                {displayedRecentPosts.slice(0, 3).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blogs/news/${item.slug}`}
                    className="flex items-center gap-3.5 group text-start"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#b6713e] uppercase tracking-wider block">
                        {isArabic ? item.dateAr : item.date}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#4e6648] transition-colors line-clamp-2 mt-0.5 leading-snug">
                        {isArabic ? item.titleAr : item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Box 4: BLOG TAGS */}
            <div className="rounded-xl border border-neutral-200/80 p-5 bg-white shadow-2xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-100">
                {isArabic ? "الوسوم" : "BLOG TAGS"}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-neutral-200 text-[11px] font-medium text-neutral-700 rounded-md px-2.5 py-1 bg-white hover:border-[#4e6648] hover:text-[#4e6648] transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Box 5: BLOG BANNER */}
            <div className="rounded-xl border border-neutral-200/80 p-5 bg-gradient-to-br from-[#fbf8f2] to-[#f4eee0] shadow-2xs text-start">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-200/70">
                {isArabic ? "إعلان" : "BLOG BANNER"}
              </h3>
              <div className="mt-4 p-4 rounded-lg bg-white/90 border border-[#e8dec7] text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#b6713e] block mb-1">
                  RAMILLETTE EXPRESS
                </span>
                <p className="text-xs font-bold text-neutral-900 leading-snug">
                  {isArabic
                    ? "توصيل سريع خلال ساعتين في الدوحة للطلبات فوق 900 ريال"
                    : "Free 2-Hour Express Delivery across Doha on orders over QAR 900"}
                </p>
                <Link
                  href="/collections/all"
                  className="mt-3 inline-block px-4 py-1.5 bg-[#233324] hover:bg-[#1a281b] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  {isArabic ? "تسوق الآن" : "Shop Fragrances"}
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Main Column (Width ~ 8 cols) matching Screenshot 2 & 3 */}
          <main className="lg:col-span-8 space-y-6">
            {/* Featured Article Image */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#f7f5f0] border border-neutral-100 shadow-xs">
              <Image
                src={post.image}
                alt={title}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            {/* Image Caption matching screenshot */}
            <p className="text-[11px] text-neutral-400 text-center tracking-wide italic">
              {title}
            </p>

            {/* Article Content Body */}
            <article className="pt-2 text-start">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-4 tracking-tight">
                {title}
              </h2>

              <div
                dangerouslySetInnerHTML={{ __html: content }}
                className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed text-sm sm:text-base"
              />

              {/* Meta Bar with Share & Print matching Screenshot 3 */}
              <div className="mt-8 pt-4 pb-4 border-y border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-neutral-400" />
                    <span>{date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 uppercase font-semibold text-neutral-700">
                    <User size={13} className="text-neutral-400" />
                    <span>{author}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-[#4e6648] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check size={13} className="text-green-600" />
                    ) : (
                      <Share2 size={13} />
                    )}
                    <span>{copied ? "COPIED" : "SHARE"}</span>
                  </button>

                  <span>|</span>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-[#4e6648] transition-colors cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>PRINT</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Related News Section matching Screenshot 3 */}
            {relatedPosts.length > 0 && (
              <section className="pt-8 text-start">
                <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-6">
                  {isArabic ? "أخبار ذات صلة" : "Related News"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedPosts.map((rel) => (
                    <div
                      key={rel.slug}
                      className="bg-white rounded-xl overflow-hidden border border-neutral-200/80 shadow-2xs group flex flex-col"
                    >
                      <Link
                        href={`/blogs/news/${rel.slug}`}
                        className="relative aspect-[16/10] w-full overflow-hidden bg-[#f7f5f0]"
                      >
                        <Image
                          src={rel.image}
                          alt={rel.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#b6713e] uppercase tracking-wider block mb-1">
                            {isArabic ? rel.dateAr : rel.date}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#4e6648] transition-colors line-clamp-2">
                            <Link href={`/blogs/news/${rel.slug}`}>
                              {isArabic ? rel.titleAr : rel.title}
                            </Link>
                          </h4>
                          <p className="text-xs text-neutral-600 line-clamp-2 mt-1.5 leading-relaxed">
                            {isArabic ? rel.excerptAr : rel.excerpt}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-neutral-100">
                          <Link
                            href={`/blogs/news/${rel.slug}`}
                            className="text-xs font-bold text-neutral-900 group-hover:text-[#4e6648] inline-flex items-center gap-1"
                          >
                            <span>Read more</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
