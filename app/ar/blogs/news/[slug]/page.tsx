import React from "react";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog/blogData";
import { BlogPostView } from "@/components/blog/BlogPostView";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "المقال غير موجود | عطور راميلليت",
    };
  }

  return {
    title: `${post.titleAr} | عطور راميلليت قطر`,
    description: post.excerptAr,
  };
}

export default async function ArabicSingleBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);
  const recentPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <BlogPostView
      post={post}
      relatedPosts={relatedPosts}
      recentPosts={recentPosts}
      isArabic={true}
    />
  );
}
