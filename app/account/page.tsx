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
  Store,
  QrCode,
  Coins,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { LogoutButton } from "@/components/account/LogoutButton";
import { SavedAddressesManager } from "@/components/account/SavedAddressesManager";
import { ProfileCelebrationBanner } from "@/components/account/ProfileCelebrationBanner";
import { CelebrationDatesCard } from "@/components/account/CelebrationDatesCard";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/account/login");
  }

  const [user, dbCountry] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
        rewardPointTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true, pickupStore: true },
          take: 10,
        },
      },
    }),
    prisma.country.findUnique({
      where: { code: "QA" },
    }),
  ]);

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

        {/* Profile Completion Celebration Banner (shown if either birthday or anniversary is missing) */}
        <ProfileCelebrationBanner
          hasBirthday={Boolean(user.birthday)}
          hasAnniversary={Boolean(user.anniversary)}
        />

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

        {/* Ramillette VIP Loyalty Rewards Club Card */}
        <div className="mb-10 p-6 sm:p-7 bg-gradient-to-r from-[#fbf9f5] via-[#faedcd]/40 to-[#fbf9f5] border border-[#ecdec1] rounded-[10px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e] shrink-0 shadow-xs">
              <Coins size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1c1c1c]">Ramillette Rewards Club</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#b6713e] text-white tracking-wider uppercase">
                  VIP Member
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
                Earn reward points on every luxury perfume purchase and redeem them against your future orders directly at checkout after quick SMS verification.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-600">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500 fill-amber-400" />
                  <span>Earn <strong>1 Point</strong> per 100 QAR spent</span>
                </span>
                <span>•</span>
                <span><strong>10 Points = 1.00 QAR</strong> direct checkout discount</span>
              </div>
            </div>
          </div>

          <div className="bg-white px-7 py-5 rounded-[8px] border border-[#ecdec1] text-center shrink-0 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Available Points Balance
            </span>
            <span className="text-3xl font-extrabold text-[#b6713e] font-mono block mt-1">
              {user.rewardPoints} <span className="text-sm font-normal text-neutral-400">pts</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 block mt-1.5">
              ≈ QAR {(user.rewardPoints * (Number(dbCountry?.loyaltyPointValue) || 0.10)).toFixed(2)} Value
            </span>
          </div>
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
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                              order.orderType === "PICKUP"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {order.orderType === "PICKUP" ? (
                              <>
                                <Store size={10} />
                                <span>Store Pickup</span>
                              </>
                            ) : (
                              <>
                                <Truck size={10} />
                                <span>Delivery</span>
                              </>
                            )}
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
                            ? "Pay on Delivery"
                            : order.paymentMethod === "CARD_ON_DELIVERY"
                            ? "Card on Delivery"
                            : "Online Payment"}
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

                    {/* Boutique Collection Pass Card (for Pickup Orders) */}
                    {order.orderType === "PICKUP" && (
                      <div className="my-3 p-3.5 bg-[#fbf9f5] border border-[#ecdec1] rounded-[6px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Store size={15} className="text-[#b6713e]" />
                            <span className="text-xs font-bold text-[#1c1c1c]">
                              Boutique Collection Pass
                            </span>
                            {order.pickupCode && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 text-[#faedcd]">
                                PIN: {order.pickupCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-700">
                            <strong>{order.pickupStore?.name || "Ramillette Boutique"}</strong>
                            {order.pickupStore?.address && ` • ${order.pickupStore.address}`}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            📅 Visit Date: <strong>{order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : "Standard store hours"}</strong>
                            {order.pickupTimeSlot && ` (${order.pickupTimeSlot})`}
                          </p>
                          {order.pickedUpAt ? (
                            <p className="text-[10px] text-emerald-700 font-bold">
                              ✓ Collected on {new Date(order.pickedUpAt).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-[10px] text-amber-800">
                              Ready for pickup. Show digital QR code or PIN at store counter.
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/checkout/success?orderNumber=${order.orderNumber}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#1c1c1c] text-[#faedcd] text-xs font-bold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
                        >
                          <QrCode size={12} />
                          <span>View Digital Pass</span>
                        </Link>
                      </div>
                    )}

                    {/* Shipment & Live Tracking Card (for Delivery Orders) */}
                    {order.orderType !== "PICKUP" && (order.status === "SHIPPED" || order.trackingNumber) && (
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
                        <span>{order.orderType === "PICKUP" ? "View Pickup Pass & Receipt" : "View Order Receipt"}</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses & Points Activity (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Recent Points Ledger */}
            <div className="bg-white border border-[#e5e5e5] rounded-[8px] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-[#b6713e]" />
                  <h3 className="text-sm font-bold text-[#1c1c1c]">Recent Points Activity</h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#b6713e]">
                  {user.rewardPoints} pts
                </span>
              </div>

              {user.rewardPointTransactions.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3 text-center">
                  No points activity yet. Complete your first order to start accumulating VIP points!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {user.rewardPointTransactions.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-[6px] bg-[#fbf9f5] border border-[#ecdec1]/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#1c1c1c] text-[11px] truncate max-w-[180px]">
                          {t.description || (t.type === "EARNED" ? "Order reward" : "Redemption")}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(t.createdAt).toLocaleDateString("en-QA", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          t.points > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {t.points > 0 ? `+${t.points}` : t.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Celebration & Milestone Dates Card */}
            <CelebrationDatesCard
              initialBirthday={user.birthday ? user.birthday.toISOString().split("T")[0] : null}
              initialAnniversary={user.anniversary ? user.anniversary.toISOString().split("T")[0] : null}
            />

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
