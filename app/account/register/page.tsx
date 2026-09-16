"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Lock, Mail, User, Phone, AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");

  const isAr = Boolean(pathname?.startsWith("/ar"));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const guestCart = useCartStore.getState().items;
      const guestWishlist = useWishlistStore.getState().items;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          password,
          guestCart,
          guestWishlist,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        // Update client stores with transferred cart and wishlist items
        if (data.mergedCart) {
          useCartStore.getState().setItems(data.mergedCart);
        }
        if (data.mergedWishlist) {
          useWishlistStore.getState().setItems(data.mergedWishlist);
        }
        if (data.user) {
          useAuthStore.getState().setUser(data.user);
        }

        if (redirect) {
          window.location.href = redirect;
        } else {
          window.location.href = isAr ? "/ar/account" : "/account";
        }
      }
    } catch (err) {
      setError(
        isAr
          ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckoutRedirect = redirect && redirect.includes("checkout");

  return (
    <div className="bg-[#ffffff] min-h-[75vh] flex items-center justify-center py-16">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            {isAr ? "انضم إلى راميليت" : "Join Ramillette"}
          </span>
          <h1 className="text-3xl font-extrabold text-[#1c1c1c] mt-1">
            {isAr ? "إنشاء حساب جديد" : "Create an Account"}
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            {isAr
              ? "استمتع بالدفع الأسرع، تتبع الطلبات، والمزايا الحصرية للعطور."
              : "Enjoy faster checkout, order tracking, and exclusive fragrance perks."}
          </p>
        </div>

        {/* Checkout Redirect Notice Banner */}
        {isCheckoutRedirect && (
          <div className="mb-6 p-4 bg-[#faedcd]/40 border border-[#ecdec1] rounded-[8px] flex items-start gap-3 text-xs text-[#8c4c1d] shadow-2xs">
            <ShoppingBag size={18} className="shrink-0 mt-0.5 text-[#b6713e]" />
            <div>
              <p className="font-bold text-[#1c1c1c] mb-0.5">
                {isAr
                  ? "أنشئ حسابك لمتابعة إتمام الطلب"
                  : "Create an account to complete your checkout"}
              </p>
              <p className="text-neutral-600">
                {isAr
                  ? "سيتم نقل سلتك الحالية وقائمة رغباتك تلقائياً وربط طلبك بحسابك لتتبعه في أي وقت."
                  : "Your current bag and wishlist items will be safely transferred so you can track your order history anytime."}
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#fbf9f5] border border-[#e5e5e5] rounded-[8px] p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-[5px] flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  {isAr ? "الاسم الأول" : "First Name"}
                </label>
                <div className="relative flex items-center">
                  <User
                    size={16}
                    className="absolute left-3 text-neutral-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tariq"
                    className="w-full bg-white text-xs pl-9 pr-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  {isAr ? "اسم العائلة" : "Last Name"}
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Al-Kuwari"
                  className="w-full bg-white text-xs px-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                {isAr ? "رقم الهاتف في قطر" : "Qatar Phone Number"}
              </label>
              <div className="relative flex items-center">
                <Phone
                  size={16}
                  className="absolute left-3 text-neutral-400 pointer-events-none"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+974 6600 7788"
                  className="w-full bg-white text-xs pl-9 pr-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                {isAr ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative flex items-center">
                <Mail
                  size={16}
                  className="absolute left-3 text-neutral-400 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white text-xs pl-9 pr-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative flex items-center">
                <Lock
                  size={16}
                  className="absolute left-3 text-neutral-400 pointer-events-none"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isAr ? "6 أحرف على الأقل" : "At least 6 characters"}
                  className="w-full bg-white text-xs pl-9 pr-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12 text-xs font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{isAr ? "إنشاء حساب" : "Create Account"}</span>
              <ArrowRight size={15} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e5e5e5] text-center text-xs text-neutral-600">
            <span>{isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}</span>
            <Link
              href={`${isAr ? "/ar" : ""}/account/login${
                redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
              }`}
              className="font-bold text-[#b6713e] hover:underline"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
