"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Globe,
  Loader2,
  Check,
  Sparkles,
  AlertCircle,
  Package,
  Layers,
  Save,
} from "lucide-react";

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol?: string;
  currencyDecimals: number;
  exchangeRate: number;
  active: boolean;
}

interface ProductCountryItem {
  country: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  active: boolean;
}

interface VariantCountryItem {
  variantId: string;
  country: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  active: boolean;
}

interface VariantItem {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  countries: Array<{
    country: string;
    price: number | string;
    compareAtPrice: number | string | null;
    stock: number;
    active: boolean;
  }>;
}

interface RegionalProductEditorModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function RegionalProductEditorModal({
  productId,
  isOpen,
  onClose,
  onSaved,
}: RegionalProductEditorModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [regionalPricing, setRegionalPricing] = useState<Record<string, ProductCountryItem>>({});
  const [variantPricing, setVariantPricing] = useState<Record<string, VariantCountryItem>>({});
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [activeTab, setActiveTab] = useState<"product" | "variants">("product");

  useEffect(() => {
    if (!isOpen || !productId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    Promise.all([
      fetch(`/api/admin/products/${productId}`).then((r) => r.json()),
      fetch(`/api/admin/countries`).then((r) => r.json()),
    ])
      .then(([prodRes, countryRes]) => {
        if (!prodRes.success) throw new Error(prodRes.error || "Failed to load product");
        const p = prodRes.product;
        setProduct(p);

        const loadedCountries: CountryOption[] = countryRes.countries || [];
        setCountries(loadedCountries);

        // Map existing product country records
        const initialPricing: Record<string, ProductCountryItem> = {};
        const baseNum = Number(p.basePrice);

        for (const c of loadedCountries) {
          const existing = p.countries?.find((pc: any) => pc.country === c.code);
          if (existing) {
            initialPricing[c.code] = {
              country: c.code,
              price: Number(existing.price),
              compareAtPrice: existing.compareAtPrice ? Number(existing.compareAtPrice) : null,
              stock: existing.stock,
              active: existing.active,
            };
          } else {
            // Default calculation from rate
            const rate = Number(c.exchangeRate) || 1.0;
            const defPrice = c.currencyDecimals === 3
              ? Number((baseNum * rate).toFixed(3))
              : Math.round(baseNum * rate);

            initialPricing[c.code] = {
              country: c.code,
              price: defPrice,
              compareAtPrice: null,
              stock: Math.round((p.stock || 50) * 0.5),
              active: true,
            };
          }
        }
        setRegionalPricing(initialPricing);

        // Map variant countries
        const vars: VariantItem[] = p.variants || [];
        setVariants(vars);

        const initialVarPricing: Record<string, VariantCountryItem> = {};
        for (const v of vars) {
          const varBasePrice = Number(v.price) || baseNum;
          for (const c of loadedCountries) {
            const key = `${v.id}_${c.code}`;
            const existingVc = v.countries?.find((vc: any) => vc.country === c.code);
            if (existingVc) {
              initialVarPricing[key] = {
                variantId: v.id,
                country: c.code,
                price: Number(existingVc.price),
                compareAtPrice: existingVc.compareAtPrice ? Number(existingVc.compareAtPrice) : null,
                stock: existingVc.stock,
                active: existingVc.active,
              };
            } else {
              const rate = Number(c.exchangeRate) || 1.0;
              const defPrice = c.currencyDecimals === 3
                ? Number((varBasePrice * rate).toFixed(3))
                : Math.round(varBasePrice * rate);

              initialVarPricing[key] = {
                variantId: v.id,
                country: c.code,
                price: defPrice,
                compareAtPrice: null,
                stock: Math.round((v.stock || 30) * 0.5),
                active: true,
              };
            }
          }
        }
        setVariantPricing(initialVarPricing);
      })
      .catch((err) => {
        setError(err.message || "Failed to load details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, productId]);

  const handlePriceChange = (countryCode: string, field: "price" | "compareAtPrice" | "stock", value: string) => {
    setRegionalPricing((prev) => {
      const current = prev[countryCode];
      if (!current) return prev;
      return {
        ...prev,
        [countryCode]: {
          ...current,
          [field]: field === "compareAtPrice" && !value ? null : Number(value) || 0,
        },
      };
    });
  };

  const handleActiveToggle = (countryCode: string) => {
    setRegionalPricing((prev) => {
      const current = prev[countryCode];
      if (!current) return prev;
      return {
        ...prev,
        [countryCode]: {
          ...current,
          active: !current.active,
        },
      };
    });
  };

  const handleVariantPriceChange = (
    variantId: string,
    countryCode: string,
    field: "price" | "compareAtPrice" | "stock",
    value: string
  ) => {
    const key = `${variantId}_${countryCode}`;
    setVariantPricing((prev) => {
      const current = prev[key];
      if (!current) return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          [field]: field === "compareAtPrice" && !value ? null : Number(value) || 0,
        },
      };
    });
  };

  const handleAutoCalculateRates = () => {
    if (!product) return;
    const baseNum = Number(product.basePrice);

    setRegionalPricing((prev) => {
      const updated = { ...prev };
      for (const c of countries) {
        const rate = Number(c.exchangeRate) || 1.0;
        const autoPrice = c.currencyDecimals === 3
          ? Number((baseNum * rate).toFixed(3))
          : Math.round(baseNum * rate);

        if (updated[c.code]) {
          updated[c.code] = {
            ...updated[c.code],
            price: autoPrice,
          };
        }
      }
      return updated;
    });

    // Also calculate for variants
    setVariantPricing((prev) => {
      const updated = { ...prev };
      for (const v of variants) {
        const varBasePrice = Number(v.price) || baseNum;
        for (const c of countries) {
          const key = `${v.id}_${c.code}`;
          const rate = Number(c.exchangeRate) || 1.0;
          const autoPrice = c.currencyDecimals === 3
            ? Number((varBasePrice * rate).toFixed(3))
            : Math.round(varBasePrice * rate);

          if (updated[key]) {
            updated[key] = {
              ...updated[key],
              price: autoPrice,
            };
          }
        }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const countryPricingArray = Object.values(regionalPricing);
      const variantCountryPricingArray = Object.values(variantPricing);

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryPricing: countryPricingArray,
          variantCountryPricing: variantCountryPricingArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update regional settings");

      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#e5e5e5] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fbf9f5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#faedcd] border border-[#ecdec1] flex items-center justify-center text-[#b6713e]">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1c1c1c]">
                Regional Pricing & Warehouse Stock
              </h2>
              <p className="text-xs text-neutral-500">
                {product ? product.name : "Loading perfume..."} • Base Price: QAR {product?.basePrice}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#b6713e] animate-spin" />
              <p className="text-xs text-neutral-500 font-medium">Loading regional market configurations...</p>
            </div>
          ) : error && !product ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Product Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-[8px] gap-3">
                <div className="flex items-center gap-3">
                  {product.images?.[0]?.url && (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 object-cover rounded-md border border-neutral-200"
                    />
                  )}
                  <div>
                    <span className="text-xs font-bold text-[#1c1c1c] block">
                      {product.name}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Category: {product.category?.name || "None"} • Global Base: QAR {product.basePrice}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoCalculateRates}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#b6713e] text-[#b6713e] rounded-[5px] hover:bg-[#faedcd]/40 transition-colors shadow-2xs"
                  >
                    <Sparkles size={13} />
                    <span>Auto-Calculate from Rates</span>
                  </button>
                </div>
              </div>

              {/* Tabs if variants exist */}
              {variants.length > 0 && (
                <div className="flex border-b border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab("product")}
                    className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                      activeTab === "product"
                        ? "border-[#b6713e] text-[#b6713e]"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <Package size={14} />
                    <span>Standard Bottle ({countries.length} Markets)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("variants")}
                    className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                      activeTab === "variants"
                        ? "border-[#b6713e] text-[#b6713e]"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <Layers size={14} />
                    <span>Variants ({variants.length} Sizes)</span>
                  </button>
                </div>
              )}

              {/* Main Product Table */}
              {activeTab === "product" && (
                <div className="overflow-x-auto border border-neutral-200 rounded-[8px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fbf9f5] border-b border-neutral-200 text-neutral-700">
                      <tr>
                        <th className="py-2.5 px-3.5 font-bold">Country / Market</th>
                        <th className="py-2.5 px-3 font-bold">Currency</th>
                        <th className="py-2.5 px-3 font-bold">Regional Price</th>
                        <th className="py-2.5 px-3 font-bold">Compare-At Price</th>
                        <th className="py-2.5 px-3 font-bold">Warehouse Stock</th>
                        <th className="py-2.5 px-3.5 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {countries.map((c) => {
                        const item = regionalPricing[c.code] || {
                          country: c.code,
                          price: 0,
                          compareAtPrice: null,
                          stock: 0,
                          active: true,
                        };

                        return (
                          <tr
                            key={c.code}
                            className={`hover:bg-neutral-50/80 transition-colors ${
                              !item.active ? "opacity-60 bg-neutral-100/50" : ""
                            }`}
                          >
                            <td className="py-3 px-3.5 font-semibold text-[#1c1c1c]">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <div>
                                  <span>{c.name}</span>
                                  <span className="text-[10px] text-neutral-400 block font-normal">
                                    Rate: x{c.exchangeRate} vs QAR
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-[#b6713e]">
                              {c.currency}
                            </td>
                            <td className="py-3 px-3">
                              <div className="relative max-w-[120px]">
                                <input
                                  type="number"
                                  step={c.currencyDecimals === 3 ? "0.001" : "0.01"}
                                  value={item.price}
                                  onChange={(e) =>
                                    handlePriceChange(c.code, "price", e.target.value)
                                  }
                                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-[4px] font-mono font-bold focus:outline-none focus:border-[#b6713e]"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="relative max-w-[120px]">
                                <input
                                  type="number"
                                  step={c.currencyDecimals === 3 ? "0.001" : "0.01"}
                                  value={item.compareAtPrice ?? ""}
                                  placeholder="None"
                                  onChange={(e) =>
                                    handlePriceChange(c.code, "compareAtPrice", e.target.value)
                                  }
                                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-[4px] font-mono focus:outline-none focus:border-[#b6713e]"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="relative max-w-[100px]">
                                <input
                                  type="number"
                                  value={item.stock}
                                  onChange={(e) =>
                                    handlePriceChange(c.code, "stock", e.target.value)
                                  }
                                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-[4px] font-mono font-semibold focus:outline-none focus:border-[#b6713e]"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleActiveToggle(c.code)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                  item.active
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-neutral-200 text-neutral-600 border border-neutral-300"
                                }`}
                              >
                                {item.active ? "Selling" : "Disabled"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Variants Section */}
              {activeTab === "variants" && (
                <div className="space-y-6">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="border border-neutral-200 rounded-[8px] overflow-hidden"
                    >
                      <div className="bg-[#fbf9f5] px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1c1c1c]">
                          Variant: {v.name} {v.sku ? `(${v.sku})` : ""}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          Base: QAR {v.price}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
                            <tr>
                              <th className="py-2 px-3 font-semibold">Country</th>
                              <th className="py-2 px-3 font-semibold">Currency</th>
                              <th className="py-2 px-3 font-semibold">Variant Price</th>
                              <th className="py-2 px-3 font-semibold">Compare-At</th>
                              <th className="py-2 px-3 font-semibold">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {countries.map((c) => {
                              const key = `${v.id}_${c.code}`;
                              const item = variantPricing[key] || {
                                variantId: v.id,
                                country: c.code,
                                price: Number(v.price),
                                compareAtPrice: null,
                                stock: 20,
                                active: true,
                              };

                              return (
                                <tr key={c.code} className="hover:bg-neutral-50/60">
                                  <td className="py-2.5 px-3">
                                    <span className="mr-1.5">{c.flag}</span>
                                    <span>{c.name}</span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[#b6713e] font-bold">
                                    {c.currency}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="number"
                                      step={c.currencyDecimals === 3 ? "0.001" : "0.01"}
                                      value={item.price}
                                      onChange={(e) =>
                                        handleVariantPriceChange(
                                          v.id,
                                          c.code,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      className="max-w-[100px] text-xs px-2 py-1 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="number"
                                      step={c.currencyDecimals === 3 ? "0.001" : "0.01"}
                                      value={item.compareAtPrice ?? ""}
                                      placeholder="None"
                                      onChange={(e) =>
                                        handleVariantPriceChange(
                                          v.id,
                                          c.code,
                                          "compareAtPrice",
                                          e.target.value
                                        )
                                      }
                                      className="max-w-[100px] text-xs px-2 py-1 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="number"
                                      value={item.stock}
                                      onChange={(e) =>
                                        handleVariantPriceChange(
                                          v.id,
                                          c.code,
                                          "stock",
                                          e.target.value
                                        )
                                      }
                                      className="max-w-[80px] text-xs px-2 py-1 border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#b6713e]"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-xs flex items-center gap-2">
                  <Check size={15} />
                  <span>Regional pricing and stock levels saved successfully!</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e5e5] bg-[#fbf9f5] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary h-9 px-5 text-xs inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : success ? (
              <>
                <Check size={14} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Regional Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
