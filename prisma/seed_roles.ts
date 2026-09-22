import prisma from "../lib/db/prisma";

export const ALL_PERMISSIONS = [
  { key: "admin:access", label: "Central Admin Console", description: "Access main e-commerce platform admin (/admin)" },
  { key: "pos:access", label: "POS Sales Terminal", description: "Ring up offline sales, scan barcodes & take payments (/erp/pos)" },
  { key: "orders:view", label: "View Online Orders", description: "Inspect incoming and assigned online store orders (/erp/orders)" },
  { key: "orders:fulfill", label: "Order Fulfillment", description: "Accept, pick, pack, and ship store-assigned online orders" },
  { key: "inventory:view", label: "View Inventory & Ledger", description: "Inspect current store stock and immutable audit trail (/erp/inventory)" },
  { key: "inventory:adjust", label: "Stock Adjustments", description: "Record manual counts, write-offs, and damage corrections" },
  { key: "transfers:manage", label: "Inter-Store Transfers", description: "Request, dispatch, and receive stock transfers (/erp/transfers)" },
  { key: "purchasing:manage", label: "Supplier Purchasing", description: "Generate POs and intake supplier stock receipts (/erp/purchases)" },
  { key: "returns:manage", label: "Returns Desk", description: "Process in-store and online product returns & inspections (/erp/returns)" },
  { key: "customers:view", label: "Customer Directory", description: "Search customer profiles and transaction histories (/erp/customers)" },
  { key: "reports:view", label: "Shift & Store Analytics", description: "View store revenue, payment method breakdowns, and KPI shifts (/erp/reports)" },
  { key: "roles:manage", label: "Dynamic Role Management", description: "Create roles and configure permission matrices (/erp/roles)" },
  { key: "setup:manage", label: "Store Setup & Provisioning", description: "Configure branches, tax rules, and initial settings (/erp/setup)" },
];

async function seedRoles() {
  console.log("Seeding Dynamic System Roles & Permissions...");

  const roleDefinitions = [
    {
      name: "SUPER_ADMIN",
      displayName: "Super Administrator",
      description: "Full global access to central admin, all stores, configurations, and role permissions.",
      isSystem: true,
      defaultLanding: "/admin",
      permissions: ALL_PERMISSIONS.map((p) => p.key),
    },
    {
      name: "STORE_MANAGER",
      displayName: "Store Manager",
      description: "Full branch-level authority: POS sales, online fulfillment, inventory adjustments, transfers, and shift reports.",
      isSystem: true,
      defaultLanding: "/erp",
      permissions: [
        "pos:access",
        "orders:view",
        "orders:fulfill",
        "inventory:view",
        "inventory:adjust",
        "transfers:manage",
        "purchasing:manage",
        "returns:manage",
        "customers:view",
        "reports:view",
      ],
    },
    {
      name: "CASHIER",
      displayName: "Cashier / Sales Associate",
      description: "Dedicated front-of-house sales cashier: POS terminal, customer lookup, and basic returns.",
      isSystem: true,
      defaultLanding: "/erp/pos",
      permissions: [
        "pos:access",
        "returns:manage",
        "customers:view",
      ],
    },
    {
      name: "INVENTORY_MANAGER",
      displayName: "Inventory & Warehouse Manager",
      description: "Stock keeper: physical counts, adjustments, receiving shipments, and inter-store transfers.",
      isSystem: true,
      defaultLanding: "/erp/inventory",
      permissions: [
        "inventory:view",
        "inventory:adjust",
        "transfers:manage",
        "purchasing:manage",
      ],
    },
    {
      name: "FULFILLMENT_STAFF",
      displayName: "Online Order Fulfillment Staff",
      description: "E-commerce order fulfillment: accepting, picking, packing, and dispatching online orders.",
      isSystem: true,
      defaultLanding: "/erp/orders",
      permissions: [
        "orders:view",
        "orders:fulfill",
      ],
    },
    {
      name: "ACCOUNTANT",
      displayName: "Store Accountant / Auditor",
      description: "Financial auditor: viewing shift sales, revenue reports, and inventory ledger history.",
      isSystem: true,
      defaultLanding: "/erp/reports",
      permissions: [
        "reports:view",
        "inventory:view",
      ],
    },
  ];

  for (const def of roleDefinitions) {
    const role = await prisma.customRole.upsert({
      where: { name: def.name },
      create: {
        name: def.name,
        displayName: def.displayName,
        description: def.description,
        isSystem: def.isSystem,
        defaultLanding: def.defaultLanding,
      },
      update: {
        displayName: def.displayName,
        description: def.description,
        isSystem: def.isSystem,
        defaultLanding: def.defaultLanding,
      },
    });

    // Sync permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    for (const perm of def.permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permission: perm,
        },
      });
    }

    console.log(`Synced role ${role.displayName} with ${def.permissions.length} permissions.`);
  }

  // Link existing staff users to custom roles
  const users = await prisma.user.findMany({
    where: {
      role: { not: "CUSTOMER" },
    },
  });

  for (const user of users) {
    const roleMatch = await prisma.customRole.findUnique({
      where: { name: user.role },
    });

    if (roleMatch) {
      await prisma.user.update({
        where: { id: user.id },
        data: { customRoleId: roleMatch.id },
      });
      console.log(`Linked user ${user.email} (${user.role}) to custom role ${roleMatch.displayName}.`);
    }
  }

  console.log("Role seeding completed successfully!");
}

seedRoles()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
