import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const rawCsv = `Product Name ,100ml,50ml,30ml ,Description ,Top notes,Middle Note,Base note ,Category ,Type
Bleu de chanel,54,37,30,,,,,,
Reflection ,,42,34,,,,,,
Baccarat Rouge 540,92,56,,,,,,,
Hawas for him ,88,54,,,,,,,
Woode sea & sea salt,65,43,,,,,,,
Allure homme sport ,51,36,,,,,,,
Pour homme ,63,42,33,,,,,,
Light blue pour homme,,38,,,,,,,
Sauvage ,67,44,,,,,,,
CR7,59,39,31,,,,,,
Aventus,61,40,,,,,,,
Coolwater ,56,38,30,,,,,,
Boss bottled,60,40,,,,,,,
Imagination ,94,57,,,,,,,
1 Million intense,55,37,30,,,,,,
Blu,64,42,,,,,,,
Phantom ,75,47,,,,,,,
Le gemme tyger ,60,40,31,,,,,,
Gypsy Water,66,43,,,,,,,
Weekend,,36,,,,,,,
Hawas ice,,43,,,,,,,
Armani code ,,42,,,,,,,
Intense Café,78,49,,,,,,,
Ck one,,38,,,,,,,
Acqua de gio,,42,,,,,,,
Gentle fluidity gold,83,52,,,,,,,
Eternity ,,38,,,,,,,
Millesime imperial ,78,49,,,,,,,
Gentle fluidity silver ,86,53,,,,,,,
Green irish tweed,,48,,,,,,,
Oud Maracuja ,68,44,34,,,,,,
Cairo Oud ,60,40,32,,,,,,
Bin shaikh,112,66,,,,,,,
Imperial Valley ,92,56,,,,,,,
Blue oud,,44,,,,,,,
Purple oud ,,43,,,,,,,
White oud ,,39,,,,,,,
Black Orchid ,80,50,37,,,,,,
Ombre Leather,81,50,,,,,,,
Asad,71,45,,,,,,,
Asaf,66,43,,,,,,,
Hudson ,81,,,,,,,,
Tuscan Leather ,,,31,,,,,,
Khamrah ,65,42,33,,,,,,
Brazilian Tobacco,83,52,,,,,,,
Spanish tobacco ,65,42,,,,,,,
Cuban tobacco,90,55,,,,,,,
Jamaican tobacco,83,52,,,,,,,
Tobacco vanille,57,38,31,,,,,,
Mexican Tobacco,107,63,,,,,,,
Guilty Absolute ,80,50,,,,,,,
Obsession ,,39,,,,,,,
Musk Rijal,,42,33,,,,,,
Purpose 50,129,75,53,,,,,,
Guidance ,86,53,40,,,,,,
Oryx,72,46,35,,,,,,
Outlands,120,70,50,,,,,,
Ombre Nomade ,98,59,,,,,,,
Grand Soir,86,53,,,,,,,
Akoya ,67,44,,,,,,,
one and only ,,44,,,,,,,
Megamare,152,86,59,,,,,,
La luna ,80,50,37,,,,,,
Decision ,141,81,57,,,,,,
Fahrenheit,57,39,31,,,,,,
Ganymede,95,58,,,,,,,
Fame,67,44,,,,,,,
Coco mademoiselle,,40,,,,,,,
Gucci bloom ,,44,,,,,,,
Rush 2,,37,,,,,,,
Delina ,61,40,,,,,,,
Playlady,63,42,,,,,,,
Golden girl ,60,,31,,,,,,
Burberry her ,79,49,37,,,,,,
Si passion ,,44,,,,,,,
Miss dior ,,48,,,,,,,
Oud lavender ,,41,,,,,,,
Good girl ,,51,,,,,,,
Burberry london ,,37,,,,,,,
Good gril gone bad ,86,53,,,,,,,`;

const FRAGRANCE_NOTES: Record<string, { top: string; heart: string; base: string; family: string }> = {
  "bleu-de-chanel": {
    top: "Grapefruit, Lemon, Mint, Pink Pepper",
    heart: "Ginger, Nutmeg, Jasmine, Iso E Super",
    base: "Incense, Vetiver, Cedar, Sandalwood, Patchouli",
    family: "Woody Aromatic",
  },
  "reflection": {
    top: "Rosemary, Red Pepper Berries, Bitter Orange Leaves",
    heart: "Neroli, Orris, Jasmine, Ylang-Ylang",
    base: "Vetiver, Cedarwood, Sandalwood, Patchouli",
    family: "Woody Floral",
  },
  "baccarat-rouge-540": {
    top: "Saffron, Jasmine",
    heart: "Amberwood, Ambergris",
    base: "Fir Resin, Cedar",
    family: "Amber Floral",
  },
  "hawas-for-him": {
    top: "Apple, Bergamot, Lemon, Cinnamon",
    heart: "Watery Notes, Plum, Orange Blossom, Cardamom",
    base: "Ambergris, Musk, Driftwood, Patchouli",
    family: "Fresh Aquatic Woody",
  },
  "woode-sea-sea-salt": {
    top: "Ambrette Seeds, Sea Salt",
    heart: "Seaweed, Mineral Sage",
    base: "Grapefruit, Dried Wood, Musk",
    family: "Aromatic Aquatic",
  },
  "allure-homme-sport": {
    top: "Orange, Sea Notes, Aldehydes, Blood Mandarin",
    heart: "Pepper, Neroli, Cedar",
    base: "Tonka Bean, Vanilla, White Musk, Amber, Vetiver",
    family: "Fresh Spicy Woody",
  },
  "pour-homme": {
    top: "Lemon, Neroli, Bergamot, Rose de Mai",
    heart: "Hyacinth, Clary Sage, Cedar, Geranium",
    base: "Tonka Bean, Musk, Amber",
    family: "Aromatic Fougere",
  },
  "light-blue-pour-homme": {
    top: "Sicilian Mandarin, Juniper, Grapefruit, Bergamot",
    heart: "Rosemary, Brazilian Rosewood, Pepper",
    base: "Musk, Oakmoss, Incense",
    family: "Citrus Aromatic",
  },
  "sauvage": {
    top: "Calabrian Bergamot, Pepper",
    heart: "Sichuan Pepper, Lavender, Pink Pepper, Vetiver, Patchouli",
    base: "Ambroxan, Cedar, Labdanum",
    family: "Fresh Spicy",
  },
  "cr7": {
    top: "Bergamot, Artemisia, Cardamom, Lavender",
    heart: "Cinnamon, Cedar, Iris, Tobacco",
    base: "Sandalwood, Vanilla, Amber, Musk",
    family: "Aromatic Fougere",
  },
  "aventus": {
    top: "Pineapple, Bergamot, Blackcurrant, Apple",
    heart: "Birch, Patchouli, Moroccan Jasmine, Rose",
    base: "Musk, Oakmoss, Ambergris, Vanille",
    family: "Fruity Chypre",
  },
  "coolwater": {
    top: "Sea Water, Mint, Green Notes, Lavender, Coriander",
    heart: "Sandalwood, Jasmine, Neroli, Geranium",
    base: "Musk, Oakmoss, Cedar, Tobacco, Amber",
    family: "Fresh Aquatic",
  },
  "boss-bottled": {
    top: "Apple, Plum, Bergamot, Lemon, Oakmoss, Geranium",
    heart: "Cinnamon, Mahogany, Carnation",
    base: "Vanilla, Sandalwood, Cedar, Vetiver, Olive Tree",
    family: "Woody Spicy",
  },
  "imagination": {
    top: "Citron, Calabrian Bergamot, Sicilian Orange",
    heart: "Nigerian Ginger, Tunisian Neroli, Ceylon Cinnamon",
    base: "Chinese Black Tea, Ambroxan, Guaiac Wood, Olibanum",
    family: "Citrus Amber",
  },
  "1-million-intense": {
    top: "Blood Mandarin, Cardamom, Black Pepper, Saffron",
    heart: "Rose, Cinnamon, Neroli",
    base: "Leather, Orris Root, Patchouli, Sandalwood",
    family: "Spicy Leather",
  },
  "phantom": {
    top: "Lavender, Lemon Zest, Amalfi Lemon",
    heart: "Lavender, Apple, Smoke, Earthy Notes, Patchouli",
    base: "Vanilla, Lavender, Vetiver",
    family: "Futuristic Aromatic",
  },
  "le-gemme-tyger": {
    top: "Grapefruit, Sparkling Citrus",
    heart: "Ginger, Ambrette",
    base: "Ambrox, Woody Notes",
    family: "Citrus Amber Woody",
  },
  "gypsy-water": {
    top: "Juniper, Lemon, Bergamot, Pepper",
    heart: "Pine Needles, Incense, Orris Root",
    base: "Sandalwood, Vanilla, Amber",
    family: "Woody Aromatic",
  },
  "tobacco-vanille": {
    top: "Tobacco Leaf, Spicy Notes",
    heart: "Tonka Bean, Tobacco Blossom, Vanilla, Cacao",
    base: "Dry Fruit Accord, Rich Woods",
    family: "Oriental Spicy",
  },
  "ombre-leather": {
    top: "Cardamom",
    heart: "Leather, Jasmine Sambac",
    base: "Amber, Moss, Patchouli",
    family: "Warm Leather",
  },
  "ombre-nomade": {
    top: "Raspberry, Geranium",
    heart: "Rose, Saffron, Incense",
    base: "Agarwood (Oud), Benzoin, Amberwood",
    family: "Oriental Woody Oud",
  },
  "grand-soir": {
    top: "Spanish Labdanum",
    heart: "Benzoin from Siam",
    base: "Brazilian Tonka Bean, Vanilla Amber Accord",
    family: "Amber Woody",
  },
  "megamare": {
    top: "Bergamot, Lemon, Aquatic Salt",
    heart: "Calone, Hedione, Seaweed",
    base: "Ambrox, Cedarwood, Musk",
    family: "Marine Mineral",
  },
  "delina": {
    top: "Rhubarb, Lychee, Bergamot, Nutmeg",
    heart: "Turkish Rose, Peony, Musk, Petalia, Vanilla",
    base: "Cashmeran, Cedar, Haitian Vetiver, Incense",
    family: "Floral Woody",
  },
  "good-girl": {
    top: "Almond, Coffee, Bergamot, Lemon",
    heart: "Tuberose, Jasmine Sambac, Orange Blossom, Orris, Bulgarian Rose",
    base: "Tonka Bean, Cacao, Vanilla, Praline, Sandalwood, Musk, Amber, Cashmere Wood",
    family: "Amber Floral",
  },
  "black-orchid": {
    top: "Truffle, Gardenia, Blackcurrant, Ylang-Ylang, Jasmine, Bergamot",
    heart: "Orchid, Spices, Gardenia, Fruity Notes, Ylang-Ylang, Lotus",
    base: "Mexican Chocolate, Patchouli, Vanille, Incense, Amber, Sandalwood, Vetiver, White Musk",
    family: "Oriental Floral",
  },
  "tuscan-leather": {
    top: "Raspberry, Saffron, Thyme",
    heart: "Olibanum, Jasmine",
    base: "Leather, Suede, Woody Notes, Amber",
    family: "Leather Chypre",
  },
  "khamrah": {
    top: "Cinnamon, Nutmeg, Bergamot",
    heart: "Dates, Praline, Tuberose, Mahonial",
    base: "Vanilla, Tonka Bean, Benzoin, Myrrh, Amberwood, Akigalawood",
    family: "Warm Gourmand",
  },
  "bin-shaikh": {
    top: "French Rose, Lavender, Saffron, Cardamom, Citrus",
    heart: "Jasmine, Orchid, Sugar, Incense, Agarwood",
    base: "Amber, Musk, White Oud, Patchouli",
    family: "Royal Oriental Oud",
  },
};

function getFallbackNotes(name: string): { top: string; heart: string; base: string; family: string } {
  const lower = name.toLowerCase();
  if (lower.includes("oud") || lower.includes("oriental")) {
    return {
      top: "Bergamot, Saffron, Pink Pepper",
      heart: "Taif Rose, Incense, Cedarwood",
      base: "Cambodian Oud, Ambergris, White Musk",
      family: "Oriental Woody Oud",
    };
  }
  if (lower.includes("tobacco")) {
    return {
      top: "Tobacco Blossom, Spiced Rum, Cardamom",
      heart: "Cinnamon Bark, Honey, Tonka Bean",
      base: "Rich Cured Tobacco, Madagascar Vanilla, Cedar",
      family: "Warm Gourmand Tobacco",
    };
  }
  if (lower.includes("blue") || lower.includes("aqua") || lower.includes("sea") || lower.includes("water")) {
    return {
      top: "Sicilian Bergamot, Sea Breeze, Crisp Mint",
      heart: "Neroli, Geranium, Mineral Salt",
      base: "Driftwood, White Amber, Cedar",
      family: "Fresh Marine Aquatic",
    };
  }
  if (
    lower.includes("rose") ||
    lower.includes("bloom") ||
    lower.includes("dior") ||
    lower.includes("mademoiselle") ||
    lower.includes("fame")
  ) {
    return {
      top: "Mandarin, Red Berries, Peony",
      heart: "Damask Rose, Grasse Jasmine, Orange Blossom",
      base: "White Musk, Vanilla Bean, Patchouli",
      family: "Floral Amber",
    };
  }
  return {
    top: "Calabrian Bergamot, Cardamom, Citrus Blossom",
    heart: "French Lavender, Spiced Nutmeg, Cashmere Wood",
    base: "Warm Amber, Royal Sandalwood, Velvet Musk",
    family: "Luxury Woody Amber",
  };
}

function cleanTitle(raw: string): string {
  return raw
    .trim()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .replace(/\bCr7\b/i, "CR7")
    .replace(/\bCk One\b/i, "CK One")
    .replace(/\bGood Gril Gone Bad\b/i, "Good Girl Gone Bad")
    .replace(/\bGood Girl Gone Bad\b/i, "Good Girl Gone Bad")
    .replace(/\bLe Gemme Tyger\b/i, "Le Gemme Tygar")
    .replace(/\bOud Maracuja\b/i, "Oud Maracuja");
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const dbUrl = process.env.DATABASE_URL?.replace("&channel_binding=require", "") || process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

  console.log("=== Fast Batch Seeding 80 Fragrances ===");

  // 1. Wipe legacy orders, cart items, inventories, and products
  console.log("Step 1: Wiping legacy orders, inventory transactions, and test products...");
  await prisma.orderReturnItem.deleteMany().catch(() => {});
  await prisma.orderReturn.deleteMany().catch(() => {});
  await prisma.posPayment.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.rewardPointTransaction.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.wishlist.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.stockTransferItem.deleteMany().catch(() => {});
  await prisma.stockTransfer.deleteMany().catch(() => {});
  await prisma.purchaseOrderItem.deleteMany().catch(() => {});
  await prisma.purchaseOrder.deleteMany().catch(() => {});
  await prisma.inventoryTransaction.deleteMany().catch(() => {});
  await prisma.storeInventory.deleteMany().catch(() => {});
  await prisma.productVariantCountry.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.productCountry.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  console.log("Database cleared of all legacy products and orders.");

  // 2. Ensure Categories exist
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const defaultInspiredId = categoryMap.get("inspired") || categories[0]?.id;
  const luxuryId = categoryMap.get("luxury-perfumes") || defaultInspiredId;
  const ownBrandId = categoryMap.get("own-brand") || defaultInspiredId;

  const countries = await prisma.country.findMany();
  const stores = await prisma.store.findMany();

  // Load existing images from seed_data.json as image catalog
  let imageCatalog = new Map<string, string>();
  try {
    const seedJsonPath = path.join(__dirname, "seed_data.json");
    if (fs.existsSync(seedJsonPath)) {
      const seedData = JSON.parse(fs.readFileSync(seedJsonPath, "utf-8"));
      for (const item of seedData) {
        const norm = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (item.images?.[0]?.src) {
          imageCatalog.set(norm, item.images[0].src);
        }
      }
    }
  } catch (e) {
    console.warn("Could not load seed_data.json catalog:", e);
  }

  const defaultBottleImage =
    "https://cdn.shopify.com/s/files/1/0754/5323/5383/files/bleu_de_chanel.png?v=1788027197";

  const lines = rawCsv.trim().split("\n");
  const dataRows = lines.slice(1);

  console.log(`Processing ${dataRows.length} fragrance products...`);

  const allStoreInventories: {
    storeId: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    damagedQuantity: number;
    lowStockThreshold: number;
  }[] = [];

  let count = 0;

  for (const line of dataRows) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    const rawName = parts[0]?.trim();
    if (!rawName) continue;

    const price100 = parts[1]?.trim() ? parseFloat(parts[1].trim()) : null;
    const price50 = parts[2]?.trim() ? parseFloat(parts[2].trim()) : null;
    const price30 = parts[3]?.trim() ? parseFloat(parts[3].trim()) : null;

    const availableVariants: { name: string; price: number }[] = [];
    if (price30 && !isNaN(price30)) availableVariants.push({ name: "30ml", price: price30 });
    if (price50 && !isNaN(price50)) availableVariants.push({ name: "50ml", price: price50 });
    if (price100 && !isNaN(price100)) availableVariants.push({ name: "100ml", price: price100 });

    if (availableVariants.length === 0) continue;

    const title = cleanTitle(rawName);
    const slug = generateSlug(title);
    const minPrice = Math.min(...availableVariants.map((v) => v.price));

    const lowerName = rawName.toLowerCase();
    let categoryId = defaultInspiredId;
    if (
      lowerName.includes("oud") ||
      lowerName.includes("tobacco") ||
      lowerName.includes("nomade") ||
      lowerName.includes("megamare") ||
      lowerName.includes("bin shaikh") ||
      lowerName.includes("imperial valley") ||
      lowerName.includes("grand soir") ||
      lowerName.includes("oryx") ||
      lowerName.includes("la luna")
    ) {
      categoryId = luxuryId;
    } else if (lowerName.includes("amber code") || lowerName.includes("decision") || lowerName.includes("akoya")) {
      categoryId = ownBrandId;
    }

    const normKey = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    let imageUrl = imageCatalog.get(normKey);
    if (!imageUrl) {
      for (const [k, v] of imageCatalog.entries()) {
        if (normKey.includes(k) || k.includes(normKey)) {
          imageUrl = v;
          break;
        }
      }
    }
    if (!imageUrl) imageUrl = defaultBottleImage;

    const notes = FRAGRANCE_NOTES[slug] || getFallbackNotes(title);
    const description = `${title} is an artisanal luxury eau de parfum crafted for unmatched longevity, depth, and sillage. Formulated with high-concentration perfume oils, it opens with radiant notes of ${notes.top.toLowerCase()} before transitioning into a heart of ${notes.heart.toLowerCase()}, resting gracefully on a deep base of ${notes.base.toLowerCase()}.`;
    const shortDescription = `${title} luxury parfum by Ramillette. Exquisite projection and long-lasting Qatar formulation.`;

    // Upsert product with nested relations in a single query
    const createdProduct = await prisma.product.upsert({
      where: { slug },
      create: {
        name: title,
        slug,
        sku: `PROD-${slug.toUpperCase()}`,
        description,
        shortDescription,
        brand: "Ramillette",
        categoryId,
        basePrice: minPrice,
        compareAtPrice: Math.round(minPrice * 1.25),
        stock: 120,
        active: true,
        featured: ["Bleu De Chanel", "Baccarat Rouge 540", "Aventus", "Sauvage", "Imagination", "Megamare", "Bin Shaikh", "Delina"].includes(title),
        bestseller: ["Bleu De Chanel", "Baccarat Rouge 540", "Sauvage", "Aventus", "Hawas For Him", "Khamrah", "Delina", "Good Girl"].includes(title),
        newArrival: ["Oud Maracuja", "Megamare", "Imagination", "Grand Soir", "Guidance", "Decision"].includes(title),
        topNotes: notes.top,
        heartNotes: notes.heart,
        baseNotes: notes.base,
        fragranceFamily: notes.family,
        images: {
          create: [{ url: imageUrl, alt: `${title} - Ramillette Perfumes`, sortOrder: 0 }],
        },
        countries: {
          createMany: {
            data: countries.map((c) => {
              const rate = parseFloat(c.exchangeRate.toString()) || 1.0;
              const localPrice = c.code === "BH" ? Number((minPrice * rate).toFixed(3)) : Math.round(minPrice * rate);
              return {
                country: c.code,
                price: localPrice,
                compareAtPrice: c.code === "BH" ? Number((localPrice * 1.25).toFixed(3)) : Math.round(localPrice * 1.25),
                stock: 80,
                active: true,
              };
            }),
          },
        },
        variants: {
          create: availableVariants.map((v) => ({
            name: v.name,
            sku: `VAR-${slug.toUpperCase()}-${v.name.toUpperCase()}`,
            price: v.price,
            compareAtPrice: Math.round(v.price * 1.25),
            stock: 40,
            active: true,
            countries: {
              createMany: {
                data: countries.map((c) => {
                  const rate = parseFloat(c.exchangeRate.toString()) || 1.0;
                  const localPrice = c.code === "BH" ? Number((v.price * rate).toFixed(3)) : Math.round(v.price * rate);
                  return {
                    country: c.code,
                    price: localPrice,
                    compareAtPrice: c.code === "BH" ? Number((localPrice * 1.25).toFixed(3)) : Math.round(localPrice * 1.25),
                    stock: 40,
                    active: true,
                  };
                }),
              },
            },
          })),
        },
      },
      update: {
        basePrice: minPrice,
        compareAtPrice: Math.round(minPrice * 1.25),
        active: true,
      },
      include: {
        variants: true,
      },
    });

    count++;

    // Prepare store inventory rows in memory
    for (const s of stores) {
      allStoreInventories.push({
        storeId: s.id,
        productId: createdProduct.id,
        variantId: null,
        quantity: 80,
        availableQuantity: 80,
        reservedQuantity: 0,
        damagedQuantity: 0,
        lowStockThreshold: 10,
      });

      for (const v of createdProduct.variants) {
        allStoreInventories.push({
          storeId: s.id,
          productId: createdProduct.id,
          variantId: v.id,
          quantity: 40,
          availableQuantity: 40,
          reservedQuantity: 0,
          damagedQuantity: 0,
          lowStockThreshold: 5,
        });
      }
    }
  }

  console.log(`Created ${count} products. Now populating store inventories (${allStoreInventories.length} records)...`);

  // Bulk insert all store inventories in chunks
  const CHUNK = 200;
  for (let i = 0; i < allStoreInventories.length; i += CHUNK) {
    const chunk = allStoreInventories.slice(i, i + CHUNK);
    await prisma.storeInventory.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  console.log(`\n Successfully seeded ${count} products and all store inventories!`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Batch seed error:", err);
  process.exit(1);
});
