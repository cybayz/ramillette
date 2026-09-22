import { PrismaClient, Role, InventoryTransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting ERP multi-store data setup...");

  // 1. Ensure countries exist
  const countries = [
    {
      code: "QA",
      name: "Qatar",
      nameAr: "قطر",
      currency: "QAR",
      currencyAr: "ر.ق",
      currencySymbol: "QAR",
      currencyDecimals: 2,
      exchangeRate: 1.0,
      phonePrefix: "+974",
      standardShippingFee: 30,
      freeShippingThreshold: 900,
      taxRate: 0.0,
      defaultCity: "Doha",
      cities: JSON.stringify(["Doha", "Al Wakrah", "Al Rayyan", "Lusail", "Umm Salal", "Al Khor"]),
    },
    {
      code: "AE",
      name: "United Arab Emirates",
      nameAr: "الإمارات العربية المتحدة",
      currency: "AED",
      currencyAr: "د.إ",
      currencySymbol: "AED",
      currencyDecimals: 2,
      exchangeRate: 1.01,
      phonePrefix: "+971",
      standardShippingFee: 30,
      freeShippingThreshold: 900,
      taxRate: 5.0,
      defaultCity: "Dubai",
      cities: JSON.stringify(["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"]),
    },
    {
      code: "BH",
      name: "Bahrain",
      nameAr: "البحرين",
      currency: "BHD",
      currencyAr: "د.ب",
      currencySymbol: "BHD",
      currencyDecimals: 3,
      exchangeRate: 0.103,
      phonePrefix: "+973",
      standardShippingFee: 3,
      freeShippingThreshold: 90,
      taxRate: 10.0,
      defaultCity: "Manama",
      cities: JSON.stringify(["Manama", "Muharraq", "Riffa", "Hamad Town", "Saar"]),
    },
  ];

  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      create: {
        code: c.code,
        name: c.name,
        nameAr: c.nameAr,
        flag: c.code === "QA" ? "🇶🇦" : c.code === "AE" ? "🇦🇪" : "🇧🇭",
        currency: c.currency,
        currencyAr: c.currencyAr,
        currencySymbol: c.currencySymbol,
        currencyDecimals: c.currencyDecimals,
        exchangeRate: c.exchangeRate,
        phonePrefix: c.phonePrefix,
        standardShippingFee: c.standardShippingFee,
        freeShippingThreshold: c.freeShippingThreshold,
        taxRate: c.taxRate,
        defaultCity: c.defaultCity,
        cities: c.cities,
      },
      update: {},
    });
  }

  // 2. Create Regions
  const regionsData = [
    { countryCode: "QA", name: "Doha", nameAr: "الدوحة", code: "DOH" },
    { countryCode: "QA", name: "Al Rayyan", nameAr: "الريان", code: "RAY" },
    { countryCode: "QA", name: "Al Wakrah", nameAr: "الوكرة", code: "WAK" },
    { countryCode: "AE", name: "Abu Dhabi", nameAr: "أبوظبي", code: "AUH" },
    { countryCode: "AE", name: "Dubai", nameAr: "دبي", code: "DXB" },
    { countryCode: "BH", name: "Manama", nameAr: "المنامة", code: "MAN" },
  ];

  const regionMap: Record<string, string> = {};
  for (const r of regionsData) {
    const reg = await prisma.region.upsert({
      where: {
        countryCode_name: {
          countryCode: r.countryCode,
          name: r.name,
        },
      },
      create: r,
      update: {},
    });
    regionMap[`${r.countryCode}-${r.name}`] = reg.id;
  }

  // 3. Create Stores
  const storesData = [
    {
      code: "DOH-001",
      name: "Ramillette Doha Main Store",
      nameAr: "فرع راميليت الرئيسي - الدوحة",
      regionId: regionMap["QA-Doha"],
      countryCode: "QA",
      address: "Souq Al Wakra Heritage District, Building 45, Doha, Qatar",
      phone: "+974 5555 1234",
      email: "dohamain@ramillette.com",
      currency: "QAR",
      taxRate: 0.0,
      isFulfillmentCenter: true,
      priority: 10,
    },
    {
      code: "DOH-002",
      name: "Ramillette Mall of Qatar Boutique",
      nameAr: "فرع راميليت قطر مول",
      regionId: regionMap["QA-Al Rayyan"],
      countryCode: "QA",
      address: "Ground Floor, Luxury Wing, Mall of Qatar, Al Rayyan",
      phone: "+974 5555 5678",
      email: "moq@ramillette.com",
      currency: "QAR",
      taxRate: 0.0,
      isFulfillmentCenter: true,
      priority: 5,
    },
    {
      code: "AUH-001",
      name: "Ramillette Abu Dhabi Store",
      nameAr: "فرع راميليت أبوظبي",
      regionId: regionMap["AE-Abu Dhabi"],
      countryCode: "AE",
      address: "Corniche Road, Galleria Luxury Level 2, Abu Dhabi, UAE",
      phone: "+971 2 444 8899",
      email: "abudhabi@ramillette.ae",
      currency: "AED",
      taxRate: 5.0,
      isFulfillmentCenter: true,
      priority: 8,
    },
    {
      code: "DXB-001",
      name: "Ramillette Dubai Store",
      nameAr: "فرع راميليت وسط مدينة دبي",
      regionId: regionMap["AE-Dubai"],
      countryCode: "AE",
      address: "Downtown Dubai Boulevard, Promenade Tower, Dubai, UAE",
      phone: "+971 4 333 5678",
      email: "dubai@ramillette.ae",
      currency: "AED",
      taxRate: 5.0,
      isFulfillmentCenter: true,
      priority: 10,
    },
  ];

  const storeMap: Record<string, any> = {};
  for (const s of storesData) {
    const createdStore = await prisma.store.upsert({
      where: { code: s.code },
      create: s,
      update: s,
    });
    storeMap[s.code] = createdStore;
  }

  // 4. Create Staff / ERP Users
  const passwordHash = await bcrypt.hash("Ramillette@2026", 10);
  const staffUsers = [
    {
      email: "superadmin@ramillette.com",
      firstName: "Faisal",
      lastName: "Al-Thani",
      phone: "+974 5500 0001",
      role: Role.SUPER_ADMIN,
      assignedStoreId: storeMap["DOH-001"].id,
    },
    {
      email: "manager.doha@ramillette.com",
      firstName: "Rashid",
      lastName: "Al-Kuwari",
      phone: "+974 5500 0002",
      role: Role.STORE_MANAGER,
      assignedStoreId: storeMap["DOH-001"].id,
    },
    {
      email: "cashier.doha@ramillette.com",
      firstName: "Noor",
      lastName: "Salim",
      phone: "+974 5500 0003",
      role: Role.CASHIER,
      assignedStoreId: storeMap["DOH-001"].id,
    },
    {
      email: "inventory.qa@ramillette.com",
      firstName: "Hamad",
      lastName: "Mansoor",
      phone: "+974 5500 0004",
      role: Role.INVENTORY_MANAGER,
      assignedStoreId: storeMap["DOH-001"].id,
    },
    {
      email: "manager.dubai@ramillette.com",
      firstName: "Zayed",
      lastName: "Al-Nahyan",
      phone: "+971 50 111 2233",
      role: Role.STORE_MANAGER,
      assignedStoreId: storeMap["DXB-001"].id,
    },
  ];

  for (const u of staffUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        assignedStoreId: u.assignedStoreId,
      },
      update: {
        role: u.role,
        assignedStoreId: u.assignedStoreId,
      },
    });

    if (u.assignedStoreId) {
      await prisma.userStore.upsert({
        where: {
          userId_storeId: {
            userId: user.id,
            storeId: u.assignedStoreId,
          },
        },
        create: {
          userId: user.id,
          storeId: u.assignedStoreId,
          isDefault: true,
        },
        update: {},
      });
    }
  }

  // Also ensure existing admin has SUPER_ADMIN or ADMIN role
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@ramillette.com" } });
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: Role.SUPER_ADMIN,
        assignedStoreId: storeMap["DOH-001"].id,
      },
    });
  }

  // 5. Create Suppliers
  const suppliersData = [
    {
      name: "Grasse Fragrance Laboratories",
      company: "Grasse Essences S.A.S.",
      country: "France",
      email: "orders@grasse-fragrances.fr",
      phone: "+33 4 93 36 00 00",
      notes: "Primary supplier of natural rose, iris, and French bergamot oils",
    },
    {
      name: "Arabian Royal Oud & Amber Distillers",
      company: "Al-Oud Al-Malaki FZ-LLC",
      country: "UAE",
      email: "wholesale@royaloud.ae",
      phone: "+971 4 888 7777",
      notes: "Dehn Al Oud, Cambodian agarwood, and ambergris",
    },
    {
      name: "Doha Luxury Glass & Packaging",
      company: "Qatar Artisan Bottles W.L.L.",
      country: "Qatar",
      email: "info@dohaglass.qa",
      phone: "+974 4433 2211",
      notes: "Custom crystal perfume flacons, magnetic caps, and atomizers",
    },
  ];

  for (const sup of suppliersData) {
    await prisma.supplier.create({ data: sup });
  }

  // 6. Populate StoreInventory for existing products
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      countries: true,
    },
  });

  console.log(`Populating store inventory for ${products.length} catalog products...`);

  for (const prod of products) {
    // Generate barcode if missing
    let barcode = prod.barcode;
    if (!barcode) {
      const randomCode = Math.floor(100000000000 + Math.random() * 900000000000);
      barcode = `629${randomCode.toString().slice(3)}`;
      await prisma.product.update({
        where: { id: prod.id },
        data: { barcode },
      });
    }

    // Allocate inventory across stores
    // Doha Main (QA): 45 units
    // Doha Mall (QA): 25 units
    // Abu Dhabi (AE): 30 units
    // Dubai (AE): 40 units
    const storeAllocations = [
      { store: storeMap["DOH-001"], qty: 45 },
      { store: storeMap["DOH-002"], qty: 25 },
      { store: storeMap["AUH-001"], qty: 30 },
      { store: storeMap["DXB-001"], qty: 40 },
    ];

    for (const alloc of storeAllocations) {
      await prisma.storeInventory.upsert({
        where: {
          storeId_productId_variantId: {
            storeId: alloc.store.id,
            productId: prod.id,
            variantId: prod.variants[0]?.id || "", // placeholder or null logic below
          },
        },
        create: {
          storeId: alloc.store.id,
          productId: prod.id,
          variantId: null,
          quantity: alloc.qty,
          reservedQuantity: 0,
          availableQuantity: alloc.qty,
          lowStockThreshold: 10,
        },
        update: {
          quantity: alloc.qty,
          availableQuantity: alloc.qty,
        },
      });

      // Also create initial ledger entry for opening stock
      await prisma.inventoryTransaction.create({
        data: {
          storeId: alloc.store.id,
          productId: prod.id,
          type: InventoryTransactionType.PURCHASE,
          quantity: alloc.qty,
          previousQuantity: 0,
          newQuantity: alloc.qty,
          referenceType: "INITIAL_SETUP",
          reason: "Opening store inventory balance",
        },
      });

      // If variants exist, distribute variant stock
      for (const v of prod.variants) {
        if (!v.barcode) {
          const varBarcode = `629${Math.floor(100000000000 + Math.random() * 900000000000).toString().slice(3)}`;
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { barcode: varBarcode },
          });
        }

        const vQty = Math.round(alloc.qty * 0.6);
        await prisma.storeInventory.upsert({
          where: {
            storeId_productId_variantId: {
              storeId: alloc.store.id,
              productId: prod.id,
              variantId: v.id,
            },
          },
          create: {
            storeId: alloc.store.id,
            productId: prod.id,
            variantId: v.id,
            quantity: vQty,
            reservedQuantity: 0,
            availableQuantity: vQty,
            lowStockThreshold: 5,
          },
          update: {
            quantity: vQty,
            availableQuantity: vQty,
          },
        });
      }
    }
  }

  console.log("ERP seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding ERP data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
