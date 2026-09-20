import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import {
  User,
  Package,
  MapPin,
  ShoppingBag,
  ExternalLink,
  Truck,
} from "lucide-react";
import { LogoutButton } from "@/components/account/LogoutButton";
import { SavedAddressesManager } from "@/components/account/SavedAddressesManager";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/account/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect("/account/login");
  }

  return (
    <div className="bg-[#ffffff] min-h-screen py-10">
      <div className="ramillette-container">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#b6713e]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1c] font-semibold">My Account</span>
        </nav>

        {/* Account Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-[#fbf9f5] border border-[#ecdec1] rounded-[8px] mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e] font-extrabold text-xl">
              {user.firstName ? user.firstName[0] : user.phone ? "📱" : "R"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1c1c1c]">
                Welcome back, {user.firstName || user.phone || (!user.email.includes("@ramillette.user") ? user.email : "Customer")}!
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                {!user.email.includes("@ramillette.user") ? user.email : "Mobile Account"} • {user.phone || "No phone registered"}
              </p>
            </div>
          </div>

          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order History (Left Column) */}
          <div id="orders" className="lg:col-span-8 space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#b6713e]" />
                <h2 className="text-lg font-bold text-[#1c1c1c]">Order History</h2>
              </div>
              <span className="text-xs text-neutral-500">
                {user.orders.length} order{user.orders.length !== 1 ? "s" : ""}
              </span>
            </div>

            {user.orders.length === 0 ? (
              <div className="py-12 text-center bg-[#fbf9f5] rounded-[8px] border border-[#e5e5e5] p-6">
                <ShoppingBag
                  size={32}
                  className="mx-auto text-neutral-400 mb-3"
                />
                <h3 className="text-sm font-semibold text-[#1c1c1c] mb-1">
                  No orders placed yet
                </h3>
                <p className="text-xs text-neutral-500 mb-5">
                  Browse our perfume catalog and experience 2-hour Doha express delivery.
                </p>
                <Link href="/shop" className="btn-primary h-9 px-5 text-xs inline-flex items-center">
                  Shop Fragrances
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-white border border-[#e5e5e5] rounded-[8px] hover:border-[#b6713e] transition-colors shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0ece1]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1c1c1c]">
                            Order #{order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 mt-0.5 block">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-QA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#1c1c1c]">
                          {formatPrice(order.total)}
                        </span>
                        <span className="block text-[11px] text-neutral-500">
                          {order.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : "Online Card"}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Snapshot */}
                    <div className="py-3 space-y-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-xs text-neutral-600"
                        >
                          <span>
                            {item.quantity}x {item.productName}{" "}
                            {item.variantName && `(${item.variantName})`}
                          </span>
                          <span className="font-medium text-[#1c1c1c]">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipment & Live Tracking Card */}
                    {(order.status === "SHIPPED" || order.trackingNumber) && (
                      <div className="my-3 p-3.5 bg-[#fbf9f5] border border-[#ecdec1] rounded-[6px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Truck size={15} className="text-[#b6713e]" />
                            <span className="text-xs font-bold text-[#1c1c1c]">
                              Shipment Dispatched
                            </span>
                            {order.carrierName && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                {order.carrierName}
                              </span>
                            )}
                          </div>

                          {order.trackingNumber && (
                            <p className="text-xs text-neutral-600">
                              <span className="text-neutral-400">Tracking ID: </span>
                              <code className="font-mono font-bold text-[#1c1c1c] bg-white px-1.5 py-0.5 rounded border border-[#e5e5e5]">
                                {order.trackingNumber}
                              </code>
                            </p>
                          )}

                          {order.shippedAt && (
                            <p className="text-[10px] text-neutral-400">
                              Dispatched on{" "}
                              {new Date(order.shippedAt).toLocaleDateString("en-QA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>

                        {order.trackingUrl ? (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#b6713e] text-white text-xs font-bold hover:bg-[#965a2f] transition-all shadow-xs shrink-0"
                          >
                            <span>Track Shipment</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : order.trackingNumber ? (
                          <span className="text-[11px] font-semibold text-[#b6713e] shrink-0">
                            In Transit
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/checkout/success?orderNumber=${order.orderNumber}`}
                        className="text-xs font-semibold text-[#b6713e] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Order Receipt</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            <SavedAddressesManager
              initialAddresses={user.addresses}
              defaultName={
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                (!user.email.includes("@ramillette.user") ? user.email : user.phone || "")
              }
              defaultPhone={user.phone || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
