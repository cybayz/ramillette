import { MetadataRoute } from "next";
import prisma from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ramillette.com";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/shop/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/shop/best-sellers",
    "/shop/new-arrivals",
    "/pages/about-us",
    "/pages/contact",
    "/pages/faqs",
    "/pages/help",
    "/pages/cancellation-policy",
    "/pages/returns-policy",
    "/pages/refund-policy",
    "/pages/exchange-policy",
    "/pages/term-and-services",
    "/pages/privacy-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...staticPages, ...categoryEntries, ...productEntries];
}
