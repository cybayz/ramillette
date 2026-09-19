import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface Props {
  params: Promise<{ code: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { code } = await params;
    const upperCode = code.toUpperCase();
    const body = await request.json();

    const dataToUpdate: any = {};

    if (body.name !== undefined) dataToUpdate.name = body.name.trim();
    if (body.nameAr !== undefined) dataToUpdate.nameAr = body.nameAr.trim();
    if (body.flag !== undefined) dataToUpdate.flag = body.flag.trim();
    if (body.currency !== undefined) dataToUpdate.currency = body.currency.trim().toUpperCase();
    if (body.currencyAr !== undefined) dataToUpdate.currencyAr = body.currencyAr.trim();
    if (body.currencySymbol !== undefined) dataToUpdate.currencySymbol = body.currencySymbol.trim();
    if (body.currencyDecimals !== undefined) dataToUpdate.currencyDecimals = Number(body.currencyDecimals);
    if (body.exchangeRate !== undefined) dataToUpdate.exchangeRate = Number(body.exchangeRate);
    if (body.phonePrefix !== undefined) dataToUpdate.phonePrefix = body.phonePrefix.trim();
    if (body.standardShippingFee !== undefined) dataToUpdate.standardShippingFee = Number(body.standardShippingFee);
    if (body.freeShippingThreshold !== undefined) dataToUpdate.freeShippingThreshold = Number(body.freeShippingThreshold);
    if (body.taxRate !== undefined) dataToUpdate.taxRate = Number(body.taxRate);
    if (body.taxName !== undefined) dataToUpdate.taxName = body.taxName.trim();
    if (body.taxIncludedInPrice !== undefined) dataToUpdate.taxIncludedInPrice = Boolean(body.taxIncludedInPrice);
    if (body.defaultCity !== undefined) dataToUpdate.defaultCity = body.defaultCity.trim();
    if (body.cities !== undefined) dataToUpdate.cities = JSON.stringify(body.cities);
    if (body.boutiqueName !== undefined) dataToUpdate.boutiqueName = body.boutiqueName.trim();
    if (body.boutiqueLocation !== undefined) dataToUpdate.boutiqueLocation = body.boutiqueLocation.trim();
    if (body.boutiqueLocationAr !== undefined) dataToUpdate.boutiqueLocationAr = body.boutiqueLocationAr.trim();
    if (body.deliveryNotice !== undefined) dataToUpdate.deliveryNotice = body.deliveryNotice.trim();
    if (body.deliveryNoticeAr !== undefined) dataToUpdate.deliveryNoticeAr = body.deliveryNoticeAr.trim();
    if (body.phone !== undefined) dataToUpdate.phone = body.phone.trim();
    if (body.supportEmail !== undefined) dataToUpdate.supportEmail = body.supportEmail.trim();
    if (body.orderEmail !== undefined) dataToUpdate.orderEmail = body.orderEmail.trim();
    if (body.paymentMethods !== undefined) dataToUpdate.paymentMethods = JSON.stringify(body.paymentMethods);
    if (body.active !== undefined) dataToUpdate.active = Boolean(body.active);
    if (body.sortOrder !== undefined) dataToUpdate.sortOrder = Number(body.sortOrder);

    const updated = await prisma.country.update({
      where: { code: upperCode },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, country: updated });
  } catch (error) {
    console.error("Admin update country error:", error);
    return NextResponse.json(
      { error: "Failed to update country" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { code } = await params;
    const upperCode = code.toUpperCase();

    // Prevent deleting base country QA
    if (upperCode === "QA") {
      return NextResponse.json(
        { error: "The primary country (Qatar - QA) cannot be deleted. You can deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.country.delete({
      where: { code: upperCode },
    });

    return NextResponse.json({ success: true, message: `Country ${upperCode} deleted.` });
  } catch (error) {
    console.error("Admin delete country error:", error);
    return NextResponse.json(
      { error: "Failed to delete country" },
      { status: 500 }
    );
  }
}
