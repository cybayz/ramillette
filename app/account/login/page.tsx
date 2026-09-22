"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCountryStore } from "@/lib/store/useCountryStore";
import {
  Lock,
  Mail,
  Smartphone,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const GCC_PHONE_CODES = [
  { code: "QA", prefix: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "AE", prefix: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "BH", prefix: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "SA", prefix: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "KW", prefix: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "OM", prefix: "+968", name: "Oman", flag: "🇴🇲" },
];

function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");

  const isAr = Boolean(pathname?.startsWith("/ar"));
  const { config } = useCountryStore();

  // Auth Mode: "phone" (default fast flow) or "email" (standard fallback)
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");

  // Phone OTP Flow State
  const [phoneStep, setPhoneStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [countryPrefix, setCountryPrefix] = useState<string>(config.phonePrefix || "+974");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Email Flow State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Shared State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial country prefix with active store region
  useEffect(() => {
    if (config.phonePrefix) {
      setCountryPrefix(config.phonePrefix);
    }
  }, [config.phonePrefix]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSuccessfulAuth = (data: any) => {
    // Update client stores with merged cart & wishlist items
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
    } else if (data.landingPage) {
      window.location.href = data.landingPage;
    } else if (data.user?.role === "ADMIN" || data.user?.role === "SUPER_ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = isAr ? "/ar/account" : "/account";
    }
  };

  // --- Send OTP Handler ---
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setDevOtp(null);

    const rawDigits = phoneNumber.replace(/\D/g, "");
    if (rawDigits.length < 5) {
      setError(
        isAr
          ? "يرجى إدخال رقم هاتف محمول صالح"
          : "Please enter a valid mobile number."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          countryPrefix,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
      } else {
        setPhoneStep("enter_otp");
        setCountdown(45);
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
      }
    } catch (err) {
      setError(
        isAr
          ? "حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة مرة أخرى."
          : "An error occurred while sending verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Verify OTP Handler ---
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    setError("");

    if (!code || code.trim().length !== 6) {
      setError(
        isAr
          ? "يرجى إدخال رمز التحقق المكون من 6 أرقام"
          : "Please enter the 6-digit verification code."
      );
      return;
    }

    setIsLoading(true);

    try {
      const guestCart = useCartStore.getState().items;
      const guestWishlist = useWishlistStore.getState().items;

      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber.trim(),
          countryPrefix,
          code: code.trim(),
          guestCart,
          guestWishlist,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
      } else {
        handleSuccessfulAuth(data);
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

  // --- Email Login Handler ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const guestCart = useCartStore.getState().items;
      const guestWishlist = useWishlistStore.getState().items;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          guestCart,
          guestWishlist,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        handleSuccessfulAuth(data);
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
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#b6713e]">
            <Sparkles size={12} />
            <span>
              {authMode === "phone"
                ? isAr
                  ? "تسجيل دخول سريع"
                  : "Fast Mobile Sign In"
                : isAr
                ? "بوابة العملاء"
                : "Customer Portal"}
            </span>
          </span>
          <h1 className="text-3xl font-extrabold text-[#1c1c1c] mt-1">
            {isAr ? "تسجيل الدخول إلى راميليت" : "Sign In to Ramillette"}
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            {authMode === "phone"
              ? isAr
                ? "أدخل رقم هاتفك لتأكيد الدخول الفوري عبر رمز التحقق (OTP)."
                : "Enter your mobile number to sign in instantly via OTP."
              : isAr
              ? "الوصول إلى طلباتك، عناوين التوصيل، وقائمة الرغبات."
              : "Access your orders, saved addresses, and wishlist."}
          </p>
        </div>

        {/* Checkout Redirect Notice Banner */}
        {isCheckoutRedirect && (
          <div className="mb-6 p-4 bg-[#faedcd]/40 border border-[#ecdec1] rounded-[8px] flex items-start gap-3 text-xs text-[#8c4c1d] shadow-2xs">
            <ShoppingBag size={18} className="shrink-0 mt-0.5 text-[#b6713e]" />
            <div>
              <p className="font-bold text-[#1c1c1c] mb-0.5">
                {isAr
                  ? "تسجيل الدخول السريع لمتابعة الدفع"
                  : "Fast sign in to complete your checkout"}
              </p>
              <p className="text-neutral-600">
                {isAr
                  ? "قم بتأكيد رقم جوالك وسنربط سلتك وعنوانك تلقائياً بحسابك."
                  : "Verify your phone number and we'll link your cart and delivery details automatically."}
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

          {/* ======================================================== */}
          {/* 1. FAST MOBILE NUMBER + OTP FLOW (PRIMARY)               */}
          {/* ======================================================== */}
          {authMode === "phone" ? (
            <div>
              {phoneStep === "enter_phone" ? (
                /* Step A: Input Mobile Number */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      {isAr ? "رقم الهاتف المحمول" : "Mobile Phone Number"}
                    </label>
                    <div className="flex rounded-[5px] border border-[#e5e5e5] bg-white overflow-hidden focus-within:border-[#b6713e] transition-colors">
                      {/* Country Flag & Dial Prefix */}
                      <div className="relative border-r border-[#e5e5e5] bg-neutral-50 px-2.5 flex items-center shrink-0">
                        <select
                          value={countryPrefix}
                          onChange={(e) => setCountryPrefix(e.target.value)}
                          className="bg-transparent text-xs font-bold text-[#1c1c1c] focus:outline-none cursor-pointer pr-4 appearance-none"
                        >
                          {GCC_PHONE_CODES.map((item) => (
                            <option key={item.code} value={item.prefix}>
                              {item.flag} {item.prefix}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={11}
                          className="absolute right-1 text-neutral-400 pointer-events-none"
                        />
                      </div>

                      {/* Phone Input */}
                      <div className="relative flex-1 flex items-center">
                        <Smartphone
                          size={16}
                          className="absolute left-3 text-neutral-400 pointer-events-none"
                        />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="5512 3456"
                          autoFocus
                          className="w-full bg-white text-xs pl-9 pr-3 py-3 focus:outline-none font-medium"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5">
                      {isAr
                        ? "سنرسل رمز تحقق مكون من 6 أرقام عبر رسالة نصية قصيرة."
                        : "We'll send a 6-digit one-time code to confirm your number."}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full h-12 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>{isAr ? "إرسال رمز التحقق" : "Send Verification Code"}</span>
                    <ArrowRight size={15} />
                  </Button>
                </form>
              ) : (
                /* Step B: Enter 6-Digit OTP */
                <div className="space-y-4">
                  <div className="text-center pb-2">
                    <span className="text-xs text-neutral-500 block">
                      {isAr ? "تم إرسال رمز التحقق إلى" : "Verification code sent to"}
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="font-mono font-bold text-sm text-[#1c1c1c]">
                        {countryPrefix} {phoneNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep("enter_phone");
                          setOtpCode("");
                          setError("");
                        }}
                        className="text-[11px] text-[#b6713e] font-semibold hover:underline"
                      >
                        {isAr ? "تعديل" : "Edit"}
                      </button>
                    </div>
                  </div>

                  {/* Dev / Demo OTP Helper Badge */}
                  {devOtp && (
                    <div className="p-2.5 rounded-[6px] bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-700 block">
                          Demo Mode Code:
                        </span>
                        <code className="font-mono font-bold text-sm text-[#1c1c1c]">
                          {devOtp}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(devOtp);
                          handleVerifyOtp(devOtp);
                        }}
                        className="px-2.5 py-1 rounded bg-[#faedcd] border border-[#ecdec1] text-[11px] font-bold text-[#b6713e] hover:bg-[#faedcd]/80"
                      >
                        {isAr ? "تعبئة تلقائية" : "1-Click Auto Fill"}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-center">
                      {isAr ? "أدخل رمز التحقق (6 أرقام)" : "Enter 6-Digit Code"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtpCode(val);
                        if (val.length === 6) {
                          handleVerifyOtp(val);
                        }
                      }}
                      placeholder="••••••"
                      autoFocus
                      className="w-full bg-white text-center text-xl font-mono tracking-[0.4em] font-bold py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  {/* Resend & Verify Button */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    {countdown > 0 ? (
                      <span className="text-neutral-400 text-[11px]">
                        {isAr
                          ? `إعادة الإرسال بعد ${countdown} ثانية`
                          : `Resend code in ${countdown}s`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSendOtp()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b6713e] hover:underline cursor-pointer"
                      >
                        <RotateCcw size={11} />
                        <span>{isAr ? "إعادة إرسال الرمز" : "Resend Code"}</span>
                      </button>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={otpCode.length !== 6 || isLoading}
                    isLoading={isLoading}
                    onClick={() => handleVerifyOtp()}
                    className="w-full h-12 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {isAr ? "تأكيد وتسجيل الدخول" : "Verify & Sign In"}
                    </span>
                  </Button>
                </div>
              )}

              {/* Toggle to Email ID Option Below */}
              <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                <div className="relative flex items-center justify-center mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e5e5e5]" />
                  </div>
                  <span className="relative bg-[#fbf9f5] px-3 text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                    {isAr ? "أو" : "OR"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("email");
                    setError("");
                  }}
                  className="w-full py-2.5 px-4 rounded-[6px] border border-[#e5e5e5] bg-white text-xs font-semibold text-neutral-700 hover:border-[#b6713e] hover:text-[#b6713e] transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Mail size={14} className="text-neutral-500" />
                  <span>
                    {isAr
                      ? "استخدام البريد الإلكتروني بدلاً من ذلك"
                      : "Continue with Email ID instead"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. CLASSIC EMAIL & PASSWORD FLOW (FALLBACK OPTION)       */
            /* ======================================================== */
            <div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                      autoFocus
                      className="w-full bg-white text-xs pl-9 pr-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock
                      size={16}
                      className="absolute left-3 text-neutral-400 pointer-events-none"
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white text-xs pl-9 pr-3 py-3 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full h-12 text-xs font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-sm"
                >
                  <span>{isAr ? "تسجيل الدخول" : "Sign In with Email"}</span>
                  <ArrowRight size={15} />
                </Button>
              </form>

              {/* Switch back to Mobile OTP */}
              <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("phone");
                    setError("");
                  }}
                  className="w-full py-2.5 px-4 rounded-[6px] border border-[#ecdec1] bg-[#faedcd]/40 text-xs font-bold text-[#b6713e] hover:bg-[#faedcd] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone size={14} />
                  <span>
                    {isAr
                      ? "← الدخول عبر رقم الجوال السريع (OTP)"
                      : "← Back to Fast Mobile OTP Login"}
                  </span>
                </button>
              </div>

              {/* Register Link */}
              <div className="mt-4 text-center text-xs text-neutral-600">
                <span>{isAr ? "ليس لديك حساب بعد؟ " : "Don't have an account yet? "}</span>
                <Link
                  href={`${isAr ? "/ar" : ""}/account/register${
                    redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
                  }`}
                  className="font-bold text-[#b6713e] hover:underline"
                >
                  {isAr ? "إنشاء حساب" : "Create Account"}
                </Link>
              </div>

              {/* Demo Accounts box */}
              <div className="mt-4 p-3 bg-neutral-100 rounded-[5px] text-[11px] text-neutral-600">
                <span className="font-bold">{isAr ? "حسابات تجريبية:" : "Demo Accounts:"}</span>
                <br />
                Admin: <code>admin@ramillette.com</code> / <code>Admin@123456</code>
                <br />
                Customer: <code>customer@ramillette.com</code> / <code>Customer@123456</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
