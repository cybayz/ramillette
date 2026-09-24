import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export const ERP_STORE_COOKIE = "ramillette_erp_store_id";

export const ALLOWED_ERP_ROLES: Role[] = [
  Role.ADMIN,
  Role.SUPER_ADMIN,
  Role.COUNTRY_ADMIN,
  Role.REGION_MANAGER,
  Role.STORE_MANAGER,
  Role.CASHIER,
  Role.INVENTORY_MANAGER,
  Role.FULFILLMENT_STAFF,
  Role.ACCOUNTANT,
];

export interface ErpStoreContext {
  storeId: string;
  storeCode: string;
  storeName: string;
  storeNameAr?: string | null;
  regionName: string;
  countryCode: string;
  countryName: string;
  currency: string;
  taxRate: number;
}

export async function getErpUser() {
  const session = await getSession();
  if (!session || !session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      customRole: {
        include: {
          permissions: true,
        },
      },
      assignedStore: {
        include: { region: true, country: true },
      },
      userStores: {
        include: {
          store: {
            include: { region: true, country: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Check role authorization (either Enum or custom role)
  if (!ALLOWED_ERP_ROLES.includes(user.role) && !user.customRoleId) {
    return null;
  }

  return user;
}

export function getUserPermissions(user: any): string[] {
  if (!user) return [];
  if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN || user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return [
      "*",
      "admin:access",
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
      "roles:manage",
      "setup:manage",
    ];
  }

  if (user.customRole?.permissions && user.customRole.permissions.length > 0) {
    return user.customRole.permissions.map((p: any) => p.permission);
  }

  // Fallback defaults based on Role enum
  switch (user.role) {
    case Role.STORE_MANAGER:
      return [
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
      ];
    case Role.CASHIER:
      return ["pos:access", "returns:manage", "customers:view"];
    case Role.INVENTORY_MANAGER:
      return ["inventory:view", "inventory:adjust", "transfers:manage", "purchasing:manage"];
    case Role.FULFILLMENT_STAFF:
      return ["orders:view", "orders:fulfill"];
    case Role.ACCOUNTANT:
      return ["reports:view", "inventory:view"];
    default:
      return ["pos:access"];
  }
}

export function hasPermission(user: any, permissionKey: string): boolean {
  if (!user) return false;
  if (user.role === Role.SUPER_ADMIN || user.role === "SUPER_ADMIN") return true;
  const perms = getUserPermissions(user);
  return perms.includes("*") || perms.includes(permissionKey);
}

export function getDefaultLandingPage(user: any): string {
  if (!user) return "/account";
  if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN || user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return "/admin";
  }
  if (user.customRole?.defaultLanding) {
    return user.customRole.defaultLanding;
  }
  switch (user.role) {
    case Role.CASHIER:
      return "/erp/pos";
    case Role.FULFILLMENT_STAFF:
      return "/erp/orders";
    case Role.INVENTORY_MANAGER:
      return "/erp/inventory";
    case Role.ACCOUNTANT:
      return "/erp/reports";
    case Role.STORE_MANAGER:
    case Role.REGION_MANAGER:
    case Role.COUNTRY_ADMIN:
      return "/erp";
    default:
      return "/erp";
  }
}

export async function getActiveErpStore() {
  const cookieStore = await cookies();
  const selectedStoreId = cookieStore.get(ERP_STORE_COOKIE)?.value;

  const user = await getErpUser();
  if (!user) return null;

  let store = null;

  // 1. Try selected store from cookie
  if (selectedStoreId) {
    store = await prisma.store.findUnique({
      where: { id: selectedStoreId, active: true },
      include: { region: true, country: true },
    });
  }

  // 2. Fall back to user's assignedStore
  if (!store && user.assignedStoreId) {
    store = await prisma.store.findUnique({
      where: { id: user.assignedStoreId, active: true },
      include: { region: true, country: true },
    });
  }

  // 3. Fall back to first available active store
  if (!store) {
    store = await prisma.store.findFirst({
      where: { active: true },
      include: { region: true, country: true },
      orderBy: { priority: "desc" },
    });
  }

  if (!store) return null;

  const context: ErpStoreContext = {
    storeId: store.id,
    storeCode: store.code,
    storeName: store.name,
    storeNameAr: store.nameAr,
    regionName: store.region.name,
    countryCode: store.countryCode,
    countryName: store.country.name,
    currency: store.currency,
    taxRate: store.taxRate ? Number(store.taxRate) : Number(store.country.taxRate),
  };

  return {
    user,
    store,
    context,
  };
}

export function canAccessPos(userOrRole: any): boolean {
  if (typeof userOrRole === "string") {
    const allowed: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.COUNTRY_ADMIN,
      Role.REGION_MANAGER,
      Role.STORE_MANAGER,
      Role.CASHIER,
    ];
    return allowed.includes(userOrRole as Role);
  }
  return hasPermission(userOrRole, "pos:access");
}

export function canFulfillOrders(userOrRole: any): boolean {
  if (typeof userOrRole === "string") {
    const allowed: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.COUNTRY_ADMIN,
      Role.REGION_MANAGER,
      Role.STORE_MANAGER,
      Role.FULFILLMENT_STAFF,
    ];
    return allowed.includes(userOrRole as Role);
  }
  return hasPermission(userOrRole, "orders:fulfill");
}

export function canManageInventory(userOrRole: any): boolean {
  if (typeof userOrRole === "string") {
    const allowed: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.COUNTRY_ADMIN,
      Role.REGION_MANAGER,
      Role.STORE_MANAGER,
      Role.INVENTORY_MANAGER,
    ];
    return allowed.includes(userOrRole as Role);
  }
  return hasPermission(userOrRole, "inventory:view");
}

export function canViewReports(userOrRole: any): boolean {
  if (typeof userOrRole === "string") {
    const allowed: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.COUNTRY_ADMIN,
      Role.REGION_MANAGER,
      Role.STORE_MANAGER,
      Role.ACCOUNTANT,
    ];
    return allowed.includes(userOrRole as Role);
  }
  return hasPermission(userOrRole, "reports:view");
}

export function canManageReturns(userOrRole: any): boolean {
  if (typeof userOrRole === "string") {
    const allowed: Role[] = [
      Role.ADMIN,
      Role.SUPER_ADMIN,
      Role.COUNTRY_ADMIN,
      Role.REGION_MANAGER,
      Role.STORE_MANAGER,
      Role.CASHIER,
    ];
    return allowed.includes(userOrRole as Role);
  }
  return hasPermission(userOrRole, "returns:manage");
}
