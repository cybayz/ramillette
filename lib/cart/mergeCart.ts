import prisma from "@/lib/db/prisma";

export interface GuestCartItemInput {
  productId: string;
  variantId?: string | null;
  name?: string;
  quantity: number;
  price?: number;
}

export interface GuestWishlistItemInput {
  productId: string;
}

export async function mergeUserCartAndWishlist(
  userId: string,
  guestCart?: GuestCartItemInput[],
  guestWishlist?: GuestWishlistItemInput[]
) {
  // 1. Find or create user cart in database
  let userCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  // 2. Merge guest cart items into database cart
  if (guestCart && Array.isArray(guestCart) && guestCart.length > 0) {
    for (const item of guestCart) {
      if (!item.productId) continue;

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.active) continue;

      const existing = userCart.items.find(
        (ci) =>
          ci.productId === item.productId &&
          (item.variantId ? ci.variantId === item.variantId : !ci.variantId)
      );

      const qty = Math.max(1, item.quantity || 1);
      const price = item.price ?? Number(product.basePrice);

      if (existing) {
        // Append by adding quantities together
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + qty,
          },
        });
      } else {
        // Append new item to the user's cart
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: qty,
            price,
          },
        });
      }
    }
  }

  // 3. Merge guest wishlist items into database wishlist
  if (guestWishlist && Array.isArray(guestWishlist) && guestWishlist.length > 0) {
    for (const item of guestWishlist) {
      if (!item.productId) continue;

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.active) continue;

      await prisma.wishlist.upsert({
        where: {
          userId_productId: {
            userId,
            productId: item.productId,
          },
        },
        create: {
          userId,
          productId: item.productId,
        },
        update: {}, // Already present, do nothing
      });
    }
  }

  // 4. Query full merged cart with product and variant relations
  const finalCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  const formattedCart = (finalCart?.items || []).map((ci) => {
    const variantId = ci.variantId || undefined;
    const id = `${ci.productId}_${variantId || "default"}`;
    const maxStock = ci.variant?.stock ?? ci.product.stock ?? 50;

    return {
      id,
      productId: ci.productId,
      variantId,
      name: ci.product.name,
      variantName: ci.variant?.name || "Standard",
      slug: ci.product.slug,
      price: Number(ci.price),
      image: ci.product.images[0]?.url || "",
      quantity: ci.quantity,
      maxStock,
    };
  });

  // 5. Query full merged wishlist
  const finalWishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
        },
      },
    },
  });

  const formattedWishlist = finalWishlist.map((w) => ({
    productId: w.productId,
    name: w.product.name,
    slug: w.product.slug,
    price: Number(w.product.basePrice),
    image: w.product.images[0]?.url || "",
    categoryName: w.product.category?.name,
  }));

  return {
    cart: formattedCart,
    wishlist: formattedWishlist,
  };
}
