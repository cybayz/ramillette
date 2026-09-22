import prisma from "@/lib/db/prisma";
import { Prisma, InventoryTransactionType } from "@prisma/client";

export interface StockCheckItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface StockMutationParams {
  storeId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  performedById?: string | null;
  reason?: string | null;
}

/**
 * Ensures a StoreInventory record exists for a product/variant in a store.
 * Creates it with zero quantity if missing.
 */
export async function getOrCreateStoreInventory(
  storeId: string,
  productId: string,
  variantId?: string | null,
  tx: Prisma.TransactionClient = prisma
) {
  // If variantId is undefined or null, we look for variantId = null
  let existing = await tx.storeInventory.findFirst({
    where: {
      storeId,
      productId,
      variantId: variantId || null,
    },
  });

  if (!existing) {
    existing = await tx.storeInventory.create({
      data: {
        storeId,
        productId,
        variantId: variantId || null,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        lowStockThreshold: 10,
      },
    });
  }

  return existing;
}

/**
 * Atomically reserves stock for an incoming online order at a specific store.
 * Throws an error if availableQuantity is insufficient.
 */
export async function reserveStockForOrder(
  params: StockMutationParams,
  tx: Prisma.TransactionClient = prisma
) {
  const { storeId, productId, variantId, quantity, referenceId, performedById } = params;

  const inv = await getOrCreateStoreInventory(storeId, productId, variantId, tx);

  if (inv.availableQuantity < quantity) {
    throw new Error(
      `Insufficient available stock for product ${productId} in store ${storeId}. Required: ${quantity}, Available: ${inv.availableQuantity}`
    );
  }

  const updated = await tx.storeInventory.update({
    where: { id: inv.id },
    data: {
      reservedQuantity: { increment: quantity },
      availableQuantity: { decrement: quantity },
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      storeId,
      productId,
      variantId: variantId || null,
      type: InventoryTransactionType.ONLINE_ORDER_RESERVATION,
      quantity: -quantity,
      previousQuantity: inv.quantity,
      newQuantity: inv.quantity,
      referenceType: "ORDER",
      referenceId: referenceId || null,
      performedById: performedById || null,
      reason: `Reserved ${quantity} units for online order #${referenceId || "N/A"}`,
    },
  });

  return updated;
}

/**
 * Releases reserved stock if an online order is rejected or cancelled.
 */
export async function releaseStockReservation(
  params: StockMutationParams,
  tx: Prisma.TransactionClient = prisma
) {
  const { storeId, productId, variantId, quantity, referenceId, performedById, reason } = params;

  const inv = await getOrCreateStoreInventory(storeId, productId, variantId, tx);

  const releaseQty = Math.min(inv.reservedQuantity, quantity);

  const updated = await tx.storeInventory.update({
    where: { id: inv.id },
    data: {
      reservedQuantity: { decrement: releaseQty },
      availableQuantity: { increment: releaseQty },
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      storeId,
      productId,
      variantId: variantId || null,
      type: InventoryTransactionType.ONLINE_ORDER_CANCELLED,
      quantity: releaseQty,
      previousQuantity: inv.quantity,
      newQuantity: inv.quantity,
      referenceType: "ORDER",
      referenceId: referenceId || null,
      performedById: performedById || null,
      reason: reason || `Released reservation of ${releaseQty} units for order #${referenceId || "N/A"}`,
    },
  });

  return updated;
}

/**
 * Fulfills an order upon shipment:
 * Converts reserved quantity into a permanent physical deduction.
 */
export async function fulfillReservedStock(
  params: StockMutationParams,
  tx: Prisma.TransactionClient = prisma
) {
  const { storeId, productId, variantId, quantity, referenceId, performedById } = params;

  const inv = await getOrCreateStoreInventory(storeId, productId, variantId, tx);

  const updated = await tx.storeInventory.update({
    where: { id: inv.id },
    data: {
      quantity: { decrement: quantity },
      reservedQuantity: { decrement: quantity },
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      storeId,
      productId,
      variantId: variantId || null,
      type: InventoryTransactionType.ONLINE_ORDER,
      quantity: -quantity,
      previousQuantity: inv.quantity,
      newQuantity: inv.quantity - quantity,
      referenceType: "ORDER",
      referenceId: referenceId || null,
      performedById: performedById || null,
      reason: `Shipped ${quantity} units for online order #${referenceId || "N/A"}`,
    },
  });

  return updated;
}

/**
 * Records an immediate physical sale at the in-store POS register.
 * Atomically checks available stock, decrements quantity & availableQuantity,
 * and logs a SALE transaction.
 */
export async function recordPosSale(
  params: StockMutationParams,
  tx: Prisma.TransactionClient = prisma
) {
  const { storeId, productId, variantId, quantity, referenceId, performedById } = params;

  const inv = await getOrCreateStoreInventory(storeId, productId, variantId, tx);

  if (inv.availableQuantity < quantity) {
    throw new Error(
      `Insufficient available stock for physical sale in store ${storeId}. Required: ${quantity}, Available: ${inv.availableQuantity}`
    );
  }

  const updated = await tx.storeInventory.update({
    where: { id: inv.id },
    data: {
      quantity: { decrement: quantity },
      availableQuantity: { decrement: quantity },
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      storeId,
      productId,
      variantId: variantId || null,
      type: InventoryTransactionType.SALE,
      quantity: -quantity,
      previousQuantity: inv.quantity,
      newQuantity: inv.quantity - quantity,
      referenceType: "POS_SALE",
      referenceId: referenceId || null,
      performedById: performedById || null,
      reason: `POS sale receipt #${referenceId || "N/A"}`,
    },
  });

  return updated;
}

/**
 * Manually adjusts stock (Damage, Loss, Manual Correction, or Audit).
 */
export async function adjustStock(
  params: {
    storeId: string;
    productId: string;
    variantId?: string | null;
    quantityDelta: number; // positive or negative
    type: InventoryTransactionType;
    reason: string;
    performedById?: string | null;
  },
  tx: Prisma.TransactionClient = prisma
) {
  const { storeId, productId, variantId, quantityDelta, type, reason, performedById } = params;

  const inv = await getOrCreateStoreInventory(storeId, productId, variantId, tx);

  const newPhysical = Math.max(0, inv.quantity + quantityDelta);
  const newAvailable = Math.max(0, newPhysical - inv.reservedQuantity);

  const updated = await tx.storeInventory.update({
    where: { id: inv.id },
    data: {
      quantity: newPhysical,
      availableQuantity: newAvailable,
    },
  });

  await tx.inventoryTransaction.create({
    data: {
      storeId,
      productId,
      variantId: variantId || null,
      type,
      quantity: quantityDelta,
      previousQuantity: inv.quantity,
      newQuantity: newPhysical,
      referenceType: "MANUAL_ADJUSTMENT",
      performedById: performedById || null,
      reason,
    },
  });

  return updated;
}

/**
 * Smart Order Fulfillment Routing:
 * Finds the optimal store to fulfill an online order.
 * Prioritizes stores in the customer's region/city that have sufficient available stock for ALL items.
 */
export async function findOptimalFulfillmentStore(params: {
  countryCode: string;
  cityName?: string | null;
  items: StockCheckItem[];
}): Promise<{ storeId: string; storeName: string } | null> {
  const { countryCode, cityName, items } = params;

  // 1. Fetch eligible fulfillment stores in this country
  const stores = await prisma.store.findMany({
    where: {
      countryCode: countryCode.toUpperCase(),
      active: true,
      isFulfillmentCenter: true,
    },
    include: {
      region: true,
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
  });

  if (stores.length === 0) return null;

  // Filter candidates: prioritize stores matching region / city name if possible
  const sortedCandidates = [...stores].sort((a, b) => {
    if (cityName) {
      const aMatch =
        a.region.name.toLowerCase().includes(cityName.toLowerCase()) ||
        (a.address && a.address.toLowerCase().includes(cityName.toLowerCase()));
      const bMatch =
        b.region.name.toLowerCase().includes(cityName.toLowerCase()) ||
        (b.address && b.address.toLowerCase().includes(cityName.toLowerCase()));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }
    return b.priority - a.priority;
  });

  // 2. Check each candidate store for sufficient inventory of ALL items
  for (const store of sortedCandidates) {
    let allAvailable = true;

    for (const item of items) {
      const inv = await prisma.storeInventory.findFirst({
        where: {
          storeId: store.id,
          productId: item.productId,
          variantId: item.variantId || null,
        },
      });

      if (!inv || inv.availableQuantity < item.quantity) {
        allAvailable = false;
        break;
      }
    }

    if (allAvailable) {
      return {
        storeId: store.id,
        storeName: store.name,
      };
    }
  }

  // Fallback: If no single store has full stock, return the highest priority store in the country
  // (Order will be marked AWAITING_STOCK or require partial transfer)
  return {
    storeId: sortedCandidates[0].id,
    storeName: sortedCandidates[0].name,
  };
}
