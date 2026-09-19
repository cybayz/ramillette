import React from "react";
import prisma from "@/lib/db/prisma";
import { ProductForm, CategoryOption, CountryOption } from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  const [categoriesRaw, countriesRaw] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <ProductForm
        categories={categories}
        countries={countries}
        isEdit={false}
      />
    </div>
  );
}
