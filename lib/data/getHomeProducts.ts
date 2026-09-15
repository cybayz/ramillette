import prisma from "@/lib/db/prisma";

export async function getHomeProducts() {
  const [allProductsRaw, bestSellersRaw, ownBrandRaw, inspiredRaw, luxuryRaw, newArrivalsRaw] =
    await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
      }),
      prisma.product.findMany({
        where: { active: true, bestseller: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 12,
      }),
      prisma.product.findMany({
        where: { active: true, category: { slug: "own-brand" } },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 10,
      }),
      prisma.product.findMany({
        where: { active: true, category: { slug: "inspired" } },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 12,
      }),
      prisma.product.findMany({
        where: { active: true, category: { slug: "luxury-perfumes" } },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 12,
      }),
      prisma.product.findMany({
        where: { active: true, newArrival: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { price: "asc" } },
          reviews: { where: { approved: true } },
          category: true,
        },
        take: 10,
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
      p.reviews?.length > 0
        ? Math.round(
            (p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              p.reviews.length) *
              10
          ) / 10
        : 5,
    reviewsCount: p.reviews && p.reviews.length >= 10 ? p.reviews.length : 10,
  });

  const tabFeaturedOrder = [
    "sauvage-37",
    "marj-27",
    "oudh-roses-34",
    "oudh-maracuja-33",
    "oudh-lavender-35",
  ];
  const sortedBestSellers = [...bestSellersRaw].sort((a, b) => {
    const idxA = tabFeaturedOrder.indexOf(a.slug);
    const idxB = tabFeaturedOrder.indexOf(b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  const bestSellers = sortedBestSellers.map(formatCard);
  const ownBrand = ownBrandRaw.map(formatCard);
  const inspired = inspiredRaw.map(formatCard);
  const luxuryPerfumes = luxuryRaw.map(formatCard);
  const newArrivals = (newArrivalsRaw.length > 0 ? newArrivalsRaw : inspiredRaw).map(formatCard);

  const topLuxuryOrder = [
    "sauvage-37",
    "marj-27",
    "tobacco-vanille-40",
    "oudh-maracuja-33",
    "khamrah-24",
  ];
  const topLuxuryProducts = topLuxuryOrder
    .map((slug) => allProductsRaw.find((p) => p.slug === slug))
    .filter(Boolean)
    .map(formatCard);

  const bestSellersOrder = [
    "sauvage-37",
    "marj-27",
    "oudh-roses-34",
    "oudh-maracuja-33",
    "oudh-lavender-35",
  ];
  const bestSellersCarousel = bestSellersOrder
    .map((slug) => allProductsRaw.find((p) => p.slug === slug))
    .filter(Boolean)
    .map(formatCard);

  return {
    bestSellers,
    ownBrand,
    inspired,
    luxuryPerfumes,
    newArrivals,
    topLuxuryProducts,
    bestSellersCarousel,
  };
}
