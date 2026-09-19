import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import {
  ProductForm,
  CategoryOption,
  CountryOption,
  ProductFormData,
} from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [productRaw, categoriesRaw, countriesRaw] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { price: "asc" } },
        countries: true,
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.country.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        code: true,
        name: true,
        flag: true,
        currency: true,
        currencySymbol: true,
        exchangeRate: true,
        active: true,
      },
    }),
  ]);

  if (!productRaw) {
    notFound();
  }

  const categories: CategoryOption[] = categoriesRaw;
  const countries: CountryOption[] = countriesRaw.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    currency: c.currency,
    currencySymbol: c.currencySymbol || c.currency,
    exchangeRate: Number(c.exchangeRate),
    active: c.active,
  }));

  const formattedProduct: ProductFormData = {
    id: productRaw.id,
    name: productRaw.name,
    slug: productRaw.slug,
    description: productRaw.description,
    shortDescription: productRaw.shortDescription || "",
    brand: productRaw.brand,
    categoryId: productRaw.categoryId || "",
    sku: productRaw.sku || "",
    basePrice: Number(productRaw.basePrice),
    compareAtPrice: productRaw.compareAtPrice ? Number(productRaw.compareAtPrice) : null,
    stock: productRaw.stock,
    active: productRaw.active,
    featured: productRaw.featured,
    bestseller: productRaw.bestseller,
    newArrival: productRaw.newArrival,
    fragranceFamily: productRaw.fragranceFamily || "",
    topNotes: productRaw.topNotes || "",
    heartNotes: productRaw.heartNotes || "",
    baseNotes: productRaw.baseNotes || "",
    images: productRaw.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || "",
      sortOrder: img.sortOrder,
    })),
    variants: productRaw.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku || "",
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
      active: v.active,
    })),
    countries: productRaw.countries.map((cp) => ({
      country: cp.country,
      price: Number(cp.price),
      compareAtPrice: cp.compareAtPrice ? Number(cp.compareAtPrice) : null,
      stock: cp.stock,
      active: cp.active,
    })),
  };

  return (
    <div className="space-y-6">
      <ProductForm
        initialData={formattedProduct}
        categories={categories}
        countries={countries}
        isEdit={true}
      />
    </div>
  );
}
