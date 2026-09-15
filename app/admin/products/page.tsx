import React from "react";
import prisma from "@/lib/db/prisma";
import { ProductListTable } from "@/components/admin/ProductListTable";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const productsRaw = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    categoryName: p.category?.name,
    basePrice: Number(p.basePrice),
    stock: p.stock,
    active: p.active,
    variantsCount: p.variants.length,
    imageUrl: p.images[0]?.url,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
          Products & Inventory Management
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Monitor stock counts, adjust bottle prices, and manage active catalog visibility.
        </p>
      </div>

      <ProductListTable initialProducts={products} />
    </div>
  );
}
