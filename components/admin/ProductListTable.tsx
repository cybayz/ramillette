"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Search, Edit3, Trash2, Package, Globe, Plus, Loader2 } from "lucide-react";
import { RegionalProductEditorModal } from "@/components/admin/RegionalProductEditorModal";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  categoryName?: string;
  basePrice: number;
  stock: number;
  active: boolean;
  variantsCount: number;
  imageUrl?: string;
}

export function ProductListTable({
  initialProducts,
}: {
  initialProducts: AdminProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [regionalModalProductId, setRegionalModalProductId] = useState<string | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.categoryName &&
        p.categoryName.toLowerCase().includes(query.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  const handleDelete = async () => {
    if (!deleteProductTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deleteProductTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deleteProductTarget.id));
        setDeleteProductTarget(null);
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("An error occurred while deleting the fragrance.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#e5e5e5] shadow-xs p-6 space-y-6">
      {/* Search Header & Add Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by perfume name, category, or SKU..."
            className="w-full text-xs pl-9 pr-3 py-2.5 border border-[#e5e5e5] rounded-[5px] focus:outline-none focus:border-[#b6713e]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">
            Showing <strong>{filtered.length}</strong> of {products.length} fragrances
          </span>

          <Link
            href="/admin/products/new"
            className="btn-primary h-8 px-3 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <Plus size={13} />
            <span>Add Fragrance</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fbf9f5] text-neutral-600 font-bold uppercase text-[11px]">
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Base Price</th>
              <th className="py-3 px-3">Inventory Stock</th>
              <th className="py-3 px-3">Variants</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece1]">
            {filtered.map((product) => {
              return (
                <tr key={product.id} className="hover:bg-[#fbf9f5]/50 transition-colors">
                  {/* Product Title & Image */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-[#fbf9f5] rounded-[4px] border border-[#e5e5e5] overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : null}
                      </div>
                      <div>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-bold text-[#1c1c1c] hover:text-[#b6713e] transition-colors"
                        >
                          {product.name}
                        </Link>
                        {product.sku && (
                          <span className="block text-[11px] text-neutral-400 font-mono">
                            {product.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-neutral-600 font-medium">
                    {product.categoryName || "Unassigned"}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-[#1c1c1c]">
                      {formatPrice(product.basePrice)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        product.stock <= 20
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>

                  {/* Variants */}
                  <td className="py-3 px-3 text-neutral-500 font-medium">
                    {product.variantsCount} sizes
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRegionalModalProductId(product.id)}
                        className="btn-secondary h-8 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-[#b6713e] bg-[#faedcd]/40 border border-[#ecdec1] hover:bg-[#faedcd]/80 transition-colors shadow-2xs"
                        title="Manage Regional Pricing & Warehouse Stock"
                      >
                        <Globe size={13} />
                        <span className="hidden sm:inline">Regional Pricing</span>
                      </button>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="btn-secondary h-8 px-3 text-xs font-semibold flex items-center gap-1.5 text-neutral-700 hover:text-[#1c1c1c] hover:border-neutral-400 transition-colors"
                        title="Edit all fragrance fields, olfactory notes, variants and images"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteProductTarget(product)}
                        className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete fragrance"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Regional Pricing Modal */}
      {regionalModalProductId && (
        <RegionalProductEditorModal
          productId={regionalModalProductId}
          isOpen={Boolean(regionalModalProductId)}
          onClose={() => setRegionalModalProductId(null)}
          onSaved={() => {
            // Modal saved cleanly
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductTarget && (
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
                  Are you sure you want to delete <strong>{deleteProductTarget.name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded border border-neutral-200">
              This will permanently remove the fragrance, variants, gallery images, and regional pricing records.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProductTarget(null)}
                disabled={deleting}
                className="btn-secondary h-9 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-primary h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 border-red-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
