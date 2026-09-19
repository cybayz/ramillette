"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Star,
  Loader2,
  X,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface AddressItem {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  area?: string | null;
  country: string;
  postalCode?: string | null;
  isDefault: boolean;
}

interface Props {
  initialAddresses: AddressItem[];
  defaultName?: string;
  defaultPhone?: string;
}

const COUNTRY_OPTIONS = [
  {
    code: "QA",
    name: "Qatar",
    nameAr: "قطر",
    flag: "🇶🇦",
    phonePrefix: "+974",
    cities: [
      "Doha",
      "Al Wakrah",
      "Al Rayyan",
      "Lusail",
      "Umm Salal",
      "Al Khor",
      "Al Daayen",
      "Al Shamal",
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    flag: "🇦🇪",
    phonePrefix: "+971",
    cities: [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
      "Ras Al Khaimah",
      "Fujairah",
      "Umm Al Quwain",
      "Al Ain",
    ],
  },
  {
    code: "BH",
    name: "Bahrain",
    nameAr: "البحرين",
    flag: "🇧🇭",
    phonePrefix: "+973",
    cities: [
      "Manama",
      "Muharraq",
      "Riffa",
      "Hamad Town",
      "A'ali",
      "Isa Town",
      "Sitra",
      "Budaiya",
      "Saar",
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    flag: "🇸🇦",
    phonePrefix: "+966",
    cities: [
      "Riyadh",
      "Jeddah",
      "Dammam",
      "Khobar",
      "Mecca",
      "Medina",
      "Dhahran",
    ],
  },
];

export function SavedAddressesManager({
  initialAddresses,
  defaultName = "",
  defaultPhone = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = Boolean(pathname?.startsWith("/ar"));

  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [country, setCountry] = useState("Qatar");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [city, setCity] = useState("Doha");
  const [area, setArea] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [isDefault, setIsDefault] = useState(addresses.length === 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeCountryOption =
    COUNTRY_OPTIONS.find(
      (c) => c.name.toLowerCase() === country.toLowerCase()
    ) || COUNTRY_OPTIONS[0];

  const handleCountryChange = (selectedCountryName: string) => {
    setCountry(selectedCountryName);
    const found = COUNTRY_OPTIONS.find((c) => c.name === selectedCountryName);
    if (found && found.cities.length > 0) {
      setCity(found.cities[0]);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setName(defaultName);
    setPhone(defaultPhone || activeCountryOption.phonePrefix + " ");
    setCountry("Qatar");
    setCity("Doha");
    setArea("");
    setAddressLine1("");
    setAddressLine2("");
    setIsDefault(addresses.length === 0);
    setErrorMessage("");
    setSuccessMessage("");
    setIsFormOpen(true);
  };

  const openEditForm = (addr: AddressItem) => {
    setEditingId(addr.id);
    setName(addr.name);
    setPhone(addr.phone);
    setCountry(addr.country || "Qatar");
    setCity(addr.city || "Doha");
    setArea(addr.area || "");
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setIsDefault(addr.isDefault);
    setErrorMessage("");
    setSuccessMessage("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        area: area.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        isDefault,
      };

      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : "/api/account/addresses";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save address.");
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === editingId) {
              return { ...data.address };
            }
            if (data.address.isDefault) {
              return { ...a, isDefault: false };
            }
            return a;
          })
        );
        setSuccessMessage(
          isAr ? "تم تحديث العنوان بنجاح." : "Address updated successfully."
        );
      } else {
        if (data.address.isDefault) {
          setAddresses((prev) => [
            data.address,
            ...prev.map((a) => ({ ...a, isDefault: false })),
          ]);
        } else {
          setAddresses((prev) => [...prev, data.address]);
        }
        setSuccessMessage(
          isAr ? "تمت إضافة العنوان بنجاح." : "New address added successfully."
        );
      }

      setIsFormOpen(false);
      setEditingId(null);
      router.refresh();
    } catch {
      setErrorMessage("Network error saving address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeDefault = async (id: string) => {
    setActionLoadingId(id);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ makeDefault: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to set default address.");
      } else {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
        router.refresh();
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        isAr
          ? "هل أنت متأكد من رغبتك في حذف هذا العنوان؟"
          : "Are you sure you want to delete this address?"
      )
    ) {
      return;
    }

    setActionLoadingId(id);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to delete address.");
      } else {
        setAddresses((prev) => {
          const filtered = prev.filter((a) => a.id !== id);
          // If deleted address was default, make first remaining default
          const wasDefault = prev.find((a) => a.id === id)?.isDefault;
          if (wasDefault && filtered.length > 0) {
            filtered[0].isDefault = true;
          }
          return filtered;
        });
        router.refresh();
      }
    } catch {
      setErrorMessage("Network error deleting address.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[#b6713e]" />
          <h2 className="text-lg font-bold text-[#1c1c1c]">
            {isAr ? "العناوين المحفوظة" : "Saved Addresses"}
          </h2>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#faedcd]/40 border border-[#ecdec1] text-xs font-bold text-[#b6713e] hover:bg-[#faedcd] transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>{isAr ? "إضافة عنوان جديد" : "+ Add New Address"}</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[6px] font-medium flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[6px] font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-500 hover:text-red-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Slide-down Form Modal / Drawer */}
      {isFormOpen && (
        <div className="p-5 bg-white border-2 border-[#b6713e]/30 rounded-[8px] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f0ece1]">
            <h3 className="text-sm font-bold text-[#1c1c1c] flex items-center gap-1.5">
              <MapPin size={15} className="text-[#b6713e]" />
              <span>
                {editingId
                  ? isAr
                    ? "تعديل العنوان"
                    : "Edit Address"
                  : isAr
                  ? "إضافة عنوان جديد"
                  : "Add New Delivery Address"}
              </span>
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Country Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                {isAr ? "الدولة *" : "Country *"}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {COUNTRY_OPTIONS.map((c) => {
                  const isSel =
                    c.name.toLowerCase() === country.toLowerCase();
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountryChange(c.name)}
                      className={`flex items-center gap-2 p-2 rounded-[5px] border text-xs font-semibold transition-all ${
                        isSel
                          ? "bg-[#faedcd]/40 border-[#b6713e] text-[#1c1c1c]"
                          : "border-[#e5e5e5] bg-white text-neutral-600 hover:border-neutral-400"
                      }`}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">
                        {isAr ? c.nameAr : c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  {isAr ? "الاسم الكامل للمستلم *" : "Recipient Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Al-Kuwari"
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  {isAr ? "رقم الهاتف *" : "Phone Number *"}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={`${activeCountryOption.phonePrefix} 5555 1234`}
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  {isAr ? "المدينة / المحافظة *" : "City / Zone *"}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e] bg-white font-medium cursor-pointer"
                >
                  {activeCountryOption.cities.map((cityOpt) => (
                    <option key={cityOpt} value={cityOpt}>
                      {cityOpt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  {isAr ? "المنطقة / الحي (اختياري)" : "Area / District (Optional)"}
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. West Bay or Downtown"
                  className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                {isAr ? "الشارع ورقم المبنى / الفيلا *" : "Street & Building / Villa Number *"}
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Villa 14, Street 920"
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                {isAr ? "رقم الشقة / معلم مميز (اختياري)" : "Apartment / Landmark / Notes (Optional)"}
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Tower 2, Apt 1402"
                className="w-full text-xs p-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-[#b6713e] focus:ring-[#b6713e]"
              />
              <span className="text-xs text-neutral-700 font-medium">
                {isAr
                  ? "تعيين كعنوان توصيل افتراضي"
                  : "Set as default delivery address"}
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0ece1]">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-[#e5e5e5] text-xs font-semibold text-neutral-600 rounded-[5px] hover:bg-neutral-50"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="px-5 text-xs font-bold"
              >
                {editingId
                  ? isAr
                    ? "تحديث العنوان"
                    : "Update Address"
                  : isAr
                  ? "حفظ العنوان"
                  : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Addresses List */}
      {addresses.length === 0 && !isFormOpen ? (
        <div className="p-6 bg-[#fbf9f5] rounded-[8px] border border-[#e5e5e5] text-center space-y-3">
          <MapPin size={28} className="mx-auto text-neutral-400" />
          <p className="text-xs text-neutral-600">
            {isAr
              ? "لم يتم حفظ أي عناوين بعد. يمكنك إضافة عنوان الآن لتسهيل عملية الطلب."
              : "No addresses saved yet. Add your delivery address now for fast checkout."}
          </p>
          <button
            type="button"
            onClick={openAddForm}
            className="btn-primary h-8 px-4 text-xs inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{isAr ? "إضافة عنوان جديد" : "Add New Address"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const isBusy = actionLoadingId === addr.id;
            return (
              <div
                key={addr.id}
                className={`p-4 rounded-[6px] border text-xs transition-all relative ${
                  addr.isDefault
                    ? "bg-[#faedcd]/20 border-[#b6713e]"
                    : "bg-[#fbf9f5] border-[#e5e5e5] hover:border-neutral-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[#f0ece1]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c1c1c] text-sm">
                      {addr.name}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-[#faedcd] text-[#b6713e] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#ecdec1] inline-flex items-center gap-1">
                        <Star size={10} className="fill-[#b6713e]" />
                        <span>{isAr ? "افتراضي" : "Default"}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(addr)}
                      title={isAr ? "تعديل" : "Edit"}
                      className="text-neutral-400 hover:text-[#b6713e] transition-colors p-1"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(addr.id)}
                      title={isAr ? "حذف" : "Delete"}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                    >
                      {isBusy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-0.5 text-neutral-600">
                  <p className="font-medium text-[#1c1c1c]">
                    {addr.addressLine1}
                  </p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p className="text-neutral-500">
                    {addr.area ? `${addr.area}, ` : ""}
                    {addr.city} • {addr.country}
                  </p>
                  <p className="text-neutral-500 font-mono text-[11px] pt-1">
                    {addr.phone}
                  </p>
                </div>

                {!addr.isDefault && (
                  <div className="pt-2 mt-2 border-t border-[#f0ece1] flex justify-end">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleMakeDefault(addr.id)}
                      className="text-[11px] font-semibold text-[#b6713e] hover:underline inline-flex items-center gap-1"
                    >
                      {isBusy ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Check size={11} />
                      )}
                      <span>
                        {isAr
                          ? "تعيين كعنوان افتراضي"
                          : "Set as Default Address"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
