"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Percent,
  Truck,
  Phone,
  Building,
  AlertTriangle,
  Info,
} from "lucide-react";

export interface AdminCountry {
  code: string;
  name: string;
  nameAr?: string;
  flag: string;
  currency: string;
  currencyAr?: string;
  currencySymbol?: string;
  currencyDecimals: number;
  exchangeRate: number;
  phonePrefix: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
  taxName: string;
  taxIncludedInPrice: boolean;
  defaultCity: string;
  cities: string[];
  boutiqueName?: string;
  boutiqueLocation?: string;
  boutiqueLocationAr?: string;
  deliveryNotice?: string;
  deliveryNoticeAr?: string;
  phone?: string;
  supportEmail?: string;
  orderEmail?: string;
  paymentMethods: string[];
  active: boolean;
  sortOrder: number;
}

interface CountryManagerProps {
  initialCountries: AdminCountry[];
}

export function CountryManager({ initialCountries }: CountryManagerProps) {
  const [countries, setCountries] = useState<AdminCountry[]>(initialCountries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<AdminCountry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [flag, setFlag] = useState("🏳️");
  const [currency, setCurrency] = useState("");
  const [currencyAr, setCurrencyAr] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [currencyDecimals, setCurrencyDecimals] = useState(2);
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [phonePrefix, setPhonePrefix] = useState("");
  const [standardShippingFee, setStandardShippingFee] = useState(30);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(900);
  const [taxRate, setTaxRate] = useState(0);
  const [taxName, setTaxName] = useState("VAT");
  const [defaultCity, setDefaultCity] = useState("");
  const [citiesInput, setCitiesInput] = useState("");
  const [boutiqueName, setBoutiqueName] = useState("");
  const [boutiqueLocation, setBoutiqueLocation] = useState("");
  const [boutiqueLocationAr, setBoutiqueLocationAr] = useState("");
  const [deliveryNotice, setDeliveryNotice] = useState("");
  const [deliveryNoticeAr, setDeliveryNoticeAr] = useState("");
  const [phone, setPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(10);
  const [paymentCod, setPaymentCod] = useState(true);
  const [paymentOnline, setPaymentOnline] = useState(true);
  const [paymentTabby, setPaymentTabby] = useState(false);
  const [paymentBenefit, setPaymentBenefit] = useState(false);

  const openCreateModal = () => {
    setEditingCountry(null);
    setCode("");
    setName("");
    setNameAr("");
    setFlag("🇸🇦");
    setCurrency("SAR");
    setCurrencyAr("ر.س");
    setCurrencySymbol("SAR");
    setCurrencyDecimals(2);
    setExchangeRate(1.03);
    setPhonePrefix("+966");
    setStandardShippingFee(35);
    setFreeShippingThreshold(900);
    setTaxRate(15.0);
    setTaxName("VAT (15%)");
    setDefaultCity("Riyadh");
    setCitiesInput("Riyadh, Jeddah, Dammam, Mecca, Medina, Khobar");
    setBoutiqueName("Riyadh Flagship Boutique");
    setBoutiqueLocation("Kingdom Centre, Riyadh");
    setBoutiqueLocationAr("مركز المملكة، الرياض");
    setDeliveryNotice("Next-Day Express Delivery across Riyadh & Jeddah on orders over SAR 900");
    setDeliveryNoticeAr("توصيل سريع مجاني في اليوم التالي في الرياض وجدة للطلبات فوق 900 ر.س");
    setPhone("+966 5555 1234");
    setSupportEmail("saudi@ramillette.com");
    setActive(true);
    setSortOrder(countries.length + 1);
    setPaymentCod(true);
    setPaymentOnline(true);
    setPaymentTabby(true);
    setPaymentBenefit(false);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (c: AdminCountry) => {
    setEditingCountry(c);
    setCode(c.code);
    setName(c.name);
    setNameAr(c.nameAr || "");
    setFlag(c.flag);
    setCurrency(c.currency);
    setCurrencyAr(c.currencyAr || "");
    setCurrencySymbol(c.currencySymbol || c.currency);
    setCurrencyDecimals(c.currencyDecimals);
    setExchangeRate(c.exchangeRate);
    setPhonePrefix(c.phonePrefix);
    setStandardShippingFee(c.standardShippingFee);
    setFreeShippingThreshold(c.freeShippingThreshold);
    setTaxRate(c.taxRate);
    setTaxName(c.taxName);
    setDefaultCity(c.defaultCity);
    setCitiesInput((c.cities || []).join(", "));
    setBoutiqueName(c.boutiqueName || "");
    setBoutiqueLocation(c.boutiqueLocation || "");
    setBoutiqueLocationAr(c.boutiqueLocationAr || "");
    setDeliveryNotice(c.deliveryNotice || "");
    setDeliveryNoticeAr(c.deliveryNoticeAr || "");
    setPhone(c.phone || "");
    setSupportEmail(c.supportEmail || "");
    setActive(c.active);
    setSortOrder(c.sortOrder);
    setPaymentCod(c.paymentMethods.includes("COD"));
    setPaymentOnline(c.paymentMethods.includes("ONLINE"));
    setPaymentTabby(c.paymentMethods.includes("TABBY_TAMARA"));
    setPaymentBenefit(c.paymentMethods.includes("BENEFIT_PAY"));
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleToggleActive = async (c: AdminCountry) => {
    try {
      const updatedStatus = !c.active;
      const res = await fetch(`/api/admin/countries/${c.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedStatus }),
      });

      if (res.ok) {
        setCountries(
          countries.map((item) =>
            item.code === c.code ? { ...item, active: updatedStatus } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (c: AdminCountry) => {
    if (c.code === "QA") {
      alert("Qatar (QA) is the primary base market and cannot be deleted. You can deactivate it if needed.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${c.name} (${c.code})? Regional pricing for this country will be archived.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/countries/${c.code}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCountries(countries.filter((item) => item.code !== c.code));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete country");
      }
    } catch (err) {
      console.error("Failed to delete country:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const citiesArray = citiesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const paymentMethods: string[] = [];
      if (paymentCod) paymentMethods.push("COD");
      if (paymentOnline) paymentMethods.push("ONLINE");
      if (paymentTabby) paymentMethods.push("TABBY_TAMARA");
      if (paymentBenefit) paymentMethods.push("BENEFIT_PAY");

      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        nameAr: nameAr.trim(),
        flag: flag.trim(),
        currency: currency.trim().toUpperCase(),
        currencyAr: currencyAr.trim(),
        currencySymbol: currencySymbol.trim() || currency.trim().toUpperCase(),
        currencyDecimals: Number(currencyDecimals),
        exchangeRate: Number(exchangeRate),
        phonePrefix: phonePrefix.trim(),
        standardShippingFee: Number(standardShippingFee),
        freeShippingThreshold: Number(freeShippingThreshold),
        taxRate: Number(taxRate),
        taxName: taxName.trim(),
        defaultCity: defaultCity.trim() || (citiesArray[0] || "City"),
        cities: citiesArray,
        boutiqueName: boutiqueName.trim(),
        boutiqueLocation: boutiqueLocation.trim(),
        boutiqueLocationAr: boutiqueLocationAr.trim(),
        deliveryNotice: deliveryNotice.trim(),
        deliveryNoticeAr: deliveryNoticeAr.trim(),
        phone: phone.trim(),
        supportEmail: supportEmail.trim(),
        paymentMethods,
        active,
        sortOrder: Number(sortOrder),
      };

      if (editingCountry) {
        // Update
        const res = await fetch(`/api/admin/countries/${editingCountry.code}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update country");

        setCountries(
          countries.map((c) =>
            c.code === editingCountry.code ? { ...c, ...payload } : c
          )
        );
        setSuccess("Country updated successfully!");
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        // Create
        const res = await fetch(`/api/admin/countries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create country");

        setCountries([...countries, { ...payload, cities: citiesArray } as AdminCountry]);
        setSuccess("Country created and regional pricing initialized!");
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">
            Countries & Regional Markets
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure regional market parameters: currencies, delivery fees, VAT / sales tax rates, and local boutique info.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary h-10 px-5 text-xs font-semibold inline-flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Market</span>
        </button>
      </div>

      {/* Markets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {countries.map((c) => (
          <div
            key={c.code}
            className={`bg-white rounded-[10px] border transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${
              c.active ? "border-[#e5e5e5] hover:border-[#b6713e]/60" : "border-neutral-200 opacity-60 bg-neutral-50/70"
            }`}
          >
            {/* Card Top */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1.5 bg-[#fbf9f5] border border-[#ecdec1] rounded-md shadow-2xs">
                    {c.flag}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1c1c1c] flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-xs font-mono font-normal text-neutral-400">
                        ({c.code})
                      </span>
                    </h3>
                    {c.nameAr && (
                      <span className="text-xs text-neutral-400 block font-arabic">
                        {c.nameAr}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(c)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                    c.active
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-neutral-200 text-neutral-600 border border-neutral-300"
                  }`}
                >
                  {c.active ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-100">
                <div className="bg-[#fbf9f5] p-2.5 rounded-md border border-[#ecdec1]/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Currency & Rate
                  </span>
                  <span className="font-bold text-[#b6713e] block text-sm">
                    {c.currency} ({c.currencyDecimals} dec)
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    x{c.exchangeRate} vs QAR
                  </span>
                </div>

                <div className="bg-[#fbf9f5] p-2.5 rounded-md border border-[#ecdec1]/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    VAT / Tax Rate
                  </span>
                  <span className="font-bold text-[#1c1c1c] block text-sm">
                    {c.taxRate > 0 ? `${c.taxRate}%` : "0% (Tax-free)"}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    {c.taxName || "Standard"}
                  </span>
                </div>

                <div className="bg-[#fbf9f5] p-2.5 rounded-md border border-[#ecdec1]/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Delivery Fee
                  </span>
                  <span className="font-bold text-[#1c1c1c] block text-sm">
                    {c.currency} {c.standardShippingFee}
                  </span>
                  <span className="text-[10px] text-emerald-600 block">
                    Free over {c.currency} {c.freeShippingThreshold}
                  </span>
                </div>

                <div className="bg-[#fbf9f5] p-2.5 rounded-md border border-[#ecdec1]/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Phone & Cities
                  </span>
                  <span className="font-bold text-[#1c1c1c] block text-sm">
                    {c.phonePrefix}
                  </span>
                  <span className="text-[11px] text-neutral-500 block truncate">
                    {c.cities?.length || 0} cities ({c.defaultCity})
                  </span>
                </div>
              </div>

              {/* Delivery copy */}
              {c.deliveryNotice && (
                <p className="text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-200/60 line-clamp-2">
                  <Truck size={12} className="inline mr-1 text-[#b6713e]" />
                  {c.deliveryNotice}
                </p>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="px-5 py-3 border-t border-neutral-100 bg-[#fbf9f5]/50 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Sort priority: #{c.sortOrder}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="p-1.5 text-neutral-600 hover:text-[#b6713e] hover:bg-white rounded transition-colors"
                  title="Edit Market Settings"
                >
                  <Edit2 size={14} />
                </button>

                {c.code !== "QA" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete Market"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add or Edit Country */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-[#e5e5e5] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fbf9f5]">
              <div className="flex items-center gap-2.5">
                <Globe size={18} className="text-[#b6713e]" />
                <h2 className="text-base font-bold text-[#1c1c1c]">
                  {editingCountry ? `Edit Market: ${editingCountry.name} (${editingCountry.code})` : "Configure New Regional Market"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 flex-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md flex items-center gap-2">
                  <Check size={15} />
                  <span>{success}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-1">
                  1. Regional Identity & Currency
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Country Name (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saudi Arabia"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Country Name (Arabic)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. المملكة العربية السعودية"
                      dir="rtl"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      2-Letter ISO Code *
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      disabled={Boolean(editingCountry)}
                      placeholder="e.g. SA"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded uppercase font-mono font-bold focus:outline-none focus:border-[#b6713e] disabled:bg-neutral-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Flag Emoji *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 🇸🇦"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded text-center text-lg focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Currency Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SAR"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Currency Decimals
                    </label>
                    <select
                      value={currencyDecimals}
                      onChange={(e) => setCurrencyDecimals(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    >
                      <option value={2}>2 Decimals (e.g. 100.00)</option>
                      <option value={3}>3 Decimals (e.g. 10.000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Rate vs QAR Base *
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      placeholder="e.g. 1.03"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Taxes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-1">
                  2. Customizable Delivery Fees & VAT / Taxes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Delivery Fees */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-[8px] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1c1c1c]">
                      <Truck size={15} className="text-[#b6713e]" />
                      <span>Delivery Fee Configuration</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Standard Delivery Fee ({currency}) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={standardShippingFee}
                        onChange={(e) => setStandardShippingFee(parseFloat(e.target.value))}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                      />
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Charged when cart subtotal is below the free threshold.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Free Delivery Threshold ({currency}) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value))}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                      />
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Orders above this amount qualify for complimentary free delivery.
                      </span>
                    </div>
                  </div>

                  {/* Taxes / VAT */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-[8px] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1c1c1c]">
                      <Percent size={15} className="text-[#b6713e]" />
                      <span>VAT & Regional Tax Rates</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        VAT / Tax Rate Percentage (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 5, 10, or 15"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                      />
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Set to 0 for tax-free markets (e.g. Qatar). UAE standard: 5%, Bahrain: 10%, Saudi Arabia: 15%.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Tax Name / Label on Invoices *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VAT (15%)"
                        value={taxName}
                        onChange={(e) => setTaxName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Cities & Delivery Notice */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-1">
                  3. Contact, Cities & Checkout Localization
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Phone Dial Prefix *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +966"
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Default City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Riyadh"
                      value={defaultCity}
                      onChange={(e) => setDefaultCity(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Supported Cities (Comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Riyadh, Jeddah, Dammam, Mecca, Medina, Khobar"
                    value={citiesInput}
                    onChange={(e) => setCitiesInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                  />
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    Customers in this region will be able to select from these cities in the checkout dropdown.
                  </span>
                </div>

                {/* Regional Boutique & Headquarters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Boutique / Flagship Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kingdom Centre Boutique"
                      value={boutiqueName}
                      onChange={(e) => setBoutiqueName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Boutique Address (English)
                    </label>
                    <input
                      type="text"
                      placeholder="Kingdom Centre, Riyadh"
                      value={boutiqueLocation}
                      onChange={(e) => setBoutiqueLocation(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Boutique Address (Arabic)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مركز المملكة، الرياض"
                      value={boutiqueLocationAr}
                      onChange={(e) => setBoutiqueLocationAr(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                {/* Announcement Banner English & Arabic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Announcement Banner Text (English)
                    </label>
                    <input
                      type="text"
                      placeholder="Next-Day Express Delivery across Riyadh on orders over SAR 900"
                      value={deliveryNotice}
                      onChange={(e) => setDeliveryNotice(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Announcement Banner Text (Arabic)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="توصيل سريع مجاني في اليوم التالي في الرياض للطلبات فوق 900 ر.س"
                      value={deliveryNoticeAr}
                      onChange={(e) => setDeliveryNoticeAr(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>

                {/* Regional Support Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Support Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+966 5555 1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Support Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="saudi@ramillette.com"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateways Enabled */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-1">
                  4. Enabled Payment Gateways
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-neutral-50 text-xs">
                    <input
                      type="checkbox"
                      checked={paymentCod}
                      onChange={(e) => setPaymentCod(e.target.checked)}
                      className="rounded text-[#b6713e]"
                    />
                    <span className="font-semibold">Cash on Delivery</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-neutral-50 text-xs">
                    <input
                      type="checkbox"
                      checked={paymentOnline}
                      onChange={(e) => setPaymentOnline(e.target.checked)}
                      className="rounded text-[#b6713e]"
                    />
                    <span className="font-semibold">Credit/Debit Cards</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-neutral-50 text-xs">
                    <input
                      type="checkbox"
                      checked={paymentTabby}
                      onChange={(e) => setPaymentTabby(e.target.checked)}
                      className="rounded text-[#b6713e]"
                    />
                    <span className="font-semibold">Tabby & Tamara</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 border rounded cursor-pointer hover:bg-neutral-50 text-xs">
                    <input
                      type="checkbox"
                      checked={paymentBenefit}
                      onChange={(e) => setPaymentBenefit(e.target.checked)}
                      className="rounded text-[#b6713e]"
                    />
                    <span className="font-semibold">BenefitPay / National</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-[#b6713e]"
                  />
                  <span>Publish market as Active for online shopping</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-9 px-6 text-xs font-bold inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving Market...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingCountry ? "Save Changes" : "Create Market"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
