import React from "react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Package, MapPin, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    include: { items: true },
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

  const shippingAddr: any = order.shippingAddress || {};

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
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c]">
              Thank You, {order.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              Your order <strong className="text-[#1c1c1c]">#{order.orderNumber}</strong> has been received and is being prepared for express delivery from our Souq Al Wakra boutique.
            </p>
          </div>

          {/* Delivery Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[8px] bg-[#fbf9f5] border border-[#ecdec1]">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#b6713e] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Truck size={14} />
                <span>Delivery Destination</span>
              </span>
              <p className="font-semibold text-[#1c1c1c]">{shippingAddr.name}</p>
              <p className="text-neutral-600">{shippingAddr.addressLine1}</p>
              {shippingAddr.addressLine2 && (
                <p className="text-neutral-600">{shippingAddr.addressLine2}</p>
              )}
              <p className="text-neutral-600">
                {shippingAddr.area ? `${shippingAddr.area}, ` : ""}
                {shippingAddr.city}, {shippingAddr.country}
              </p>
              <p className="text-neutral-500 pt-1">Phone: {order.customerPhone}</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#b6713e] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Package size={14} />
                <span>Order Summary</span>
              </span>
              <p className="text-neutral-600">
                Payment Method:{" "}
                <strong className="text-[#1c1c1c]">
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
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
                Estimated Delivery:{" "}
                <strong className="text-[#1c1c1c]">
                  2-Hour Express Doha Dispatch
                </strong>
              </p>
            </div>
          </div>

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
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-[#e5e5e5] space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-medium text-[#1c1c1c]">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-medium text-[#1c1c1c]">
                  {Number(order.shipping) === 0 ? "FREE" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#1c1c1c] pt-2 border-t border-[#e5e5e5]">
                <span>Total Paid / Payable</span>
                <span className="text-[#b6713e]">{formatPrice(order.total)}</span>
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
