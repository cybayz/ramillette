import { PrismaClient, Role, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database records...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariantCountry.deleteMany();
  await prisma.productCountry.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding categories...");
  const categoriesData = [
    {
      name: "Own Brand",
      slug: "own-brand",
      description: "Exclusive original perfumes formulated in Qatar by Ramillette",
      sortOrder: 1,
    },
    {
      name: "Inspired",
      slug: "inspired",
      description: "Designer-inspired luxury fragrances with intense longevity and sillage",
      sortOrder: 2,
    },
    {
      name: "Luxury Perfumes",
      slug: "luxury-perfumes",
      description: "Opulent Middle Eastern oud and amber compositions",
      sortOrder: 3,
    },
    {
      name: "Best Sellers",
      slug: "best-sellers",
      description: "The most loved and top-rated fragrances across Doha",
      sortOrder: 4,
    },
    {
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Freshly introduced fragrance drops and limited batches",
      sortOrder: 5,
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  console.log("Seeding admin user...");
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123456", 10);

  await prisma.user.create({
    data: {
      email: "admin@ramillette.com",
      passwordHash: adminPasswordHash,
      firstName: "Admin",
      lastName: "Ramillette",
      phone: "+974 5555 1234",
      role: Role.ADMIN,
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      email: "customer@ramillette.com",
      passwordHash: customerPasswordHash,
      firstName: "Tariq",
      lastName: "Al-Kuwari",
      phone: "+974 6600 7788",
      role: Role.CUSTOMER,
      addresses: {
        create: {
          name: "Tariq Al-Kuwari",
          phone: "+974 6600 7788",
          addressLine1: "Villa 14, Street 920, Zone 90",
          city: "Al Wakrah",
          area: "Souq Al Wakra",
          country: "Qatar",
          isDefault: true,
        },
      },
    },
  });

  console.log("Loading products from seed_data.json...");
  const rawProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, "seed_data.json"), "utf8")
  );

  const bestSellerHandles = new Set([
    "amber-code-45",
    "sauvage-37",
    "delina",
    "bin-shaikh",
    "baccarat-rouge-540",
    "khamrah-24",
    "kaaf-23",
    "marj-27",
  ]);

  const newArrivalHandles = new Set([
    "amber-code-45",
    "pasha-de-cartier-36",
    "tuscan-leather-41",
    "arabian-tonka",
    "imagination",
    "tobacco-vanille-40",
  ]);

  console.log(`Processing ${rawProducts.length} products...`);
  const CHUNK_SIZE = 6;
  for (let i = 0; i < rawProducts.length; i += CHUNK_SIZE) {
    const chunk = rawProducts.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (p: any) => {
        let categorySlug = "inspired";
        if (p.handle.includes("amber-code")) {
          categorySlug = "own-brand";
        } else if (
          p.handle.includes("tuscan") ||
          p.handle.includes("bin-shaikh") ||
          p.handle.includes("marj") ||
          p.handle.includes("oudh")
        ) {
          categorySlug = "luxury-perfumes";
        }

        const categoryId = categoryMap[categorySlug];
        const isBestSeller = bestSellerHandles.has(p.handle);
        const isNewArrival = newArrivalHandles.has(p.handle);
        const isFeatured = isBestSeller || isNewArrival;

        let cleanDesc = p.body_html
          ? p.body_html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
          : `${p.title} is an exquisite, artisanal fragrance crafted with luxury fragrance oils for unmatched sillage and longevity.`;

        const variants = p.variants || [];
        const minPrice =
          variants.length > 0
            ? Math.min(...variants.map((v: any) => parseFloat(v.price) || 50))
            : 60.0;
        const comparePrice = variants[0]?.compare_at_price
          ? parseFloat(variants[0].compare_at_price)
          : null;
        const images = p.images || [];

        const createdProduct = await prisma.product.create({
          data: {
            name: p.title,
            slug: p.handle,
            description: cleanDesc,
            shortDescription: `${p.title} luxury parfum by Ramillette. Long-lasting Qatar formulation.`,
            brand: p.vendor || "Ramillette",
            categoryId,
            basePrice: minPrice,
            compareAtPrice: comparePrice && comparePrice > minPrice ? comparePrice : null,
            active: true,
            featured: isFeatured,
            bestseller: isBestSeller,
            newArrival: isNewArrival,
            stock: 85,
            topNotes: "Bergamot, Pink Pepper, Sicilian Lemon",
            heartNotes: "Damascena Rose, Ambergris, French Lavender",
            baseNotes: "Royal Oud, Madagascar Vanilla, White Musk",
            fragranceFamily: "Oriental Woody / Amber Floral",
            images: {
              createMany: {
                data: images.map((img: any, idx: number) => ({
                  url: img.src,
                  alt: `${p.title} - Ramillette Perfumes`,
                  sortOrder: idx,
                })),
              },
            },
            countries: {
              createMany: {
                data: [
                  {
                    country: "QA",
                    price: minPrice,
                    compareAtPrice: comparePrice && comparePrice > minPrice ? comparePrice : null,
                    stock: 85,
                    active: true,
                  },
                  {
                    country: "AE",
                    price: Math.round(minPrice * 1.01),
                    compareAtPrice: comparePrice ? Math.round(comparePrice * 1.01) : null,
                    stock: 60,
                    active: true,
                  },
                  {
                    country: "BH",
                    price: Number((minPrice * 0.103).toFixed(3)),
                    compareAtPrice: comparePrice ? Number((comparePrice * 0.103).toFixed(3)) : null,
                    stock: 35,
                    active: true,
                  },
                ],
              },
            },
            reviews: {
              createMany: {
                data: [
                  {
                    authorName: "Nasser Al-Thani",
                    rating: 5,
                    title: "Incredible sillage and projection",
                    comment: `I ordered ${p.title} and the delivery arrived in Doha within 2 hours. The scent lasts all day on clothes and smells remarkably rich.`,
                    country: "QA",
                    approved: true,
                  },
                  {
                    authorName: "Zayed Al-Mansoor",
                    rating: 5,
                    title: "Luxury perfumery in Dubai",
                    comment: `Sprayed ${p.title} before leaving my apartment in Downtown Dubai. Projection remained intense through meetings and dinner.`,
                    country: "AE",
                    approved: true,
                  },
                  {
                    authorName: "Noor Al-Zayani",
                    rating: 5,
                    title: "Stunning longevity in Bahrain",
                    comment: `Fast delivery in Riffa! ${p.title} is truly a masterpiece. BenefitPay checkout was instant and effortless.`,
                    country: "BH",
                    approved: true,
                  },
                ],
              },
            },
          },
        });

        for (const v of variants) {
          const variantPrice = parseFloat(v.price) || minPrice;
          const variantCompare = v.compare_at_price ? parseFloat(v.compare_at_price) : null;
          await prisma.productVariant.create({
            data: {
              productId: createdProduct.id,
              name: v.title || v.option1 || "Standard",
              sku: `RAM-${p.id}-${v.id}`,
              price: variantPrice,
              compareAtPrice: variantCompare && variantCompare > variantPrice ? variantCompare : null,
              stock: 40,
              active: true,
              countries: {
                createMany: {
                  data: [
                    {
                      country: "QA",
                      price: variantPrice,
                      compareAtPrice: variantCompare && variantCompare > variantPrice ? variantCompare : null,
                      stock: 45,
                      active: true,
                    },
                    {
                      country: "AE",
                      price: Math.round(variantPrice * 1.01),
                      compareAtPrice: variantCompare ? Math.round(variantCompare * 1.01) : null,
                      stock: 30,
                      active: true,
                    },
                    {
                      country: "BH",
                      price: Number((variantPrice * 0.103).toFixed(3)),
                      compareAtPrice: variantCompare ? Number((variantCompare * 0.103).toFixed(3)) : null,
                      stock: 20,
                      active: true,
                    },
                  ],
                },
              },
            },
          });
        }
      })
    );
    console.log(`Seeded ${Math.min(i + CHUNK_SIZE, rawProducts.length)} / ${rawProducts.length} products`);
  }

  console.log("Seeding coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        type: DiscountType.PERCENTAGE,
        value: 10.0,
        minimumOrder: 100.0,
        usageLimit: 1000,
        active: true,
      },
      {
        code: "RAMILLETTE50",
        type: DiscountType.FIXED_AMOUNT,
        value: 50.0,
        minimumOrder: 300.0,
        usageLimit: 500,
        active: true,
      },
    ],
  });

  console.log("Seeding site settings...");
  await prisma.siteSetting.createMany({
    data: [
      { key: "freeShippingThreshold", value: "900" },
      { key: "storeAddress", value: "Souq Al Wakra, Building 45, Doha, Qatar" },
      { key: "storePhone", value: "+974 5555 1234" },
      { key: "storeEmail", value: "contact@ramillette.com" },
      {
        key: "announcementText",
        value: "Souq Al Wakra, Qatar • Free 2-Hour Express Delivery in Doha on orders over QAR 900",
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
