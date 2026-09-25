import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle2,
  Package,
  MapPin,
  Truck,
  ArrowRight,
  ExternalLink,
  Gift,
  Sparkles,
  Store,
  QrCode,
  Calendar,
  PhoneCall,
  Clock,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateQrDataUrl } from "@/lib/services/qr";

interface PageProps {
  searchParams: Promise<{ orderNumber?: string }>;
  isAr?: boolean;
}

export default async function OrderSuccessPage({ searchParams, isAr = false }: PageProps) {
  const { orderNumber } = await searchParams;

  if (!orderNumber) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto p-4">
          <h1 className="text-2xl font-bold text-[#1c1c1c] mb-2">
            {isAr ? "إشعار الطلب" : "Order Notice"}
          </h1>
          <p className="text-xs text-neutral-500 mb-6">
            {isAr
              ? "لم يتم تحديد رقم الطلب. يرجى التحقق من بريدك الإلكتروني أو سجل الطلبات في حسابك."
              : "No order number was provided. Please check your email or order history in your account."}
          </p>
          <Link href={isAr ? "/ar/shop" : "/shop"} className="btn-primary h-10 px-6 text-xs inline-flex items-center">
            {isAr ? "العودة للتسوق" : "Back to Shop"}
          </Link>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      pickupStore: {
        include: { region: true },
      },
    },
  });

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto p-4">
          <h1 className="text-2xl font-bold text-[#1c1c1c] mb-2">
            {isAr ? "الطلب غير موجود" : "Order Not Found"}
          </h1>
          <p className="text-xs text-neutral-500 mb-6">
            {isAr
              ? `لم نتمكن من العثور على الطلب #${orderNumber}.`
              : `We could not find order #${orderNumber}.`}
          </p>
          <Link href={isAr ? "/ar" : "/"} className="btn-primary h-10 px-6 text-xs inline-flex items-center">
            {isAr ? "العودة للرئيسية" : "Return Home"}
          </Link>
        </div>
      </div>
    );
  }

  const isPickup = order.orderType === "PICKUP";
  const shippingAddr: any = order.shippingAddress || {};

  // Generate real QR code image for pickup orders
  let qrDataUrl = "";
  if (isPickup) {
    try {
      qrDataUrl = await generateQrDataUrl({
        orderNumber: order.orderNumber,
        pickupCode: order.pickupCode || order.orderNumber,
        storeCode: order.pickupStore?.code,
        storeName: order.pickupStore?.name,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        date: order.pickupDate ? order.pickupDate.toISOString() : undefined,
      });
    } catch (e) {
      console.error("Failed to generate QR code on success page:", e);
    }
  }

  return (
    <div className="bg-[#fbf9f5] min-h-screen py-12">
      <div className="ramillette-container max-w-3xl">
        <div className="bg-white rounded-[10px] border border-[#e5e5e5] p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-[#e5e5e5]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d9d00] mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0d9d00]">
              {isPickup
                ? isAr
                  ? "تم تأكيد طلب الاستلام من الفرع"
                  : "Boutique Pickup Confirmed"
                : order.status === "SHIPPED"
                ? isAr
                  ? "تم شحن الطلب"
                  : "Order Shipped & Dispatched"
                : isAr
                ? "تم تأكيد الطلب"
                : "Order Confirmed"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c]">
              {isAr ? `شكراً لك، ${order.customerName}!` : `Thank You, ${order.customerName}!`}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              {isPickup ? (
                <>
                  {isAr ? "تم تسجيل طلبك بنجاح برقم " : "Your order "}
                  <strong className="text-[#1c1c1c]">#{order.orderNumber}</strong>
                  {isAr
                    ? ` وهو جاهز للتحضير للاستلام من ${order.pickupStore?.nameAr || order.pickupStore?.name || "البوتيك"}.`
                    : ` is confirmed for collection from ${order.pickupStore?.name || "our boutique"}.`}
                </>
              ) : (
                <>
                  {isAr ? "تم استلام طلبك بنجاح برقم " : "Your order "}
                  <strong className="text-[#1c1c1c]">#{order.orderNumber}</strong>
                  {isAr
                    ? " وجاري تجهيزه للتوصيل السريع إلى عنوانك."
                    : " has been received and is being prepared for express doorstep delivery."}
                </>
              )}
            </p>
          </div>

          {/* STORE PICKUP PASS WITH QR CODE CARD */}
          {isPickup && (
            <div className="p-6 rounded-[10px] bg-gradient-to-b from-[#fdfbf7] via-white to-[#fbf9f5] border-2 border-[#b6713e]/80 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-[#f0ece1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#faedcd] flex items-center justify-center text-[#b6713e]">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b6713e] block">
                      {isAr ? "بطاقة الاستلام الرقمية الرسمية" : "Official Boutique Pickup Pass"}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#1c1c1c]">
                      {isAr ? "أظهر هذا الرمز لموظف الفرع" : "Show this Pass at Boutique Counter"}
                    </h3>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[10px] text-neutral-400 block uppercase font-semibold">
                    {isAr ? "نوع الطلب" : "Order Type"}
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {isAr ? "استلام من المتجر (مجاني)" : "Store Pickup (FREE)"}
                  </span>
                </div>
              </div>

              {/* QR Code and Pass Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code Graphic Frame */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-[10px] border border-[#ecdac1] shadow-xs">
                  {qrDataUrl ? (
                    <div className="relative w-44 h-44 rounded-[8px] overflow-hidden border border-neutral-100 p-1 bg-white">
                      <Image
                        src={qrDataUrl}
                        alt={`QR Code for Order ${order.orderNumber}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-neutral-100 rounded-[8px] flex items-center justify-center text-neutral-400">
                      <QrCode size={48} />
                    </div>
                  )}

                  <div className="mt-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                      {isAr ? "رمز التحقق للاستلام" : "Pickup Verification PIN"}
                    </span>
                    <span className="font-mono text-base font-extrabold text-[#1c1c1c] tracking-widest bg-[#faedcd] px-3 py-1 rounded inline-block mt-1 border border-[#ecdac1]">
                      {order.pickupCode || order.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Pickup Location & Visit Date info */}
                <div className="md:col-span-7 space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-[8px] bg-[#fbf9f5] border border-[#ecdac1] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#b6713e] font-bold">
                      <Store size={14} />
                      <span>{isAr ? "فرع الاستلام المحدد:" : "Selected Boutique:"}</span>
                    </div>
                    <p className="font-extrabold text-sm text-[#1c1c1c]">
                      {isAr && order.pickupStore?.nameAr
                        ? order.pickupStore.nameAr
                        : order.pickupStore?.name || shippingAddr.storeName || "Ramillette Flagship Boutique"}
                    </p>
                    <p className="text-neutral-600 flex items-start gap-1 pt-0.5">
                      <MapPin size={12} className="text-neutral-400 shrink-0 mt-0.5" />
                      <span>
                        {order.pickupStore?.address || shippingAddr.addressLine1 || "Boutique Location"}
                        {order.pickupStore?.region ? `, ${order.pickupStore.region.name}` : ""}
                      </span>
                    </p>
                    {order.pickupStore?.phone && (
                      <p className="text-neutral-500 flex items-center gap-1 font-mono">
                        <PhoneCall size={12} className="text-neutral-400 shrink-0" />
                        <span>{order.pickupStore.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-[6px] bg-white border border-[#e5e5e5] space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                        <Calendar size={11} className="text-[#b6713e]" />
                        <span>{isAr ? "تاريخ الزيارة" : "Visit Date"}</span>
                      </span>
                      <p className="font-bold text-[#1c1c1c]">
                        {order.pickupDate
                          ? new Date(order.pickupDate).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : isAr ? "خلال ساعات العمل" : "During Boutique Hours"}
                      </p>
                    </div>

                    <div className="p-3 rounded-[6px] bg-white border border-[#e5e5e5] space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                        <Clock size={11} className="text-[#b6713e]" />
                        <span>{isAr ? "فترة الزيارة" : "Time Window"}</span>
                      </span>
                      <p className="font-bold text-[#1c1c1c]">
                        {order.pickupTimeSlot || "10:00 AM - 10:00 PM"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-[6px] bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    <strong>{isAr ? "تذكير: " : "Note: "}</strong>
                    {isAr
                      ? "تم إرسال بطاقة الاستلام هذه مع رمز QR إلى بريدك الإلكتروني. يمكنك حفظ هذه الصفحة أو إظهار الرمز من هاتفك عند الوصول للفرع."
                      : "A copy of this digital pickup pass and QR code has also been sent to your email. You can present it directly on your mobile screen."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Shipment Tracking Banner (for DELIVERY orders only) */}
          {!isPickup && (order.status === "SHIPPED" || order.trackingNumber) && (
            <div className="p-5 rounded-[8px] bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-blue-700" />
                  <span className="text-sm font-bold text-blue-950">
                    {isAr ? "شحنتك في طريقها إليك!" : "Your Shipment is on the Way!"}
                  </span>
                  {order.carrierName && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                      {order.carrierName}
                    </span>
                  )}
                </div>

                {order.trackingNumber && (
                  <p className="text-neutral-700 pt-1">
                    <span className="text-neutral-500 font-medium">
                      {isAr ? "رقم التتبع / بوليصة الشحن: " : "Tracking ID / Waybill: "}
                    </span>
                    <code className="font-mono font-bold text-[#1c1c1c] bg-white px-2 py-0.5 rounded border border-blue-200 text-xs">
                      {order.trackingNumber}
                    </code>
                  </p>
                )}

                {order.shippedAt && (
                  <p className="text-[11px] text-neutral-500">
                    {isAr ? "تاريخ الشحن: " : "Dispatched on "}
                    {new Date(order.shippedAt).toLocaleString(isAr ? "ar-QA" : "en-QA")}
                  </p>
                )}
              </div>

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[6px] bg-[#b6713e] text-white text-xs font-bold hover:bg-[#965a2f] transition-all shadow-sm shrink-0"
                >
                  <span>{isAr ? "تتبع الشحنة الآن" : "Track Shipment Online"}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {/* Delivery or Pickup Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[8px] bg-[#fbf9f5] border border-[#ecdec1]">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#b6713e] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                {isPickup ? <Store size={14} /> : <Truck size={14} />}
                <span>{isPickup ? (isAr ? "فرع الاستلام" : "Collection Location") : (isAr ? "عنوان التوصيل" : "Delivery Destination")}</span>
              </span>
              <p className="font-semibold text-[#1c1c1c]">{shippingAddr.name || order.customerName}</p>
              <p className="text-neutral-600">
                {isPickup
                  ? (order.pickupStore?.address || shippingAddr.addressLine1 || "Boutique Location")
                  : shippingAddr.addressLine1}
              </p>
              {!isPickup && shippingAddr.addressLine2 && (
                <p className="text-neutral-600">{shippingAddr.addressLine2}</p>
              )}
              <p className="text-neutral-600">
                {shippingAddr.area ? `${shippingAddr.area}, ` : ""}
                {shippingAddr.city || (order.country === "AE" ? "Dubai" : "Doha")}, {order.country}
              </p>
              <p className="text-neutral-500 pt-1">Phone: {order.customerPhone}</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#b6713e] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Package size={14} />
                <span>Order Summary</span>
              </span>
              <p className="text-neutral-600">
                Order Type:{" "}
                <strong className={isPickup ? "text-[#b6713e]" : "text-[#1c1c1c]"}>
                  {isPickup ? (isAr ? "استلام من المتجر" : "Boutique Pickup") : (isAr ? "توصيل للعنوان" : "Home Delivery")}
                </strong>
              </p>
              <p className="text-neutral-600">
                Payment Method:{" "}
                <strong className="text-[#1c1c1c]">
                  {order.paymentMethod === "COD"
                    ? (isPickup ? "Pay at Boutique Counter" : "Cash on Delivery")
                    : "Online Payment"}
                </strong>
              </p>
              <p className="text-neutral-600">
                Payment Status:{" "}
                <span className="font-bold text-emerald-700">
                  {order.paymentStatus}
                </span>
              </p>
              <p className="text-neutral-600">
                Fulfillment:{" "}
                <strong className="text-[#1c1c1c]">
                  {isPickup ? "Ready for Collection in 2 Hours" : "Express Regional Courier"}
                </strong>
              </p>
            </div>
          </div>

          {/* Gift Order Details Banner */}
          {order.isGift && (
            <div className="p-5 rounded-[8px] bg-[#faedcd]/25 border border-[#ecdac1] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#faedcd] flex items-center justify-center text-[#b6713e]">
                    <Gift size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1c1c1c]">
                      {isAr ? "طلب إهداء مجهز بعناية" : "Prepared as a Gift Order"}
                    </h3>
                    <p className="text-[11px] text-neutral-600">
                      {order.giftWrapName
                        ? `${isAr ? "طريقة التغليف المحددة:" : "Presentation Style:"} ${order.giftWrapName}`
                        : (order.hasGiftWrap
                            ? (isAr ? "مغلف بصندوق راميليت الملكي مع شريط حريري" : "Hand-wrapped in our signature boutique box with silk ribbon")
                            : (isAr ? "مرفق ببطاقة إهداء فاخرة مجانية" : "Includes complimentary personalized gift card"))}
                    </p>
                  </div>
                </div>
                {order.hasGiftWrap && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#faedcd] text-[#b6713e] font-bold text-[10px] border border-[#ecdec1]">
                    <Sparkles size={11} />
                    <span>{order.giftWrapName || (isAr ? "تغليف هدايا ملكي" : "Luxury Gift Wrap")}</span>
                  </span>
                )}
              </div>

              {order.giftMessage && (
                <div className="p-3 bg-white rounded-[6px] border border-[#ecdec1] text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {isAr ? "رسالة الإهداء المرفقة:" : "Personal Gift Card Message:"}
                  </span>
                  <p className="italic text-neutral-700 font-serif leading-relaxed">
                    &ldquo;{order.giftMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Order Items Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-[#e5e5e5]">
              Ordered Fragrances ({order.items.length})
            </h3>
            <div className="divide-y divide-[#f0ece1]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#1c1c1c]">
                      {item.quantity}x {item.productName}
                    </span>
                    {item.variantName && (
                      <span className="text-neutral-500 ml-1.5">
                        ({item.variantName})
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-[#1c1c1c]">
                    {formatPrice(item.total, order.country)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-[#e5e5e5] space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-medium text-[#1c1c1c]">
                  {formatPrice(order.subtotal, order.country)}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount, order.country)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>{isPickup ? (isAr ? "استلام من البوتيك" : "Boutique Pickup") : (isAr ? "رسوم الشحن" : "Shipping")}</span>
                <span className="font-medium text-[#1c1c1c]">
                  {isPickup || Number(order.shipping) === 0 ? "FREE" : formatPrice(order.shipping, order.country)}
                </span>
              </div>
              {Number(order.giftWrapFee) > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Gift size={12} className="text-[#b6713e]" />
                    <span>{order.giftWrapName || (isAr ? "تغليف هدايا ملكي" : "Luxury Gift Wrap")}</span>
                  </span>
                  <span className="font-medium text-[#1c1c1c]">
                    +{formatPrice(order.giftWrapFee, order.country)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#1c1c1c] pt-2 border-t border-[#e5e5e5]">
                <span>Total Paid / Payable</span>
                <span className="text-[#b6713e]">{formatPrice(order.total, order.country)}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#e5e5e5]">
            <Link href={isAr ? "/ar/shop" : "/shop"} className="flex-1">
              <Button variant="primary" size="lg" className="w-full text-xs font-semibold">
                <span>{isAr ? "متابعة التسوق" : "Continue Shopping"}</span>
                <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
              </Button>
            </Link>
            <Link href={isAr ? "/ar/account" : "/account"} className="flex-1">
              <button className="btn-secondary w-full h-13 text-xs font-semibold flex items-center justify-center gap-1.5">
                <span>{isAr ? "عرض في حسابي" : "View in My Account"}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
