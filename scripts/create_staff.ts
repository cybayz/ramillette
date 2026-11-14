import prisma from "../lib/db/prisma";
import * as bcrypt from "bcryptjs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Role } from "@prisma/client";

const VALID_ROLES = [
  "CASHIER",
  "STORE_MANAGER",
  "INVENTORY_MANAGER",
  "FULFILLMENT_STAFF",
  "ACCOUNTANT",
  "REGION_MANAGER",
  "COUNTRY_ADMIN",
  "ADMIN",
  "SUPER_ADMIN",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        params[key] = next;
        i++;
      } else {
        params[key] = "true";
      }
    }
  }
  return params;
}

async function main() {
  const params = parseArgs();

  if (params.help || params.h) {
    console.log(`
Usage:
  npm run staff:create -- [options]
  npx tsx scripts/create_staff.ts [options]

Options:
  --email       Staff email address (e.g. cashier.doha@ramillette.com)
  --role        Staff role: CASHIER, STORE_MANAGER, INVENTORY_MANAGER, FULFILLMENT_STAFF, ACCOUNTANT, ADMIN
  --store       Store Code: DOH-001, DOH-002, DXB-001, RUH-001, KWI-001
  --password    Temporary password (default: Ramillette@2026)
  --firstName   First Name (optional)
  --lastName    Last Name (optional)
  --phone       Phone number (optional)

Examples:
  npm run staff:create -- --email cashier.doha@ramillette.com --store DOH-001 --role CASHIER --firstName Noor --lastName Salim
  npm run staff:create -- --email manager.doha@ramillette.com --store DOH-001 --role STORE_MANAGER
  npm run staff:create (runs in interactive prompt mode)
`);
    process.exit(0);
  }

  console.log("\n==============================================");
  console.log("       Ramillette Store Staff Provisioning    ");
  console.log("==============================================\n");

  let email = params.email;
  let password = params.password;
  let roleInput = params.role ? params.role.toUpperCase() : "";
  let storeCode = params.store ? params.store.toUpperCase() : "";
  let firstName = params.firstName || params.first || "";
  let lastName = params.lastName || params.last || "";
  let phone = params.phone || "";

  // Interactive mode if arguments are missing
  if (!email || !password || !roleInput || !storeCode) {
    const rl = readline.createInterface({ input, output });

    try {
      console.log("Interactive setup (press enter to submit each):\n");

      if (!email) {
        email = (await rl.question("1. Staff Email (e.g. cashier.doha@ramillette.com): ")).trim();
      }

      if (!password) {
        password = (await rl.question("2. Temporary Password [default: Ramillette@2026]: ")).trim() || "Ramillette@2026";
      }

      if (!roleInput) {
        console.log(`\nAvailable Roles: ${VALID_ROLES.join(", ")}`);
        roleInput = (await rl.question("3. Role [default: CASHIER]: ")).trim().toUpperCase() || "CASHIER";
      }

      if (!storeCode) {
        // Fetch stores to present options
        const stores = await prisma.store.findMany({
          select: { code: true, name: true, countryCode: true },
          orderBy: { code: "asc" },
        });

        if (stores.length > 0) {
          console.log("\nAvailable Stores:");
          stores.forEach((s) => console.log(`  - [${s.code}] ${s.name} (${s.countryCode})`));
        }
        storeCode = (await rl.question("\n4. Store Code (e.g. DOH-001): ")).trim().toUpperCase();
      }

      if (!firstName) {
        firstName = (await rl.question("5. First Name (optional): ")).trim();
      }

      if (!lastName) {
        lastName = (await rl.question("6. Last Name (optional): ")).trim();
      }

      if (!phone) {
        phone = (await rl.question("7. Phone Number (optional): ")).trim();
      }
    } finally {
      rl.close();
    }
  }

  if (!email) {
    console.error("Error: Email is required.");
    process.exit(1);
  }

  if (!VALID_ROLES.includes(roleInput)) {
    console.error(`Error: Invalid role "${roleInput}". Valid choices: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  // Find store by code
  const store = await prisma.store.findUnique({
    where: { code: storeCode },
  });

  if (!store) {
    console.error(`\nStore with code "${storeCode}" was not found!`);
    const available = await prisma.store.findMany({ select: { code: true, name: true } });
    if (available.length > 0) {
      console.log("Existing stores:");
      available.forEach((s) => console.log(`  - ${s.code}: ${s.name}`));
    }
    process.exit(1);
  }

  // Find optional custom role match if exists
  const customRole = await prisma.customRole.findFirst({
    where: { name: roleInput },
  });

  console.log(`\nCreating / Updating user: ${email}...`);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      role: roleInput as Role,
      customRoleId: customRole ? customRole.id : null,
      assignedStoreId: store.id,
    },
    update: {
      passwordHash,
      role: roleInput as Role,
      customRoleId: customRole ? customRole.id : undefined,
      assignedStoreId: store.id,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(phone ? { phone } : {}),
    },
  });

  // Assign user store default relation
  await prisma.userStore.upsert({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId: store.id,
      },
    },
    create: {
      userId: user.id,
      storeId: store.id,
      isDefault: true,
    },
    update: {
      isDefault: true,
    },
  });

  console.log("\nSuccess! Staff account provisioned:");
  console.log(`  - User ID:        ${user.id}`);
  console.log(`  - Email:          ${user.email}`);
  console.log(`  - Name:           ${firstName || ""} ${lastName || ""}`.trim() || "(None)");
  console.log(`  - Role:           ${user.role}`);
  console.log(`  - Store:          ${store.name} [${store.code}]`);
  console.log(`  - Landing Target: ${roleInput === "CASHIER" ? "/erp/pos (POS Register)" : roleInput === "STORE_MANAGER" ? "/erp (Store Dashboard)" : "/erp"}`);
  console.log("\nThe user can now log in at /account/login and access their assigned workspace.\n");
}

main()
  .catch((err) => {
    console.error("Fatal error creating staff user:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
