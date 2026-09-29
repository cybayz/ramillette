"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CountryCode } from "@/lib/country/config";
import { formatPrice } from "@/lib/utils";

interface CheckoutLoyaltyRewardsProps {
  country: CountryCode | string;
  isAr: boolean;
  subtotal: number;
  discountFromCoupon: number;
  customerPhone: string;
  onApplyLoyalty: (points: number, discountAmount: number, token: string | null) => void;
  appliedPoints: number;
  appliedDiscount: number;
}

export function CheckoutLoyaltyRewards({
  country,
  isAr,
  subtotal,
  discountFromCoupon,
  customerPhone,
  onApplyLoyalty,
  appliedPoints,
  appliedDiscount,
}: CheckoutLoyaltyRewardsProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [config, setConfig] = useState<{
    loyaltyEnabled: boolean;
    loyaltyEarnType: string;
    loyaltyEarnValue: number;
    loyaltyPointValue: number;
    loyaltyMinRedeemPoints: number;
  }>({
    loyaltyEnabled: true,
    loyaltyEarnType: "SPEND_RATIO",
    loyaltyEarnValue: 100,
    loyaltyPointValue: 0.10,
    loyaltyMinRedeemPoints: 10,
  });

  // Modal / Inline Flow State
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [pointsInput, setPointsInput] = useState<number>(0);
  const [otpStep, setOtpStep] = useState<"SELECT_POINTS" | "ENTER_OTP">("SELECT_POINTS");
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Fetch status on mount or country change
  useEffect(() => {
    setLoading(true);
    fetch(`/api/loyalty/status?country=${country}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          setUserPoints(data.points || 0);
          setRegisteredPhone(data.phone || "");
          if (data.config) {
            setConfig(data.config);
          }
          if (data.points > 0) {
            setPointsInput(Math.min(data.points, 1000));
          }
        } else {
          setAuthenticated(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load loyalty status:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [country]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (loading || !authenticated || !config.loyaltyEnabled) {
    return null;
  }

  // Calculate points that will be earned on this order
  const netSpend = Math.max(0, subtotal - discountFromCoupon - appliedDiscount);
  let orderEarnedPoints = 0;
  if (config.loyaltyEarnType === "FLAT") {
    orderEarnedPoints = Math.floor(config.loyaltyEarnValue);
  } else if (config.loyaltyEarnType === "PERCENTAGE") {
    orderEarnedPoints = Math.floor((netSpend * config.loyaltyEarnValue) / 100);
  } else {
    // SPEND_RATIO
    const ratio = config.loyaltyEarnValue > 0 ? config.loyaltyEarnValue : 100;
    orderEarnedPoints = Math.floor(netSpend / ratio);
  }

  // Estimate discount for the selected points
  const candidateDiscount = Number((pointsInput * config.loyaltyPointValue).toFixed(2));
  const maxPossibleDiscount = Math.max(0, subtotal - discountFromCoupon);
  const targetPhone = customerPhone || registeredPhone;

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (pointsInput < config.loyaltyMinRedeemPoints) {
      setErrorMsg(
        isAr
          ? `الحد الأدنى لاستبدال النقاط هو ${config.loyaltyMinRedeemPoints} نقطة.`
          : `Minimum redemption is ${config.loyaltyMinRedeemPoints} points.`
      );
      return;
    }

    if (pointsInput > userPoints) {
      setErrorMsg(
        isAr
          ? `رصيدك غير كافٍ. يتوفر لديك ${userPoints} نقطة فقط.`
          : `Insufficient balance. You only have ${userPoints} points available.`
      );
      return;
    }

    if (!targetPhone) {
      setErrorMsg(
        isAr
          ? "يرجى إدخال رقم جوال صحيح في بيانات التوصيل لإرسال رمز التحقق."
          : "Please enter a valid mobile number in shipping details to receive the verification OTP."
      );
      return;
    }

    setSendingOtp(true);
    setErrorMsg("");
    setDevOtp(null);

    try {
      const res = await fetch("/api/loyalty/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointsToRedeem: pointsInput,
          phone: targetPhone,
          countryCode: country,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP code.");

      setOtpStep("ENTER_OTP");
      setResendCooldown(60);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg(
        isAr
          ? "يرجى إدخال رمز التحقق المكون من 6 أرقام."
          : "Please enter the 6-digit verification code."
      );
      return;
    }

    setVerifyingOtp(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/loyalty/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: otpCode.trim(),
          pointsToRedeem: pointsInput,
          phone: targetPhone,
          countryCode: country,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      onApplyLoyalty(pointsInput, data.discountAmount, data.verifiedToken);
      setIsRedeeming(false);
      setSuccessMsg(
        isAr
          ? `تم تطبيق خصم ${formatPrice(data.discountAmount, country)} بنجاح!`
          : `Successfully applied ${formatPrice(data.discountAmount, country)} discount!`
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRemoveLoyalty = () => {
    onApplyLoyalty(0, 0, null);
    setOtpStep("SELECT_POINTS");
    setOtpCode("");
  };

  return (
    <div className="p-3.5 bg-amber-50/50 border border-amber-200/90 rounded-[8px] space-y-3">
      {/* Loyalty Header with Balance & Order Rewards Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[#b6713e]">
            <Coins size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1.5">
              <span>{isAr ? "مكافآت برنامج راميليت" : "Ramillette Rewards Club"}</span>
              <Sparkles size={12} className="text-amber-500 fill-amber-400" />
            </h4>
            <p className="text-[11px] text-neutral-600">
              {isAr ? "رصيدك الحالي: " : "Available Balance: "}
              <strong className="text-[#b6713e] font-mono">
                {userPoints} {isAr ? "نقطة" : "Points"}
              </strong>{" "}
              (≈ {formatPrice(userPoints * config.loyaltyPointValue, country)})
            </p>
          </div>
        </div>

        {orderEarnedPoints > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faedcd] text-[#9b5827] border border-[#ecdec1] whitespace-nowrap">
            +{orderEarnedPoints} {isAr ? "نقطة من هذا الطلب" : "pts this order"}
          </span>
        )}
      </div>

      {/* Applied State */}
      {appliedPoints > 0 ? (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-[6px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900">
                {appliedPoints} {isAr ? "نقطة مستبدلة" : "Points Redeemed"}
              </span>
              <span className="text-emerald-700 block text-[11px]">
                {isAr
                  ? `خصم ${formatPrice(appliedDiscount, country)} تم تأكيده بالرمز السري ✓`
                  : `Discount of ${formatPrice(appliedDiscount, country)} confirmed via OTP ✓`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveLoyalty}
            className="text-[11px] font-bold text-neutral-500 hover:text-rose-600 underline cursor-pointer"
          >
            {isAr ? "إلغاء الخصم" : "Remove"}
          </button>
        </div>
      ) : (
        /* Action to Redeem */
        <div>
          {!isRedeeming ? (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-500">
                {userPoints >= config.loyaltyMinRedeemPoints ? (
                  isAr
                    ? `استبدل نقاطك بخصم فوري يصل إلى ${formatPrice(userPoints * config.loyaltyPointValue, country)}`
                    : `Redeem your points for up to ${formatPrice(userPoints * config.loyaltyPointValue, country)} discount`
                ) : (
                  isAr
                    ? `تحتاج إلى ${config.loyaltyMinRedeemPoints} نقطة كحد أدنى للاستبدال.`
                    : `Minimum ${config.loyaltyMinRedeemPoints} points required to redeem.`
                )}
              </span>

              {userPoints >= config.loyaltyMinRedeemPoints && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRedeeming(true);
                    setOtpStep("SELECT_POINTS");
                    setErrorMsg("");
                  }}
                  className="btn-outline h-7 px-3 text-[11px] font-bold text-[#b6713e] border-[#b6713e] hover:bg-[#b6713e] hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <Coins size={12} />
                  <span>{isAr ? "استبدال النقاط" : "Redeem Points"}</span>
                </button>
              )}
            </div>
          ) : (
            /* Inline Redemption Card */
            <div className="mt-2 p-3 bg-white border border-amber-200 rounded-[6px] space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <span className="text-xs font-bold text-[#1c1c1c] flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#b6713e]" />
                  <span>{isAr ? "استبدال النقاط بأمان" : "Secure Points Redemption"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsRedeeming(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700 flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Enter how many points */}
              {otpStep === "SELECT_POINTS" && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-neutral-700">
                        {isAr ? "عدد النقاط المراد استبدالها:" : "Points to redeem:"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setPointsInput(userPoints)}
                        className="text-[10px] font-bold text-[#b6713e] hover:underline"
                      >
                        {isAr ? `الحد الأقصى (${userPoints})` : `Max (${userPoints} pts)`}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={config.loyaltyMinRedeemPoints}
                        max={userPoints}
                        step="1"
                        value={pointsInput}
                        onChange={(e) => setPointsInput(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                      />
                    </div>
                  </div>

                  {/* Calculated savings preview */}
                  <div className="p-2 bg-[#fbf9f5] border border-[#ecdec1] rounded text-[11px] text-neutral-700 flex items-center justify-between">
                    <span>{isAr ? "قيمة الخصم المستحق:" : "Discount Savings:"}</span>
                    <strong className="text-emerald-700 font-mono text-xs">
                      -{formatPrice(Math.min(candidateDiscount, maxPossibleDiscount), country)}
                    </strong>
                  </div>

                  <p className="text-[10px] text-neutral-500 leading-tight">
                    {isAr
                      ? `لحماية نقاطك، سنرسل رمز تحقق (OTP) سري إلى رقم هاتفك (${targetPhone || "المسجل"}).`
                      : `To protect your reward points, a 6-digit verification code will be sent to your phone (${targetPhone || "registered"}).`}
                  </p>

                  <button
                    type="button"
                    disabled={sendingOtp || pointsInput < config.loyaltyMinRedeemPoints || pointsInput > userPoints}
                    onClick={handleSendOtp}
                    className="w-full btn-primary h-8 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>{isAr ? "جاري إرسال الرمز..." : "Sending OTP Code..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? "إرسال رمز التحقق (OTP)" : "Send Verification Code"}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 2: Enter OTP code */}
              {otpStep === "ENTER_OTP" && (
                <div className="space-y-3">
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                    {isAr
                      ? `تم إرسال رمز التحقق إلى ${targetPhone}`
                      : `Verification code sent to ${targetPhone}`}
                  </div>

                  {/* Dev / Demo One-Click OTP */}
                  {devOtp && (
                    <div className="p-2 bg-[#faedcd] border border-[#ecdec1] rounded flex items-center justify-between text-xs">
                      <span className="text-[10px] text-neutral-700">
                        {isAr ? "رمز التجربة السريع:" : "Demo OTP Code:"}{" "}
                        <strong className="font-mono text-[#b6713e] font-bold">{devOtp}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtp)}
                        className="text-[10px] font-bold text-[#b6713e] bg-white px-2 py-0.5 rounded border border-[#ecdec1] hover:bg-neutral-50"
                      >
                        {isAr ? "تعبئة تلقائية" : "Auto-fill"}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      {isAr ? "أدخل الرمز المكون من 6 أرقام:" : "Enter 6-Digit Code:"}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center tracking-widest text-base font-mono font-extrabold px-3 py-1.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={verifyingOtp || otpCode.length !== 6}
                      onClick={handleVerifyOtp}
                      className="flex-1 btn-primary h-8 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>{isAr ? "جاري التحقق..." : "Verifying..."}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} />
                          <span>{isAr ? "تأكيد واستبدال" : "Verify & Apply"}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || sendingOtp}
                      onClick={handleSendOtp}
                      className="btn-outline h-8 px-2.5 text-[11px] text-neutral-600 disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? `${resendCooldown}s`
                        : isAr
                        ? "إعادة الإرسال"
                        : "Resend"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
