"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Percent,
  Truck,
  Globe,
  Check,
  Save,
  Loader2,
  Building,
  Mail,
  Phone,
  Megaphone,
  MapPin,
  ExternalLink,
  Gift,
  Heart,
  Sparkles,
  Send,
  Copy,
  Key,
  ShieldCheck,
} from "lucide-react";
import { AdminCountry } from "./CountryManager";
import { PayLaterLogo } from "@/components/cart/PayLaterCartButton";

interface StoreSettingsViewProps {
  countries: AdminCountry[];
  settings: Record<string, string>;
}

export function StoreSettingsView({ countries: initialCountries, settings }: StoreSettingsViewProps) {
  const [countriesList, setCountriesList] = useState<AdminCountry[]>(initialCountries);
  const [selectedTarget, setSelectedTarget] = useState<string>("QA"); // Default to QA or first country

  // Global settings state
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress || "Souq Al Wakra, Building 45, Doha, Qatar");
  const [storePhone, setStorePhone] = useState(settings.storePhone || "+974 5555 1234");
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail || "contact@ramillette.com");
  const [announcementText, setAnnouncementText] = useState(
    settings.announcementText || "Souq Al Wakra, Qatar • Free 2-Hour Express Delivery in Doha on orders over QAR 900"
  );
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalSaved, setGlobalSaved] = useState(false);

  // Celebration Offers Settings state (Birthday & Anniversary)
  const [birthdayOfferEnabled, setBirthdayOfferEnabled] = useState(settings.birthdayOfferEnabled !== "false");
  const [birthdayOfferType, setBirthdayOfferType] = useState(settings.birthdayOfferType || "PERCENTAGE");
  const [birthdayOfferValue, setBirthdayOfferValue] = useState(settings.birthdayOfferValue || "15");
  const [birthdayOfferDaysBefore, setBirthdayOfferDaysBefore] = useState(settings.birthdayOfferDaysBefore || "7");
  const [birthdayOfferMinSpend, setBirthdayOfferMinSpend] = useState(settings.birthdayOfferMinSpend || "0");

  const [anniversaryOfferEnabled, setAnniversaryOfferEnabled] = useState(settings.anniversaryOfferEnabled !== "false");
  const [anniversaryOfferType, setAnniversaryOfferType] = useState(settings.anniversaryOfferType || "PERCENTAGE");
  const [anniversaryOfferValue, setAnniversaryOfferValue] = useState(settings.anniversaryOfferValue || "20");
  const [anniversaryOfferDaysBefore, setAnniversaryOfferDaysBefore] = useState(settings.anniversaryOfferDaysBefore || "7");
  const [anniversaryOfferMinSpend, setAnniversaryOfferMinSpend] = useState(settings.anniversaryOfferMinSpend || "0");

  const [celebrationSaving, setCelebrationSaving] = useState(false);
  const [celebrationSaved, setCelebrationSaved] = useState(false);
  const [celebrationTesting, setCelebrationTesting] = useState(false);
  const [celebrationTestResult, setCelebrationTestResult] = useState<string | null>(null);

  // PayLater Settings state
  const [paylaterEnabled, setPaylaterEnabled] = useState(settings.paylaterEnabled !== "false");
  const [paylaterEnvironment, setPaylaterEnvironment] = useState<"sandbox" | "production">(
    (settings.paylaterEnvironment as "sandbox" | "production") || "sandbox"
  );
  const [paylaterClientId, setPaylaterClientId] = useState(settings.paylaterClientId || "merchant-1683");
  const [paylaterClientSecret, setPaylaterClientSecret] = useState(settings.paylaterClientSecret || "");
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [paylaterOutletId, setPaylaterOutletId] = useState(settings.paylaterOutletId || "1683");
  const [paylaterApiKey, setPaylaterApiKey] = useState(settings.paylaterApiKey || "4868be79-c686-442e-b841-f034d3110078");
  const [paylaterWebhookSecret, setPaylaterWebhookSecret] = useState(settings.paylaterWebhookSecret || "");
  const [paylaterMinAmount, setPaylaterMinAmount] = useState(settings.paylaterMinAmount || "300");
  const [paylaterMaxAmount, setPaylaterMaxAmount] = useState(settings.paylaterMaxAmount || "25000");

  const [paylaterSaving, setPaylaterSaving] = useState(false);
  const [paylaterSaved, setPaylaterSaved] = useState(false);
  const [paylaterSaveError, setPaylaterSaveError] = useState<string | null>(null);
  const [paylaterTesting, setPaylaterTesting] = useState(false);
  const [paylaterTestResult, setPaylaterTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Regional country settings form state
  const activeCountry = countriesList.find((c) => c.code === selectedTarget);
  const [regionalBoutiqueName, setRegionalBoutiqueName] = useState(activeCountry?.boutiqueName || "");
  const [regionalBoutiqueLocation, setRegionalBoutiqueLocation] = useState(activeCountry?.boutiqueLocation || "");
  const [regionalBoutiqueLocationAr, setRegionalBoutiqueLocationAr] = useState(activeCountry?.boutiqueLocationAr || "");
  const [regionalAnnouncement, setRegionalAnnouncement] = useState(activeCountry?.deliveryNotice || "");
  const [regionalAnnouncementAr, setRegionalAnnouncementAr] = useState(activeCountry?.deliveryNoticeAr || "");
  const [regionalPhone, setRegionalPhone] = useState(activeCountry?.phone || "");
  const [regionalEmail, setRegionalEmail] = useState(activeCountry?.supportEmail || "");
  const [regionalSaving, setRegionalSaving] = useState(false);
  const [regionalSaved, setRegionalSaved] = useState(false);

  // Switch country target handler
  const handleSelectTarget = (targetCode: string) => {
    setSelectedTarget(targetCode);
    setRegionalSaved(false);
    if (targetCode !== "GLOBAL") {
      const match = countriesList.find((c) => c.code === targetCode);
      if (match) {
        setRegionalBoutiqueName(match.boutiqueName || "");
        setRegionalBoutiqueLocation(match.boutiqueLocation || "");
        setRegionalBoutiqueLocationAr(match.boutiqueLocationAr || "");
        setRegionalAnnouncement(match.deliveryNotice || "");
        setRegionalAnnouncementAr(match.deliveryNoticeAr || "");
        setRegionalPhone(match.phone || "");
        setRegionalEmail(match.supportEmail || "");
      }
    }
  };

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalSaving(true);
    setGlobalSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementText,
          storeAddress,
          storePhone,
          storeEmail,
        }),
      });

      if (res.ok) {
        setGlobalSaved(true);
        setTimeout(() => setGlobalSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save global settings:", err);
    } finally {
      setGlobalSaving(false);
    }
  };

  const handleSaveRegional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCountry) return;
    setRegionalSaving(true);
    setRegionalSaved(false);

    try {
      const res = await fetch(`/api/admin/countries/${activeCountry.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boutiqueName: regionalBoutiqueName,
          boutiqueLocation: regionalBoutiqueLocation,
          boutiqueLocationAr: regionalBoutiqueLocationAr,
          deliveryNotice: regionalAnnouncement,
          deliveryNoticeAr: regionalAnnouncementAr,
          phone: regionalPhone,
          supportEmail: regionalEmail,
        }),
      });

      if (res.ok) {
        setCountriesList((prev) =>
          prev.map((c) =>
            c.code === activeCountry.code
              ? {
                  ...c,
                  boutiqueName: regionalBoutiqueName,
                  boutiqueLocation: regionalBoutiqueLocation,
                  boutiqueLocationAr: regionalBoutiqueLocationAr,
                  deliveryNotice: regionalAnnouncement,
                  deliveryNoticeAr: regionalAnnouncementAr,
                  phone: regionalPhone,
                  supportEmail: regionalEmail,
                }
              : c
          )
        );
        setRegionalSaved(true);
        setTimeout(() => setRegionalSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save regional settings:", err);
    } finally {
      setRegionalSaving(false);
    }
  };

  const handleSaveCelebrationOffers = async (e: React.FormEvent) => {
    e.preventDefault();
    setCelebrationSaving(true);
    setCelebrationSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthdayOfferEnabled: String(birthdayOfferEnabled),
          birthdayOfferType,
          birthdayOfferValue,
          birthdayOfferDaysBefore,
          birthdayOfferMinSpend,
          anniversaryOfferEnabled: String(anniversaryOfferEnabled),
          anniversaryOfferType,
          anniversaryOfferValue,
          anniversaryOfferDaysBefore,
          anniversaryOfferMinSpend,
        }),
      });

      if (res.ok) {
        setCelebrationSaved(true);
        setTimeout(() => setCelebrationSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save celebration settings:", err);
    } finally {
      setCelebrationSaving(false);
    }
  };

  const handleTestCelebrationDispatch = async () => {
    setCelebrationTesting(true);
    setCelebrationTestResult(null);

    try {
      const res = await fetch("/api/cron/celebration-offers", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCelebrationTestResult(
          `Triggered successfully: ${data.birthdayDispatched} birthday email(s), ${data.anniversaryDispatched} anniversary email(s) sent.`
        );
      } else {
        setCelebrationTestResult(`Error: ${data.error || "Failed to trigger dispatch"}`);
      }
    } catch (err: any) {
      setCelebrationTestResult(`Error: ${err.message}`);
    } finally {
      setCelebrationTesting(false);
    }
  };

  const handleSavePayLater = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaylaterSaving(true);
    setPaylaterSaved(false);
    setPaylaterSaveError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paylaterEnabled: String(paylaterEnabled),
          paylaterEnvironment,
          paylaterClientId,
          paylaterClientSecret,
          paylaterOutletId,
          paylaterApiKey,
          paylaterWebhookSecret,
          paylaterMinAmount: String(paylaterMinAmount),
          paylaterMaxAmount: String(paylaterMaxAmount),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setPaylaterSaved(true);
        setPaylaterSaveError(null);
        setTimeout(() => setPaylaterSaved(false), 2500);
      } else {
        setPaylaterSaveError(data.error || "Failed to save settings. Please check your permissions.");
      }
    } catch (err: any) {
      console.error("Failed to save PayLater settings:", err);
      setPaylaterSaveError(err.message || "Network error while saving settings.");
    } finally {
      setPaylaterSaving(false);
    }
  };

  const handleTestPayLater = async () => {
    setPaylaterTesting(true);
    setPaylaterTestResult(null);

    try {
      const res = await fetch("/api/admin/settings/paylater-test", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaylaterTestResult({
          success: true,
          message: data.message || "Successfully authenticated with PayLater API!",
        });
      } else {
        setPaylaterTestResult({
          success: false,
          message: data.error || "Connection failed. Please verify credentials.",
        });
      }
    } catch (err: any) {
      setPaylaterTestResult({
        success: false,
        message: `Error: ${err.message}`,
      });
    } finally {
      setPaylaterTesting(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/api/paylater/webhook` : "https://ramillette.com/api/paylater/webhook";
    navigator.clipboard.writeText(url);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
          Regional Tax, Headquarters & Store Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Master control panel for regional VAT rates, delivery thresholds, regional boutique headquarters, and localized header announcements.
        </p>
      </div>

      {/* Regional Tax & Delivery Matrix */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] bg-[#fbf9f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Percent size={18} className="text-[#b6713e]" />
            <h2 className="text-sm font-bold text-[#1c1c1c]">
              Regional VAT & Delivery Matrix
            </h2>
          </div>

          <Link
            href="/admin/countries"
            className="text-xs text-[#b6713e] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Manage All Countries</span>
            <Globe size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-neutral-500 font-semibold bg-neutral-50/50">
                <th className="py-3 px-6">Country / Market</th>
                <th className="py-3 px-6">Currency</th>
                <th className="py-3 px-6">VAT Rate</th>
                <th className="py-3 px-6">Delivery Fee</th>
                <th className="py-3 px-6">Free Delivery Threshold</th>
                <th className="py-3 px-6">Gift Wrap Fee</th>
                <th className="py-3 px-6">Gateways</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {countriesList.map((c) => (
                <tr key={c.code} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div>
                        <span className="font-bold text-[#1c1c1c] block">{c.name}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">{c.code}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 font-semibold text-neutral-700">
                    {c.currency} ({c.currencySymbol})
                  </td>

                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        c.taxRate > 0
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {c.taxRate}% {c.taxName}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 font-medium text-neutral-800">
                    {c.standardShippingFee.toFixed(c.currencyDecimals)} {c.currency}
                  </td>

                  <td className="py-3.5 px-6 font-medium text-emerald-700">
                    {c.freeShippingThreshold.toFixed(c.currencyDecimals)} {c.currency}
                  </td>

                  <td className="py-3.5 px-6 font-medium text-[#b6713e]">
                    {c.allowGiftWrap !== false ? (
                      <span>{(c.giftWrapFee ?? 25).toFixed(c.currencyDecimals)} {c.currency}</span>
                    ) : (
                      <span className="text-neutral-400">Disabled</span>
                    )}
                  </td>

                  <td className="py-3.5 px-6 text-neutral-600">
                    <div className="flex flex-wrap gap-1">
                      {c.paymentMethods?.map((m) => (
                        <span
                          key={m}
                          className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 text-[10px] font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Headquarters & Header Announcement Section */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Building size={18} className="text-[#b6713e]" />
            <div>
              <h2 className="text-sm font-bold text-[#1c1c1c]">
                Headquarters & Header Announcement by Region
              </h2>
              <p className="text-[11px] text-neutral-500">
                Customize local boutique addresses, phone numbers, and top bar announcement notices for each specific market.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mr-1">
              Select Market:
            </span>
            <div className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-lg">
              {countriesList.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectTarget(c.code)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTarget === c.code
                      ? "bg-white text-[#1c1c1c] shadow-xs border border-neutral-200"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleSelectTarget("GLOBAL")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTarget === "GLOBAL"
                    ? "bg-white text-[#1c1c1c] shadow-xs border border-neutral-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Globe size={13} className="text-[#b6713e]" />
                <span>Global Fallback</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {selectedTarget === "GLOBAL" ? (
            /* Global Fallback Form */
            <form onSubmit={handleSaveGlobal} className="space-y-4 max-w-2xl text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-600 text-[11px] mb-2">
                This global fallback is displayed if a customer visits from an unrecognized region or if a specific country configuration has not specified a local value.
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Megaphone size={12} className="text-[#b6713e]" />
                  <span>Top Bar Header Announcement (Global Fallback)</span>
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                  placeholder="Free Worldwide Express Delivery on orders over QAR 900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#b6713e]" />
                    <span>Global Headquarters Address</span>
                  </label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                    <Phone size={12} className="text-[#b6713e]" />
                    <span>Global Support Phone</span>
                  </label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Mail size={12} className="text-[#b6713e]" />
                  <span>Global Support Email</span>
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={globalSaving}
                  className="btn-primary h-9 px-5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  {globalSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : globalSaved ? (
                    <>
                      <Check size={14} />
                      <span>Global Fallback Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Global Fallback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : activeCountry ? (
            /* Regional Country Form */
            <form onSubmit={handleSaveRegional} className="space-y-5 max-w-3xl text-xs">
              <div className="flex items-center justify-between p-3.5 bg-[#fbf9f5] rounded-lg border border-[#ecdec1]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeCountry.flag}</span>
                  <div>
                    <h3 className="font-bold text-sm text-[#1c1c1c]">
                      {activeCountry.name} ({activeCountry.code}) Regional Headquarters & Announcement
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      These values automatically display on the Top Bar, Checkout dispatch notice, and Footer when customers view {activeCountry.name}.
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/countries"
                  className="text-xs font-bold text-[#b6713e] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Tax & Shipping Settings</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {/* Announcement Notices */}
              <div className="space-y-3 bg-neutral-50/60 p-4 rounded-lg border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Megaphone size={13} className="text-[#b6713e]" />
                  <span>Header Announcement (Top Bar Notice for {activeCountry.name})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      English Announcement Notice
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Souq Al Wakra, Qatar • Free 2-Hour Express Delivery in Doha on orders over QAR 900"
                      value={regionalAnnouncement}
                      onChange={(e) => setRegionalAnnouncement(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Arabic Announcement Notice (العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="سوق الوكرة، قطر • توصيل سريع مجاني خلال ساعتين في الدوحة للطلبات فوق 900 ر.ق"
                      value={regionalAnnouncementAr}
                      onChange={(e) => setRegionalAnnouncementAr(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>
              </div>

              {/* Boutique & Headquarters Address */}
              <div className="space-y-3 bg-neutral-50/60 p-4 rounded-lg border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Building size={13} className="text-[#b6713e]" />
                  <span>Boutique Headquarters & Dispatch Location</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Boutique / Flagship Store Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramillette Perfumes - Souq Al Wakra Flagship"
                    value={regionalBoutiqueName}
                    onChange={(e) => setRegionalBoutiqueName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Headquarters Address (English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Souq Al Wakra, Building 45, Doha, Qatar"
                      value={regionalBoutiqueLocation}
                      onChange={(e) => setRegionalBoutiqueLocation(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Headquarters Address (Arabic - العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="سوق الوكرة، مبنى 45، الدوحة، قطر"
                      value={regionalBoutiqueLocationAr}
                      onChange={(e) => setRegionalBoutiqueLocationAr(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>
              </div>

              {/* Regional Support Contacts */}
              <div className="space-y-3 bg-neutral-50/60 p-4 rounded-lg border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#b6713e]" />
                  <span>Regional Customer Support Contacts ({activeCountry.name})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Local Support Phone
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. ${activeCountry.phonePrefix} 5555 1234`}
                      value={regionalPhone}
                      onChange={(e) => setRegionalPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Local Support Email
                    </label>
                    <input
                      type="email"
                      placeholder={`e.g. ${activeCountry.code.toLowerCase()}@ramillette.com`}
                      value={regionalEmail}
                      onChange={(e) => setRegionalEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={regionalSaving}
                  className="btn-primary h-9 px-5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  {regionalSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving {activeCountry.name} Settings...</span>
                    </>
                  ) : regionalSaved ? (
                    <>
                      <Check size={14} />
                      <span>{activeCountry.name} Settings Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save {activeCountry.name} Headquarters & Announcement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      {/* Celebration & Milestone Offers Configuration */}
      <div id="celebration-offers-section" className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Gift size={18} className="text-[#b6713e]" />
            <div>
              <h2 className="text-sm font-bold text-[#1c1c1c] flex items-center gap-2">
                <span>Celebration & Milestone Offers</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Automated Privileges
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Reward VIP customers with automatic discount vouchers and tailored congratulatory emails for their Birthday and Wedding Anniversary.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestCelebrationDispatch}
              disabled={celebrationTesting}
              className="h-8 px-3 text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Immediately check upcoming birthdays/anniversaries and dispatch pending emails"
            >
              {celebrationTesting ? (
                <Loader2 size={12} className="animate-spin text-[#b6713e]" />
              ) : (
                <Send size={12} className="text-[#b6713e]" />
              )}
              <span>{celebrationTesting ? "Testing Dispatch..." : "Trigger Dispatch Check"}</span>
            </button>
          </div>
        </div>

        {celebrationTestResult && (
          <div className="mx-6 mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
            <span>{celebrationTestResult}</span>
            <button
              type="button"
              onClick={() => setCelebrationTestResult(null)}
              className="text-amber-700 hover:text-amber-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSaveCelebrationOffers} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Birthday Privileges Card */}
            <div
              className={`rounded-xl border p-5 transition-all ${
                birthdayOfferEnabled ? "border-[#b6713e]/30 bg-amber-50/20" : "border-neutral-200 bg-neutral-50/50 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#b6713e]/10 flex items-center justify-center text-[#b6713e]">
                    <Gift size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1c1c1c]">Birthday Privilege Offer</h3>
                    <p className="text-[11px] text-neutral-500">Sent before the customer&apos;s birthday</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={birthdayOfferEnabled}
                    onChange={(e) => setBirthdayOfferEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#b6713e]"></div>
                </label>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={birthdayOfferType}
                      onChange={(e) => setBirthdayOfferType(e.target.value)}
                      disabled={!birthdayOfferEnabled}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:border-[#b6713e]"
                    >
                      <option value="PERCENTAGE">Percentage (% Off)</option>
                      <option value="FIXED_AMOUNT">Flat Amount (e.g. QAR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      {birthdayOfferType === "PERCENTAGE" ? "Discount Percentage (%)" : "Flat Discount Value"}
                    </label>
                    <input
                      type="number"
                      step={birthdayOfferType === "PERCENTAGE" ? "1" : "5"}
                      min="1"
                      max={birthdayOfferType === "PERCENTAGE" ? "100" : undefined}
                      value={birthdayOfferValue}
                      onChange={(e) => setBirthdayOfferValue(e.target.value)}
                      disabled={!birthdayOfferEnabled}
                      placeholder={birthdayOfferType === "PERCENTAGE" ? "15" : "50"}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Send Email (Days in Advance)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={birthdayOfferDaysBefore}
                        onChange={(e) => setBirthdayOfferDaysBefore(e.target.value)}
                        disabled={!birthdayOfferEnabled}
                        placeholder="7"
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                      />
                      <span className="absolute right-3 top-2 text-[11px] text-neutral-400 pointer-events-none">
                        days before
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      0 = send on birthday, 7 = send 1 week prior
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Minimum Order Spend (0 for none)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={birthdayOfferMinSpend}
                      onChange={(e) => setBirthdayOfferMinSpend(e.target.value)}
                      disabled={!birthdayOfferEnabled}
                      placeholder="0"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Coupon will require this basket total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anniversary Privileges Card */}
            <div
              className={`rounded-xl border p-5 transition-all ${
                anniversaryOfferEnabled ? "border-[#b6713e]/30 bg-amber-50/20" : "border-neutral-200 bg-neutral-50/50 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <Heart size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1c1c1c]">Anniversary Privilege Offer</h3>
                    <p className="text-[11px] text-neutral-500">Sent before the wedding/milestone anniversary</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anniversaryOfferEnabled}
                    onChange={(e) => setAnniversaryOfferEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#b6713e]"></div>
                </label>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={anniversaryOfferType}
                      onChange={(e) => setAnniversaryOfferType(e.target.value)}
                      disabled={!anniversaryOfferEnabled}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:border-[#b6713e]"
                    >
                      <option value="PERCENTAGE">Percentage (% Off)</option>
                      <option value="FIXED_AMOUNT">Flat Amount (e.g. QAR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      {anniversaryOfferType === "PERCENTAGE" ? "Discount Percentage (%)" : "Flat Discount Value"}
                    </label>
                    <input
                      type="number"
                      step={anniversaryOfferType === "PERCENTAGE" ? "1" : "5"}
                      min="1"
                      max={anniversaryOfferType === "PERCENTAGE" ? "100" : undefined}
                      value={anniversaryOfferValue}
                      onChange={(e) => setAnniversaryOfferValue(e.target.value)}
                      disabled={!anniversaryOfferEnabled}
                      placeholder={anniversaryOfferType === "PERCENTAGE" ? "20" : "100"}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Send Email (Days in Advance)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={anniversaryOfferDaysBefore}
                        onChange={(e) => setAnniversaryOfferDaysBefore(e.target.value)}
                        disabled={!anniversaryOfferEnabled}
                        placeholder="7"
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                      />
                      <span className="absolute right-3 top-2 text-[11px] text-neutral-400 pointer-events-none">
                        days before
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      0 = send on anniversary, 7 = send 1 week prior
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Minimum Order Spend (0 for none)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={anniversaryOfferMinSpend}
                      onChange={(e) => setAnniversaryOfferMinSpend(e.target.value)}
                      disabled={!anniversaryOfferEnabled}
                      placeholder="0"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Coupon will require this basket total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={celebrationSaving}
              className="btn-primary h-9 px-5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              {celebrationSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving Celebration Offers...</span>
                </>
              ) : celebrationSaved ? (
                <>
                  <Check size={14} />
                  <span>Celebration Offers Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Celebration Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* PayLater BNPL Payment Gateway Configuration */}
      <div id="paylater-settings-section" className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] bg-[#f0f7ff]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PayLaterLogo iconOnly className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-[#1c1c1c] flex items-center gap-2">
                <span>PayLater (BNPL) Gateway Integration</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${paylaterEnvironment === "production" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {paylaterEnvironment === "production" ? "Live / Production" : "Sandbox / UAT"}
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Official Buy Now, Pay Later (Split in 4) gateway integration for Qatar. Configure merchant credentials, webhooks, and order limits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestPayLater}
              disabled={paylaterTesting}
              className="h-8 px-3 text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test OAuth2 authentication with PayLater"
            >
              {paylaterTesting ? (
                <Loader2 size={12} className="animate-spin text-[#0066cc]" />
              ) : (
                <Key size={12} className="text-[#0066cc]" />
              )}
              <span>{paylaterTesting ? "Testing Connection..." : "Test Connection"}</span>
            </button>
          </div>
        </div>

        {paylaterTestResult && (
          <div className={`mx-6 mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
            paylaterTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"
          }`}>
            <div className="flex items-center gap-2">
              {paylaterTestResult.success ? <Check size={16} className="text-emerald-600 shrink-0" /> : <ShieldCheck size={16} className="text-red-600 shrink-0" />}
              <span>{paylaterTestResult.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setPaylaterTestResult(null)}
              className="font-bold ml-2 opacity-70 hover:opacity-100 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSavePayLater} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Enable Toggle & Environment */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1c1c1c] block">Enable PayLater at Checkout</span>
                  <span className="text-[11px] text-neutral-500">Show &quot;Buy with PayLater&quot; in cart and checkout</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paylaterEnabled}
                    onChange={(e) => setPaylaterEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0066cc]"></div>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  API Environment
                </label>
                <select
                  value={paylaterEnvironment}
                  onChange={(e) => setPaylaterEnvironment(e.target.value as "sandbox" | "production")}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded bg-white focus:outline-none focus:border-[#0066cc]"
                >
                  <option value="sandbox">Sandbox (Testing / UAT) — connect.uat.paylaterapp.com</option>
                  <option value="production">Production (Live) — connect.paylaterapp.com</option>
                </select>
                <p className="text-[10px] text-neutral-500 mt-1">
                  {paylaterEnvironment === "sandbox"
                    ? "Currently using PayLater Sandbox credentials. Test shoppers and test cards work here."
                    : "Live mode: Real transactions in QAR settled via PayLater."}
                </p>
              </div>
            </div>

            {/* Merchant Identity Card */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={paylaterClientId}
                  onChange={(e) => setPaylaterClientId(e.target.value)}
                  placeholder="merchant-1683"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc] font-mono"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  From PayLater portal Settings &rarr; Webhook API Key
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>Client Secret</span>
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="text-[10px] text-[#0066cc] font-semibold hover:underline cursor-pointer"
                  >
                    {showClientSecret ? "Hide" : "Show"}
                  </button>
                </label>
                <input
                  type={showClientSecret ? "text" : "password"}
                  value={paylaterClientSecret}
                  onChange={(e) => setPaylaterClientSecret(e.target.value)}
                  placeholder="Paste unmasked client secret from PayLater portal"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc] font-mono"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Revealed by clicking unmask/copy next to Client Secret in the PayLater portal
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Outlet & API Key */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Outlet ID
                </label>
                <input
                  type="text"
                  value={paylaterOutletId}
                  onChange={(e) => setPaylaterOutletId(e.target.value)}
                  placeholder={paylaterEnvironment === "sandbox" ? "1000000061" : "Production Outlet ID"}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc] font-mono"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  {paylaterEnvironment === "sandbox"
                    ? "In Sandbox mode, Outlet ID is automatically 1000000061."
                    : "Storefront outlet ID (found in PayLater Portal under Settings → Integration or Outlets). Note: Merchant ID is 1683, Outlet ID is distinct."}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={paylaterApiKey}
                  onChange={(e) => setPaylaterApiKey(e.target.value)}
                  placeholder="4868be79-c686-442e-b841-f034d3110078"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc] font-mono"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Your assigned Webhook API Key UUID from portal
                </p>
              </div>
            </div>

            {/* Webhook Configuration & Callback URL */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="text"
                  value={paylaterWebhookSecret}
                  onChange={(e) => setPaylaterWebhookSecret(e.target.value)}
                  placeholder="Provided by PayLater portal after setting Webhook URL"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc] font-mono"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Used to verify HMAC SHA-256 signature on payment callbacks
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Webhook URL (Paste into PayLater Portal)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/api/paylater/webhook` : "https://ramillette.com/api/paylater/webhook"}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded bg-neutral-100 font-mono text-neutral-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="px-3 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded hover:bg-neutral-50 flex items-center gap-1 shrink-0 cursor-pointer text-[#0066cc]"
                  >
                    {copiedWebhookUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedWebhookUrl ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  In PayLater portal, enter this under <strong>Settings &rarr; Webhook API Key &rarr; Webhook URL</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Minimum Order Value (QAR)
              </label>
              <input
                type="number"
                min="1"
                max="25000"
                value={paylaterMinAmount}
                onChange={(e) => setPaylaterMinAmount(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc]"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Standard PayLater minimum is 300 QAR
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Maximum Order Value (QAR)
              </label>
              <input
                type="number"
                min="1"
                max="25000"
                value={paylaterMaxAmount}
                onChange={(e) => setPaylaterMaxAmount(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#0066cc]"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Standard PayLater maximum is 25,000 QAR
              </p>
            </div>
          </div>

          {paylaterSaveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center justify-between">
              <span>{paylaterSaveError}</span>
              <button
                type="button"
                onClick={() => setPaylaterSaveError(null)}
                className="font-bold ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={paylaterSaving}
              className="btn-primary h-9 px-5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              {paylaterSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving PayLater Settings...</span>
                </>
              ) : paylaterSaved ? (
                <>
                  <Check size={14} />
                  <span>PayLater Settings Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save PayLater Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
