import React from "react";
import prisma from "@/lib/db/prisma";
import { CouponsManager } from "@/components/admin/CouponsManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const couponsRaw = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const coupons = couponsRaw.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minimumOrder: c.minimumOrder ? Number(c.minimumOrder) : null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    active: c.active,
  }));

  return <CouponsManager initialCoupons={coupons} />;
}
