import React from "react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { ProductListTable } from "@/components/admin/ProductListTable";
import { Plus } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
            Products & Inventory Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create new perfumes, configure olfactory notes, adjust bottle prices, and manage active catalog visibility.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="btn-primary h-9 px-4 text-xs font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>Add New Fragrance</span>
        </Link>
      </div>

      <ProductListTable initialProducts={products} />
    </div>
  );
}
