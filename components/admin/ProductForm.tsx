"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Loader2,
  Check,
  Trash2,
  Plus,
  Globe,
  Eye,
  Sparkles,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Package,
  Info,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  active: boolean;
}

export interface VariantItem {
  id?: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  active: boolean;
}

export interface ImageItem {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface CountryPriceItem {
  country: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  active: boolean;
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand: string;
  categoryId?: string;
  sku?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  fragranceFamily?: string;
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  images: ImageItem[];
  variants: VariantItem[];
  countries?: CountryPriceItem[];
}

interface ProductFormProps {
  initialData?: ProductFormData | null;
  categories: CategoryOption[];
  countries: CountryOption[];
  isEdit?: boolean;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function ProductForm({
  initialData,
  categories,
  countries,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();

  // Basic Info State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [brand, setBrand] = useState(initialData?.brand || "Ramillette");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [sku, setSku] = useState(initialData?.sku || "");

  // Pricing & Stock
  const [basePrice, setBasePrice] = useState<number>(initialData?.basePrice ?? 650);
  const [compareAtPrice, setCompareAtPrice] = useState<number | "">(
    initialData?.compareAtPrice ?? ""
  );
  const [stock, setStock] = useState<number>(initialData?.stock ?? 100);

  // Descriptions
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");

  // Olfactory Profile
  const [fragranceFamily, setFragranceFamily] = useState(
    initialData?.fragranceFamily || "Woody Oriental"
  );
  const [topNotes, setTopNotes] = useState(initialData?.topNotes || "");
  const [heartNotes, setHeartNotes] = useState(initialData?.heartNotes || "");
  const [baseNotes, setBaseNotes] = useState(initialData?.baseNotes || "");

  // Visibility & Badges
  const [active, setActive] = useState<boolean>(initialData?.active ?? true);
  const [featured, setFeatured] = useState<boolean>(initialData?.featured ?? false);
  const [bestseller, setBestseller] = useState<boolean>(initialData?.bestseller ?? false);
  const [newArrival, setNewArrival] = useState<boolean>(initialData?.newArrival ?? true);

  // Images
  const [images, setImages] = useState<ImageItem[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [{ url: "/images/products/royal-oud.webp", alt: "", sortOrder: 0 }]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Variants
  const [variants, setVariants] = useState<VariantItem[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants
      : [
          { name: "50ml", sku: "", price: basePrice ? Math.round(basePrice * 0.75) : 485, compareAtPrice: null, stock: 50, active: true },
          { name: "100ml", sku: "", price: basePrice || 650, compareAtPrice: null, stock: 50, active: true },
        ]
  );

  // Regional Pricing Matrix
  const [countryPricing, setCountryPricing] = useState<CountryPriceItem[]>(() => {
    return countries.map((c) => {
      const existing = initialData?.countries?.find((cp) => cp.country === c.code);
      if (existing) {
        return {
          country: c.code,
          price: Number(existing.price),
          compareAtPrice: existing.compareAtPrice ? Number(existing.compareAtPrice) : null,
          stock: existing.stock ?? 50,
          active: existing.active ?? true,
        };
      }
      // Calculate from exchange rate
      const converted = Math.round(basePrice * c.exchangeRate * 100) / 100;
      return {
        country: c.code,
        price: converted,
        compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * c.exchangeRate * 100) / 100 : null,
        stock: 50,
        active: true,
      };
    });
  });

  // UI States
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-generate slug from name
  const handleAutoSlug = () => {
    if (name) {
      setSlug(slugify(name));
    }
  };

  // Recalculate regional rates from current base price
  const handleRecalculateRegionalRates = () => {
    setCountryPricing((prev) =>
      prev.map((item) => {
        const c = countries.find((country) => country.code === item.country);
        const rate = c?.exchangeRate || 1.0;
        return {
          ...item,
          price: Math.round(basePrice * rate * 100) / 100,
          compareAtPrice: compareAtPrice
            ? Math.round(Number(compareAtPrice) * rate * 100) / 100
            : null,
        };
      })
    );
  };

  // Image actions
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([
        ...images,
        {
          url: newImageUrl.trim(),
          alt: name || "Perfume bottle",
          sortOrder: images.length,
        },
      ]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Variant actions
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        name: "30ml",
        sku: sku ? `${sku}-30ML` : "",
        price: Math.round(basePrice * 0.55),
        compareAtPrice: null,
        stock: 30,
        active: true,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantItem, value: any) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Regional pricing actions
  const handleCountryPriceChange = (
    countryCode: string,
    field: keyof CountryPriceItem,
    value: any
  ) => {
    setCountryPricing((prev) =>
      prev.map((item) =>
        item.country === countryCode ? { ...item, [field]: value } : item
      )
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    if (!name.trim()) {
      setError("Please enter a fragrance title.");
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() ? slugify(slug) : slugify(name),
      brand: brand.trim() || "Ramillette",
      categoryId: categoryId || null,
      sku: sku.trim() || null,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock),
      description: description.trim(),
      shortDescription: shortDescription.trim() || null,
      fragranceFamily: fragranceFamily.trim() || null,
      topNotes: topNotes.trim() || null,
      heartNotes: heartNotes.trim() || null,
      baseNotes: baseNotes.trim() || null,
      active,
      featured,
      bestseller,
      newArrival,
      images,
      variants,
      countryPricing,
    };

    try {
      const url = isEdit && initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save fragrance.");
      }

      setSaved(true);
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the fragrance.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteProduct = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${initialData.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete fragrance");
        setDeleteConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete fragrance");
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-[#1c1c1c]">
              {isEdit ? `Edit Fragrance: ${name || "Untitled"}` : "Add New Fragrance"}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isEdit
                ? "Update bottle specifications, fragrance pyramid notes, variants, and regional market pricing."
                : "Create a new luxury perfume with full olfactory details, gallery media, and multi-country pricing."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isEdit && slug ? (
            <Link
              href={`/product/${slug}`}
              target="_blank"
              className="btn-secondary h-9 px-3 text-xs font-semibold flex items-center gap-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
            >
              <Eye size={13} />
              <span>Storefront View</span>
            </Link>
          ) : null}

          {isEdit && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="btn-secondary h-9 px-3 text-xs font-semibold flex items-center gap-1.5 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}

          <button
            type="submit"
            disabled={saving || saved}
            className="btn-primary h-9 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving Fragrance...</span>
              </>
            ) : saved ? (
              <>
                <Check size={14} />
                <span>Fragrance Saved!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isEdit ? "Save Changes" : "Publish Fragrance"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: General Information */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Sparkles size={16} className="text-[#b6713e]" />
          <h2 className="text-sm font-bold text-[#1c1c1c]">
            1. Fragrance Identification & Cataloging
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Fragrance Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Oud Al-Doha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e] font-semibold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-neutral-700">
                URL Slug (Unique handle) *
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[10px] text-[#b6713e] font-bold hover:underline"
              >
                Auto-generate from Name
              </button>
            </div>
            <div className="flex items-center">
              <span className="bg-neutral-100 text-neutral-500 px-2.5 py-2.5 text-xs border border-r-0 border-neutral-300 rounded-l font-mono">
                /product/
              </span>
              <input
                type="text"
                required
                placeholder="royal-oud-al-doha"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-r focus:outline-none focus:border-[#b6713e] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Brand / Maison
            </label>
            <input
              type="text"
              placeholder="Ramillette"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              SKU / Master Barcode
            </label>
            <input
              type="text"
              placeholder="RAM-ROYAL-OUD"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Pricing & Inventory */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <DollarSign size={16} className="text-[#b6713e]" />
          <h2 className="text-sm font-bold text-[#1c1c1c]">
            2. Base Pricing (QAR) & Global Stock
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Base Price (QAR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400 text-xs">
                QAR
              </span>
              <input
                type="number"
                step="0.5"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs pl-12 pr-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Compare-at Price (QAR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400 text-xs">
                QAR
              </span>
              <input
                type="number"
                step="0.5"
                placeholder="Optional strike-through"
                value={compareAtPrice}
                onChange={(e) =>
                  setCompareAtPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                className="w-full text-xs pl-12 pr-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Total Master Inventory Stock
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e] font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Descriptions */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Info size={16} className="text-[#b6713e]" />
          <h2 className="text-sm font-bold text-[#1c1c1c]">
            3. Fragrance Story & Detailed Description
          </h2>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
            Short Tagline / Catchphrase
          </label>
          <input
            type="text"
            placeholder="A regal synthesis of aged Cambodian oud and velvety damask rose."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
            Full Olfactory Narrative & Description *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Describe the inspiration, opening character, dry-down, and luxury heritage of this fragrance..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e] leading-relaxed"
          />
        </div>
      </div>

      {/* Section 4: Olfactory Pyramid */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Layers size={16} className="text-[#b6713e]" />
          <h2 className="text-sm font-bold text-[#1c1c1c]">
            4. Olfactory Pyramid (Perfumer's Signature)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Fragrance Family
            </label>
            <input
              type="text"
              placeholder="e.g. Woody Oriental, Floral Amber, Fresh Citrus Leather"
              value={fragranceFamily}
              onChange={(e) => setFragranceFamily(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Top Notes (Opening)
            </label>
            <input
              type="text"
              placeholder="e.g. Italian Bergamot, Pink Pepper, Saffron"
              value={topNotes}
              onChange={(e) => setTopNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Heart Notes (Core)
            </label>
            <input
              type="text"
              placeholder="e.g. Bulgarian Rose, Moroccan Iris, Smoked Cedar"
              value={heartNotes}
              onChange={(e) => setHeartNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Base Notes (Dry Down)
            </label>
            <input
              type="text"
              placeholder="e.g. Cambodian Oud, Ambergris, Bourbon Vanilla, Sandalwood"
              value={baseNotes}
              onChange={(e) => setBaseNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Badges & Storefront Visibility */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Eye size={16} className="text-[#b6713e]" />
          <h2 className="text-sm font-bold text-[#1c1c1c]">
            5. Storefront Badges & Visibility
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded text-[#b6713e] focus:ring-[#b6713e]"
            />
            <div>
              <span className="block text-xs font-bold text-[#1c1c1c]">Active</span>
              <span className="block text-[10px] text-neutral-400">Published online</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded text-[#b6713e] focus:ring-[#b6713e]"
            />
            <div>
              <span className="block text-xs font-bold text-[#1c1c1c]">Featured</span>
              <span className="block text-[10px] text-neutral-400">Homepage curation</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={(e) => setBestseller(e.target.checked)}
              className="rounded text-[#b6713e] focus:ring-[#b6713e]"
            />
            <div>
              <span className="block text-xs font-bold text-[#1c1c1c]">Best Seller</span>
              <span className="block text-[10px] text-neutral-400">Top customer choice</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              checked={newArrival}
              onChange={(e) => setNewArrival(e.target.checked)}
              className="rounded text-[#b6713e] focus:ring-[#b6713e]"
            />
            <div>
              <span className="block text-xs font-bold text-[#1c1c1c]">New Arrival</span>
              <span className="block text-[10px] text-neutral-400">Highlighted release</span>
            </div>
          </label>
        </div>
      </div>

      {/* Section 6: Media Gallery */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-[#b6713e]" />
            <h2 className="text-sm font-bold text-[#1c1c1c]">
              6. Product Media & Gallery ({images.length} images)
            </h2>
          </div>
        </div>

        {/* Existing Images Thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative bg-[#fbf9f5] border border-neutral-200 rounded-lg overflow-hidden p-1 flex flex-col items-center"
            >
              <div className="relative w-full h-28">
                <Image
                  src={img.url}
                  alt={img.alt || `Product image ${idx + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="120px"
                />
              </div>
              <div className="w-full text-center py-1 border-t border-neutral-200 flex items-center justify-between px-2 bg-white">
                <span className="text-[10px] font-mono text-neutral-400">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                  title="Remove Image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Image Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Paste image URL (e.g. /images/products/royal-oud.webp or https://...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 text-xs px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-[#b6713e]"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="btn-secondary h-8 px-3 text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            <span>Add Image</span>
          </button>
        </div>
      </div>

      {/* Section 7: Bottle Sizes & Variants */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#b6713e]" />
            <h2 className="text-sm font-bold text-[#1c1c1c]">
              7. Bottle Sizes & Variants ({variants.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddVariant}
            className="btn-secondary h-7 px-2.5 text-xs font-bold flex items-center gap-1 text-[#b6713e] bg-[#faedcd]/40 border border-[#ecdec1]"
          >
            <Plus size={12} />
            <span>Add Size / Variant</span>
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50/50"
            >
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                  Size / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50ml or 100ml"
                  value={v.name}
                  onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white font-bold"
                />
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                  Price (QAR)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={v.price}
                  onChange={(e) =>
                    handleVariantChange(idx, "price", parseFloat(e.target.value) || 0)
                  }
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white font-semibold"
                />
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                  Compare Price
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Optional"
                  value={v.compareAtPrice ?? ""}
                  onChange={(e) =>
                    handleVariantChange(
                      idx,
                      "compareAtPrice",
                      e.target.value === "" ? null : parseFloat(e.target.value)
                    )
                  }
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white"
                />
              </div>

              <div className="w-full sm:w-20">
                <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">
                  Stock
                </label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) =>
                    handleVariantChange(idx, "stock", parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-between sm:justify-start gap-2">
                <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) => handleVariantChange(idx, "active", e.target.checked)}
                    className="rounded text-[#b6713e]"
                  />
                  <span>Active</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                  title="Remove variant"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 8: Regional Pricing Matrix */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#b6713e]" />
            <div>
              <h2 className="text-sm font-bold text-[#1c1c1c]">
                8. Regional Multi-Market Pricing & Local Stock
              </h2>
              <p className="text-[11px] text-neutral-500">
                Configure country-specific prices and warehouse stocks for Qatar, UAE, Bahrain, Saudi Arabia, and newly added markets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRecalculateRegionalRates}
            className="btn-secondary h-8 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
            title="Update all country prices from current base price and exchange rates"
          >
            <RefreshCw size={12} />
            <span>Recalculate from Exchange Rates</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fbf9f5] text-neutral-600 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Market</th>
                <th className="py-2.5 px-3">Currency</th>
                <th className="py-2.5 px-3">Regional Price</th>
                <th className="py-2.5 px-3">Compare-at Price</th>
                <th className="py-2.5 px-3">Warehouse Stock</th>
                <th className="py-2.5 px-3 text-right">Selling in Market</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {countryPricing.map((cp) => {
                const c = countries.find((item) => item.code === cp.country);
                return (
                  <tr key={cp.country} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c?.flag}</span>
                        <div>
                          <span className="font-bold text-[#1c1c1c] block">{c?.name || cp.country}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">1 QAR ≈ {c?.exchangeRate} {c?.currency}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      {c?.currency} ({c?.currencySymbol})
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.1"
                        value={cp.price}
                        onChange={(e) =>
                          handleCountryPriceChange(
                            cp.country,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 px-2 py-1 border border-neutral-300 rounded font-bold text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Optional"
                        value={cp.compareAtPrice ?? ""}
                        onChange={(e) =>
                          handleCountryPriceChange(
                            cp.country,
                            "compareAtPrice",
                            e.target.value === "" ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-24 px-2 py-1 border border-neutral-300 rounded text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={cp.stock}
                        onChange={(e) =>
                          handleCountryPriceChange(
                            cp.country,
                            "stock",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-20 px-2 py-1 border border-neutral-300 rounded text-xs font-semibold"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cp.active}
                          onChange={(e) =>
                            handleCountryPriceChange(cp.country, "active", e.target.checked)
                          }
                          className="rounded text-[#b6713e]"
                        />
                        <span
                          className={`text-[11px] font-semibold ${
                            cp.active ? "text-emerald-700" : "text-neutral-400"
                          }`}
                        >
                          {cp.active ? "Available" : "Disabled"}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-[10px] border border-[#e5e5e5] shadow-xs">
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        >
          Discard and return to catalog
        </Link>

        <button
          type="submit"
          disabled={saving || saved}
          className="btn-primary h-9 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Fragrance...</span>
            </>
          ) : saved ? (
            <>
              <Check size={14} />
              <span>Fragrance Saved!</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>{isEdit ? "Save Changes" : "Publish Fragrance"}</span>
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1c1c1c]">
                  Delete Fragrance
                </h3>
                <p className="text-xs text-neutral-500">
                  Are you sure you want to delete <strong>{name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded border border-neutral-200">
              This will remove the fragrance, all regional pricing overrides, image records, and variants. Past customer orders containing this product will maintain their historical items.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="btn-secondary h-9 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="btn-primary h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 border-red-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Fragrance</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
