import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { DiscountType } from "@prisma/client";
import { sendCelebrationEmail } from "@/lib/services/email";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleCelebrationDispatch();
}

export async function POST() {
  return handleCelebrationDispatch();
}

async function handleCelebrationDispatch() {
  try {
    const rawSettings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "birthdayOfferEnabled",
            "birthdayOfferType",
            "birthdayOfferValue",
            "birthdayOfferDaysBefore",
            "birthdayOfferMinSpend",
            "anniversaryOfferEnabled",
            "anniversaryOfferType",
            "anniversaryOfferValue",
            "anniversaryOfferDaysBefore",
            "anniversaryOfferMinSpend",
          ],
        },
      },
    });

    const settings: Record<string, string> = {};
    for (const s of rawSettings) {
      settings[s.key] = s.value;
    }

    // Config defaults
    const bdayEnabled = settings.birthdayOfferEnabled !== "false";
    const bdayType = settings.birthdayOfferType === "FIXED_AMOUNT" ? DiscountType.FIXED_AMOUNT : DiscountType.PERCENTAGE;
    const bdayVal = parseFloat(settings.birthdayOfferValue || "15") || 15;
    const bdayDaysBefore = parseInt(settings.birthdayOfferDaysBefore || "7", 10) || 7;
    const bdayMinSpend = parseFloat(settings.birthdayOfferMinSpend || "0") || 0;

    const annivEnabled = settings.anniversaryOfferEnabled !== "false";
    const annivType = settings.anniversaryOfferType === "FIXED_AMOUNT" ? DiscountType.FIXED_AMOUNT : DiscountType.PERCENTAGE;
    const annivVal = parseFloat(settings.anniversaryOfferValue || "20") || 20;
    const annivDaysBefore = parseInt(settings.anniversaryOfferDaysBefore || "7", 10) || 7;
    const annivMinSpend = parseFloat(settings.anniversaryOfferMinSpend || "0") || 0;

    const now = new Date();
    const currentYear = now.getUTCFullYear();

    let birthdayEmailsSent = 0;
    let anniversaryEmailsSent = 0;
    const dispatchedDetails: Array<{ email: string; type: string; code: string }> = [];

    // --- 1. BIRTHDAY OFFERS DISPATCH ---
    if (bdayEnabled) {
      const bdayTargetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + bdayDaysBefore));
      const targetBdayMonth = bdayTargetDate.getUTCMonth();
      const targetBdayDay = bdayTargetDate.getUTCDate();

      const usersWithBirthday = await prisma.user.findMany({
        where: {
          birthday: { not: null },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          birthday: true,
        },
      });

      for (const u of usersWithBirthday) {
        if (!u.birthday || !u.email || u.email.includes("@ramillette.user")) continue;

        const bMonth = u.birthday.getUTCMonth();
        const bDay = u.birthday.getUTCDate();

        if (bMonth === targetBdayMonth && bDay === targetBdayDay) {
          const couponCode = `BDAY-${u.id.slice(-4).toUpperCase()}-${currentYear}`;

          // Check if coupon for this user & year already generated
          let coupon = await prisma.coupon.findUnique({
            where: { code: couponCode },
          });

          if (!coupon) {
            const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            coupon = await prisma.coupon.create({
              data: {
                code: couponCode,
                type: bdayType,
                value: bdayVal,
                minimumOrder: bdayMinSpend > 0 ? bdayMinSpend : null,
                usageLimit: 1,
                startsAt: now,
                expiresAt,
                description: `Exclusive Birthday Privilege for ${u.firstName || "Valued Customer"} (${currentYear})`,
                isPublic: false,
                active: true,
              },
            });
          }

          // Dispatch celebratory email
          await sendCelebrationEmail({
            customerName: u.firstName || "Valued Customer",
            customerEmail: u.email,
            type: "BIRTHDAY",
            discountDescription: bdayType === DiscountType.FIXED_AMOUNT ? `${bdayVal} QAR OFF` : `${bdayVal}% OFF`,
            couponCode: coupon.code,
            daysValid: 14,
          });

          birthdayEmailsSent++;
          dispatchedDetails.push({ email: u.email, type: "BIRTHDAY", code: coupon.code });
        }
      }
    }

    // --- 2. ANNIVERSARY OFFERS DISPATCH ---
    if (annivEnabled) {
      const annivTargetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + annivDaysBefore));
      const targetAnnivMonth = annivTargetDate.getUTCMonth();
      const targetAnnivDay = annivTargetDate.getUTCDate();

      const usersWithAnniversary = await prisma.user.findMany({
        where: {
          anniversary: { not: null },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          anniversary: true,
        },
      });

      for (const u of usersWithAnniversary) {
        if (!u.anniversary || !u.email || u.email.includes("@ramillette.user")) continue;

        const aMonth = u.anniversary.getUTCMonth();
        const aDay = u.anniversary.getUTCDate();

        if (aMonth === targetAnnivMonth && aDay === targetAnnivDay) {
          const couponCode = `ANNIV-${u.id.slice(-4).toUpperCase()}-${currentYear}`;

          let coupon = await prisma.coupon.findUnique({
            where: { code: couponCode },
          });

          if (!coupon) {
            const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            coupon = await prisma.coupon.create({
              data: {
                code: couponCode,
                type: annivType,
                value: annivVal,
                minimumOrder: annivMinSpend > 0 ? annivMinSpend : null,
                usageLimit: 1,
                startsAt: now,
                expiresAt,
                description: `Exclusive Anniversary Milestone Privilege for ${u.firstName || "Valued Customer"} (${currentYear})`,
                isPublic: false,
                active: true,
              },
            });
          }

          // Dispatch celebratory email
          await sendCelebrationEmail({
            customerName: u.firstName || "Valued Customer",
            customerEmail: u.email,
            type: "ANNIVERSARY",
            discountDescription: annivType === DiscountType.FIXED_AMOUNT ? `${annivVal} QAR OFF` : `${annivVal}% OFF`,
            couponCode: coupon.code,
            daysValid: 14,
          });

          anniversaryEmailsSent++;
          dispatchedDetails.push({ email: u.email, type: "ANNIVERSARY", code: coupon.code });
        }
      }
    }

    return NextResponse.json({
      success: true,
      birthdayEmailsSent,
      anniversaryEmailsSent,
      dispatchedDetails,
      message: `Dispatched ${birthdayEmailsSent} birthday offers and ${anniversaryEmailsSent} anniversary offers for milestones in upcoming window.`,
    });
  } catch (error) {
    console.error("Error running celebration offers cron dispatch:", error);
    return NextResponse.json(
      { error: "Failed to dispatch celebration offers", details: String(error) },
      { status: 500 }
    );
  }
}
