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
} from "lucide-react";
import { AdminCountry } from "./CountryManager";

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
    </div>
  );
}
