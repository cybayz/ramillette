"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Gift,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { GiftWrapOption } from "@/lib/country/config";

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
  giftWrapFee?: number;
  allowGiftWrap?: boolean;
  giftWrapOptions?: GiftWrapOption[];
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
  const [giftWrapFee, setGiftWrapFee] = useState(25);
  const [allowGiftWrap, setAllowGiftWrap] = useState(true);
  const [giftWrapOptions, setGiftWrapOptions] = useState<GiftWrapOption[]>([]);
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

  // Sub-modal state for editing/adding single wrap option inside Country modal
  const [isWrapOptModalOpen, setIsWrapOptModalOpen] = useState(false);
  const [editingWrapOptIdx, setEditingWrapOptIdx] = useState<number | null>(null);
  const [wrapOptId, setWrapOptId] = useState("");
  const [wrapOptName, setWrapOptName] = useState("");
  const [wrapOptNameAr, setWrapOptNameAr] = useState("");
  const [wrapOptPrice, setWrapOptPrice] = useState(10);
  const [wrapOptImage, setWrapOptImage] = useState("");
  const [wrapOptBadge, setWrapOptBadge] = useState("");
  const [wrapOptDesc, setWrapOptDesc] = useState("");

  const handleOpenNewWrapOption = () => {
    setEditingWrapOptIdx(null);
    setWrapOptId("");
    setWrapOptName("");
    setWrapOptNameAr("");
    setWrapOptPrice(10);
    setWrapOptImage("/gift-wrap/paper-wrap.jpg");
    setWrapOptBadge("");
    setWrapOptDesc("");
    setIsWrapOptModalOpen(true);
  };

  const handleOpenEditWrapOption = (idx: number) => {
    const opt = giftWrapOptions[idx];
    setEditingWrapOptIdx(idx);
    setWrapOptId(opt.id);
    setWrapOptName(opt.name);
    setWrapOptNameAr(opt.nameAr || "");
    setWrapOptPrice(opt.price);
    setWrapOptImage(opt.image || "");
    setWrapOptBadge(opt.badge || "");
    setWrapOptDesc(opt.description || "");
    setIsWrapOptModalOpen(true);
  };

  const handleSaveWrapOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wrapOptName.trim()) return;

    const finalId =
      wrapOptId.trim() ||
      wrapOptName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newOpt: GiftWrapOption = {
      id: finalId,
      name: wrapOptName.trim(),
      nameAr: wrapOptNameAr.trim() || undefined,
      price: Number(wrapOptPrice) || 0,
      description: wrapOptDesc.trim(),
      image: wrapOptImage.trim() || undefined,
      badge: wrapOptBadge.trim() || undefined,
      active: true,
    };

    setGiftWrapOptions((prev) => {
      const copy = [...prev];
      if (editingWrapOptIdx !== null) {
        copy[editingWrapOptIdx] = { ...copy[editingWrapOptIdx], ...newOpt };
      } else {
        copy.push(newOpt);
      }
      return copy;
    });

    setIsWrapOptModalOpen(false);
  };

  const handleDeleteWrapOption = (idx: number) => {
    if (confirm("Remove this packaging option?")) {
      setGiftWrapOptions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

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
    setGiftWrapFee(25);
    setAllowGiftWrap(true);
    setGiftWrapOptions([
      {
        id: "free-card",
        name: "Complimentary Luxury Message Card",
        nameAr: "بطاقة إهداء فاخرة مجانية",
        price: 0,
        description: "Handwritten personal note on our signature gold-embossed card with a wax seal envelope.",
        descriptionAr: "رسالة مكتوبة بخط اليد على بطاقة مذهبة ومغلفة بختم شمعي مميز ومغلف ملكي.",
        image: "",
        badge: "Free",
        active: true,
      },
      {
        id: "paper-wrap",
        name: "Classic Artisanal Paper Wrap",
        nameAr: "تغليف ورقي فاخر بشريط حريري",
        price: 10,
        description: "Textured cream & gold foil gift paper with hand-tied satin ribbon and royal wax seal stamp.",
        descriptionAr: "ورق تغليف كريمي فاخر بنقوش ذهبية مع شريط ستان أنيق وختم شمعي ملكي أصلي.",
        image: "/gift-wrap/paper-wrap.jpg",
        active: true,
      },
      {
        id: "custom-box",
        name: "Bespoke Keepsake Gift Box",
        nameAr: "صندوق هدايا ملكي ممغنط ومخملي",
        price: 50,
        description: "Rigid magnetic presentation box, champagne silk velvet cushioning, ribbon and wax emblem.",
        descriptionAr: "صندوق فاخر ببطانة حريرية مخملية وشريط حريري وختم راميليت الملكي المميز.",
        image: "/gift-wrap/custom-box.jpg",
        badge: "Most Popular",
        active: true,
      },
      {
        id: "flowers-chocolates",
        name: "Royal VIP Box with Flowers & Chocolates",
        nameAr: "باقة ملكية مع ورود طبيعية وشوكولاتة سويسرية",
        price: 100,
        description: "Lavish presentation box, preserved Ecuadorian roses, and gourmet gold-wrapped Swiss chocolates.",
        descriptionAr: "صندوق ملكي متكامل مع باقة ورود إكوادورية دائمة، وشوكولاتة سويسرية فاخرة وبطاقة خاصة.",
        image: "/gift-wrap/flowers-chocolate-box.jpg",
        badge: "Ultimate Luxury",
        active: true,
      },
    ]);
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
    setGiftWrapFee(c.giftWrapFee !== undefined ? c.giftWrapFee : 25);
    setAllowGiftWrap(c.allowGiftWrap !== undefined ? c.allowGiftWrap : true);
    setGiftWrapOptions(
      c.giftWrapOptions && c.giftWrapOptions.length > 0
        ? c.giftWrapOptions
        : [
            {
              id: "free-card",
              name: "Complimentary Luxury Message Card",
              nameAr: "بطاقة إهداء فاخرة مجانية",
              price: 0,
              description: "Handwritten personal note on our signature gold-embossed card with a wax seal envelope.",
              descriptionAr: "رسالة مكتوبة بخط اليد على بطاقة مذهبة ومغلفة بختم شمعي مميز ومغلف ملكي.",
              image: "",
              badge: "Free",
              active: true,
            },
            {
              id: "paper-wrap",
              name: "Classic Artisanal Paper Wrap",
              nameAr: "تغليف ورقي فاخر بشريط حريري",
              price: c.currency === "BHD" ? 1 : 10,
              description: "Textured cream & gold foil gift paper with hand-tied satin ribbon and royal wax seal stamp.",
              descriptionAr: "ورق تغليف كريمي فاخر بنقوش ذهبية مع شريط ستان أنيق وختم شمعي ملكي أصلي.",
              image: "/gift-wrap/paper-wrap.jpg",
              active: true,
            },
            {
              id: "custom-box",
              name: "Bespoke Keepsake Gift Box",
              nameAr: "صندوق هدايا ملكي ممغنط ومخملي",
              price: c.currency === "BHD" ? 5 : 50,
              description: "Rigid magnetic presentation box, champagne silk velvet cushioning, ribbon and wax emblem.",
              descriptionAr: "صندوق فاخر ببطانة حريرية مخملية وشريط حريري وختم راميليت الملكي المميز.",
              image: "/gift-wrap/custom-box.jpg",
              badge: "Most Popular",
              active: true,
            },
            {
              id: "flowers-chocolates",
              name: "Royal VIP Box with Flowers & Chocolates",
              nameAr: "باقة ملكية مع ورود طبيعية وشوكولاتة سويسرية",
              price: c.currency === "BHD" ? 10 : 100,
              description: "Lavish presentation box, preserved Ecuadorian roses, and gourmet gold-wrapped Swiss chocolates.",
              descriptionAr: "صندوق ملكي متكامل مع باقة ورود إكوادورية دائمة، وشوكولاتة سويسرية فاخرة وبطاقة خاصة.",
              image: "/gift-wrap/flowers-chocolate-box.jpg",
              badge: "Ultimate Luxury",
              active: true,
            },
          ]
    );
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
        giftWrapFee: Number(giftWrapFee),
        allowGiftWrap: Boolean(allowGiftWrap),
        giftWrapOptions,
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

                <div className="bg-[#fbf9f5] p-2.5 rounded-md border border-[#ecdec1]/50 col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-[#b6713e]" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Luxury Gift Wrap Packages
                      </span>
                      <span className="font-bold text-[#1c1c1c] text-xs">
                        {c.allowGiftWrap !== false
                          ? `${c.giftWrapOptions ? c.giftWrapOptions.filter(o => o.active !== false && o.price > 0).length : 3} packages configured`
                          : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      c.allowGiftWrap !== false
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {c.allowGiftWrap !== false ? "Active in Checkout" : "Disabled"}
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

                  {/* Luxury Gift Wrap Settings & Packages */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-[8px] space-y-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1c1c1c]">
                        <Gift size={15} className="text-[#b6713e]" />
                        <span>Luxury Gift Wrap Packages & Regional Pricing ({currency})</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowGiftWrap}
                          onChange={(e) => setAllowGiftWrap(e.target.checked)}
                          className="w-4 h-4 text-[#b6713e] rounded focus:ring-[#b6713e]"
                        />
                        <span className="text-xs font-semibold text-neutral-700">
                          Enable Gift Wrapping in Checkout
                        </span>
                      </label>
                    </div>

                    <p className="text-[11px] text-neutral-500">
                      Configure regional pricing and presentation options for gift wrap. Customers will see these sample photos and prices when selecting gift wrap at checkout.
                    </p>

                    {/* Gift Wrap Packages List Header */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-neutral-700">
                        Configured Presentation Packages ({giftWrapOptions.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/admin/gift-wrap"
                          target="_blank"
                          className="text-[11px] font-bold text-[#b6713e] hover:underline flex items-center gap-1"
                        >
                          <span>Packaging Studio</span>
                          <ExternalLink size={11} />
                        </Link>
                        <button
                          type="button"
                          onClick={handleOpenNewWrapOption}
                          className="px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#b6713e] text-white text-[11px] font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add Package</span>
                        </button>
                      </div>
                    </div>

                    {/* Gift Wrap Packages List */}
                    <div className="space-y-3 pt-1">
                      {giftWrapOptions.map((opt, idx) => (
                        <div
                          key={opt.id || `gwo-${idx}`}
                          className="p-3 bg-white border border-[#e5e5e5] rounded-[6px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {opt.image ? (
                              <div className="relative w-12 h-12 rounded border border-[#e5e5e5] overflow-hidden shrink-0 bg-neutral-50">
                                <Image
                                  src={opt.image}
                                  alt={opt.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded border border-dashed border-[#d5d5d5] flex items-center justify-center text-neutral-400 shrink-0 bg-neutral-50">
                                <Gift size={18} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1c1c1c] truncate">{opt.name}</span>
                                {opt.badge && (
                                  <span className="text-[9px] bg-[#faedcd] text-[#b6713e] font-bold px-1.5 py-0.5 rounded">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                                {opt.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-neutral-400 font-semibold">{currency}</span>
                              <input
                                type="number"
                                step="1"
                                disabled={!allowGiftWrap}
                                value={opt.price}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  setGiftWrapOptions((prev) =>
                                    prev.map((o, i) => (i === idx ? { ...o, price: newPrice } : o))
                                  );
                                }}
                                className="w-20 text-xs px-2 py-1.5 border border-neutral-300 rounded font-mono font-bold text-right focus:outline-none focus:border-[#b6713e]"
                              />
                            </div>
                            <label className="flex items-center gap-1 text-[11px] text-neutral-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={opt.active !== false}
                                onChange={(e) => {
                                  const isActive = e.target.checked;
                                  setGiftWrapOptions((prev) =>
                                    prev.map((o, i) => (i === idx ? { ...o, active: isActive } : o))
                                  );
                                }}
                                className="w-3.5 h-3.5 text-[#b6713e] rounded"
                              />
                              <span>Active</span>
                            </label>
                            <div className="flex items-center gap-1 pl-1 border-l border-neutral-200">
                              <button
                                type="button"
                                onClick={() => handleOpenEditWrapOption(idx)}
                                className="p-1 rounded text-[#b6713e] hover:bg-[#faedcd]/40"
                                title="Edit full option details"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWrapOption(idx)}
                                className="p-1 rounded text-red-500 hover:bg-red-50"
                                title="Delete option"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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

      {/* Sub-modal: Add / Edit Single Wrap Option */}
      {isWrapOptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[10px] border border-[#e5e5e5] w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ece1]">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-[#b6713e]" />
                <h4 className="font-bold text-sm text-[#1c1c1c]">
                  {editingWrapOptIdx !== null ? "Edit Packaging Option" : "Add Packaging Option"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsWrapOptModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveWrapOption} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Option ID / Slug *
                  </label>
                  <input
                    type="text"
                    value={wrapOptId}
                    onChange={(e) => setWrapOptId(e.target.value)}
                    placeholder="e.g. custom-box"
                    className="w-full p-2 border rounded font-mono text-[11px]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Price ({currency || "Price"}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={wrapOptPrice}
                    onChange={(e) => setWrapOptPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={wrapOptName}
                    onChange={(e) => setWrapOptName(e.target.value)}
                    placeholder="e.g. Bespoke Keepsake Box"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={wrapOptNameAr}
                    onChange={(e) => setWrapOptNameAr(e.target.value)}
                    placeholder="e.g. صندوق هدايا ملكي"
                    dir="rtl"
                    className="w-full p-2 border rounded font-arabic"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Sample Photo URL
                </label>
                <input
                  type="text"
                  value={wrapOptImage}
                  onChange={(e) => setWrapOptImage(e.target.value)}
                  placeholder="e.g. /gift-wrap/custom-box.jpg"
                  className="w-full p-2 border rounded font-mono text-[11px]"
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setWrapOptImage("/gift-wrap/paper-wrap.jpg")}
                    className="text-[10px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded"
                  >
                    Paper Wrap
                  </button>
                  <button
                    type="button"
                    onClick={() => setWrapOptImage("/gift-wrap/custom-box.jpg")}
                    className="text-[10px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded"
                  >
                    Custom Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setWrapOptImage("/gift-wrap/flowers-chocolate-box.jpg")}
                    className="text-[10px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded"
                  >
                    VIP Flowers Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setWrapOptImage("")}
                    className="text-[10px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-500"
                  >
                    None (Card)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Badge (Optional)
                </label>
                <input
                  type="text"
                  value={wrapOptBadge}
                  onChange={(e) => setWrapOptBadge(e.target.value)}
                  placeholder="e.g. Free, Most Popular, Ultimate Luxury"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  value={wrapOptDesc}
                  onChange={(e) => setWrapOptDesc(e.target.value)}
                  placeholder="Details of the wrapping materials..."
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWrapOptModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-neutral-600 hover:bg-neutral-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#b6713e] hover:bg-[#9a5d30] text-white font-bold rounded"
                >
                  {editingWrapOptIdx !== null ? "Update Option" : "Add to Market"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
