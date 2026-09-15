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
      title: "Article Not Found | Ramillette Perfumes",
    };
  }

  return {
    title: `${post.title} | Ramillette Perfumes Qatar`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  };
}

export default async function SingleBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Related posts (exclude current)
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);
  const recentPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <BlogPostView
      post={post}
      relatedPosts={relatedPosts}
      recentPosts={recentPosts}
      isArabic={false}
    />
  );
}
