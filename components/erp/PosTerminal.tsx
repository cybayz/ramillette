"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  CheckCircle2,
  Printer,
  Share2,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface PosItem {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  displayName: string;
  variantName?: string | null;
  sku: string;
  barcode?: string | null;
  price: number;
  currency: string;
  stock: number;
  availableStock: number;
  imageUrl?: string | null;
  categoryName?: string | null;
}

interface CartLineItem {
  item: PosItem;
  quantity: number;
  unitPrice: number;
}

interface PosTerminalProps {
  storeContext: {
    storeId: string;
    storeCode: string;
    storeName: string;
    regionName: string;
    countryCode: string;
    countryName: string;
    currency: string;
    taxRate: number;
  };
  cashierName: string;
}

export function PosTerminal({ storeContext, cashierName }: PosTerminalProps) {
  const [catalog, setCatalog] = useState<PosItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Customer state
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [primaryPaymentMethod, setPrimaryPaymentMethod] = useState<"CASH" | "CARD" | "BENEFIT_PAY">("CASH");
  const [cardRef, setCardRef] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt state
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeBufferRef = useRef<string>("");
  const barcodeTimerRef = useRef<any>(null);

  // Fetch store catalog
  const loadCatalog = async (q = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erp/pos/products?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load POS catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [storeContext.storeId]);

  // Global Barcode Scanner Listener & Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey F2: Focus Search
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // Hotkey F4: Customer Select
      if (e.key === "F4") {
        e.preventDefault();
        setIsCustomerModalOpen(true);
        return;
      }

      // Hotkey F8: Open Payment
      if (e.key === "F8") {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentModalOpen) {
          setIsPaymentModalOpen(true);
        }
        return;
      }

      // Hotkey Escape: Close active modals
      if (e.key === "Escape") {
        setIsPaymentModalOpen(false);
        setIsCustomerModalOpen(false);
        if (completedReceipt) setCompletedReceipt(null);
        return;
      }

      // Barcode Scanner Keystroke Interceptor
      // Scanners typically send keystrokes rapidly within 50ms per key, ending with Enter
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // If typing inside an input, don't hijack unless it's an Enter key with a buffered code
        if (e.key === "Enter" && barcodeBufferRef.current.length >= 8) {
          const scannedCode = barcodeBufferRef.current.trim();
          handleBarcodeScanned(scannedCode);
          barcodeBufferRef.current = "";
          return;
        }
      } else {
        // Not in input: capture keystrokes into barcode buffer
        if (e.key === "Enter") {
          if (barcodeBufferRef.current.length >= 6) {
            handleBarcodeScanned(barcodeBufferRef.current.trim());
          }
          barcodeBufferRef.current = "";
        } else if (e.key.length === 1) {
          barcodeBufferRef.current += e.key;
          clearTimeout(barcodeTimerRef.current);
          barcodeTimerRef.current = setTimeout(() => {
            barcodeBufferRef.current = "";
          }, 300);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [catalog, cart, isPaymentModalOpen]);

  const handleBarcodeScanned = (code: string) => {
    const match = catalog.find(
      (item) =>
        (item.barcode && item.barcode.trim() === code) ||
        (item.sku && item.sku.toLowerCase() === code.toLowerCase())
    );

    if (match) {
      addToCart(match);
      // Brief visual or sound feedback
    } else {
      // Re-query API if item wasn't in top catalog
      loadCatalog(code).then(() => {
        setSearchQuery(code);
      });
    }
  };

  // Cart operations
  const addToCart = (item: PosItem) => {
    if (item.availableStock <= 0) {
      alert(`"${item.displayName}" is currently out of stock in this branch.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((line) => line.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.availableStock) {
          alert(`Cannot exceed available store stock (${item.availableStock} units).`);
          return prev;
        }
        return prev.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...prev, { item, quantity: 1, unitPrice: item.price }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((line) => {
          if (line.item.id === itemId) {
            const newQty = line.quantity + delta;
            if (newQty > line.item.availableStock) {
              alert(`Cannot exceed available store stock (${line.item.availableStock} units).`);
              return line;
            }
            return newQty > 0 ? { ...line, quantity: newQty } : null;
          }
          return line;
        })
        .filter(Boolean) as CartLineItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((line) => line.item.id !== itemId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm("Are you sure you want to clear the current cart?")) {
      setCart([]);
      setDiscountAmount(0);
    }
  };

  // Totals calculation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    const taxable = Math.max(0, subtotal - discountAmount);
    return Number(((taxable * storeContext.taxRate) / 100).toFixed(2));
  }, [subtotal, discountAmount, storeContext.taxRate]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const changeDue = useMemo(() => {
    if (primaryPaymentMethod === "CASH" && cashTendered > totalAmount) {
      return cashTendered - totalAmount;
    }
    return 0;
  }, [primaryPaymentMethod, cashTendered, totalAmount]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((item) => {
      if (item.categoryName) set.add(item.categoryName);
    });
    return Array.from(set);
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchQuery));

      const matchesCat =
        selectedCategory === "all" || item.categoryName === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [catalog, searchQuery, selectedCategory]);

  // Submit POS Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessing(true);

      const idempotencyKey = `POS-${storeContext.storeCode}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const payments = [
        {
          method: primaryPaymentMethod,
          amount: totalAmount,
          reference: cardRef || null,
        },
      ];

      const payload = {
        idempotencyKey,
        items: cart.map((line) => ({
          productId: line.item.productId,
          variantId: line.item.variantId,
          name: line.item.name,
          variantName: line.item.variantName,
          sku: line.item.sku,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        customerName,
        customerPhone: customerPhone || null,
        payments,
        discount: discountAmount,
      };

      const res = await fetch("/api/erp/pos/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete sale");
      }

      // Success: show receipt modal, reset cart
      setCompletedReceipt(data.receipt);
      setCart([]);
      setDiscountAmount(0);
      setCashTendered(0);
      setCardRef("");
      setIsPaymentModalOpen(false);

      // Refresh catalog stock
      loadCatalog(searchQuery);
    } catch (err: any) {
      alert(`POS Transaction Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4 select-none">
      {/* LEFT AREA: Product Catalog & Fast Search (Flex 1) */}
      <div className="flex-1 flex flex-col bg-[#1c1c1c] border border-[#2a2a2a] rounded-[10px] p-4 min-w-0 overflow-hidden shadow-md">
        {/* Search Bar with Barcode Scanner Indicator */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#2a2a2a]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrance, SKU, or scan barcode (F2)..."
              className="w-full bg-[#262626] border border-[#383838] focus:border-[#faedcd] rounded-[6px] pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X size={14} />
              </button>
            ) : (
              <Barcode className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            )}
          </div>

          <button
            onClick={() => loadCatalog(searchQuery)}
            className="px-3 py-2.5 bg-[#2a2a2a] hover:bg-[#333333] border border-[#3d3d3d] rounded-[6px] text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Stock"
          >
            <RotateCcw size={14} />
          </button>

          <a
            href="/erp/returns"
            className="px-3 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] border border-[#383838] hover:border-amber-400/40 rounded-[6px] text-xs text-amber-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Customer Returns & Exchanges Desk"
          >
            <RotateCcw size={13} className="text-amber-300" />
            <span className="hidden sm:inline">Returns Desk</span>
          </a>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-b border-[#262626]">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-[5px] text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#faedcd] text-[#1c1c1c]"
                : "bg-[#242424] text-neutral-400 hover:text-white"
            }`}
          >
            All Fragrances ({catalog.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-[5px] text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#faedcd] text-[#1c1c1c]"
                  : "bg-[#242424] text-neutral-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1">
          {loading ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
              Loading in-store inventory...
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Barcode size={36} className="mb-2 opacity-50" />
              <span className="text-xs font-bold text-neutral-400">No matching fragrances found</span>
              <span className="text-[11px] mt-1">Try another search term or scan a physical bottle barcode</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredCatalog.map((item) => {
                const isOutOfStock = item.availableStock <= 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={isOutOfStock}
                    className={`text-left p-2.5 rounded-[8px] border transition-all flex flex-col justify-between group cursor-pointer relative ${
                      isOutOfStock
                        ? "bg-[#181818] border-[#222222] opacity-50 cursor-not-allowed"
                        : "bg-[#222222] border-[#2f2f2f] hover:border-[#faedcd] hover:bg-[#282828] shadow-xs active:scale-[0.98]"
                    }`}
                  >
                    {/* Image & Stock Badge */}
                    <div className="relative w-full aspect-square bg-[#171717] rounded-[6px] overflow-hidden mb-2 flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.displayName}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Sparkles size={24} className="text-neutral-600" />
                      )}

                      {/* In-store Available Stock Badge */}
                      <span
                        className={`absolute top-1.5 right-1.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow-xs ${
                          item.availableStock > 10
                            ? "bg-emerald-900/90 text-emerald-300 border border-emerald-700"
                            : item.availableStock > 0
                            ? "bg-amber-900/90 text-amber-300 border border-amber-700"
                            : "bg-red-900/90 text-red-300 border border-red-700"
                        }`}
                      >
                        {item.availableStock} in stock
                      </span>
                    </div>

                    {/* Title & SKU */}
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate leading-tight group-hover:text-[#faedcd] transition-colors">
                        {item.name}
                      </div>
                      {item.variantName && (
                        <span className="text-[10px] font-bold text-neutral-400 block truncate">
                          Size: {item.variantName}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-neutral-500 block truncate">
                        {item.sku}
                      </span>
                    </div>

                    {/* Price & Add Indicator */}
                    <div className="mt-2 pt-1.5 border-t border-[#2d2d2d] flex items-center justify-between">
                      <span className="text-xs font-black font-mono text-[#faedcd]">
                        {item.currency} {item.price.toFixed(2)}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-[#faedcd]/10 text-[#faedcd] flex items-center justify-center group-hover:bg-[#faedcd] group-hover:text-[#1c1c1c] transition-colors">
                        <Plus size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Cashier Cart, Customer & Checkout (Width: 380px) */}
      <div className="w-full lg:w-96 flex flex-col bg-[#1c1c1c] border border-[#2a2a2a] rounded-[10px] p-4 shadow-xl shrink-0">
        {/* Customer Header */}
        <div className="pb-3 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#2a2a2a] text-[#faedcd] flex items-center justify-center">
              <User size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white truncate block">
                {customerName}
              </span>
              <span className="text-[10px] text-neutral-400 block truncate">
                {customerPhone || "Standard In-Store Sale"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="text-[10px] font-bold text-[#faedcd] hover:underline px-2 py-1 rounded bg-[#2a2a2a] hover:bg-[#333333] transition-colors cursor-pointer"
          >
            Change (F4)
          </button>
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <ShoppingCart size={32} className="mb-2 opacity-30" />
              <span className="text-xs font-bold text-neutral-400">Register Cart is Empty</span>
              <span className="text-[11px] mt-1">Scan a bottle or tap an item from the left catalog</span>
            </div>
          ) : (
            cart.map((line) => (
              <div
                key={line.item.id}
                className="bg-[#242424] border border-[#303030] rounded-[6px] p-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {line.item.displayName}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <span>{line.item.currency} {line.unitPrice.toFixed(2)}</span>
                    <span>•</span>
                    <span className="text-[#faedcd] font-bold">
                      {line.item.currency} {(line.unitPrice * line.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quantity Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(line.item.id, -1)}
                    className="w-6 h-6 rounded bg-[#2e2e2e] hover:bg-[#3a3a3a] text-neutral-300 flex items-center justify-center cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-6 text-center text-xs font-mono font-extrabold text-white">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(line.item.id, 1)}
                    className="w-6 h-6 rounded bg-[#2e2e2e] hover:bg-[#3a3a3a] text-neutral-300 flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                  <button
                    onClick={() => removeFromCart(line.item.id)}
                    className="w-6 h-6 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center ml-1 cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Totals & Actions */}
        <div className="pt-3 border-t border-[#2a2a2a] space-y-2 bg-[#1c1c1c]">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">
                {storeContext.currency} {subtotal.toFixed(2)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono">
                  -{storeContext.currency} {discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {storeContext.taxRate > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>VAT ({storeContext.taxRate}%):</span>
                <span className="font-mono text-white">
                  {storeContext.currency} {taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-white pt-1 border-t border-[#2f2f2f]">
              <span>TOTAL:</span>
              <span className="font-mono text-[#faedcd]">
                {storeContext.currency} {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-2 py-2.5 rounded-[6px] bg-[#292929] hover:bg-[#333333] text-neutral-400 hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={cart.length === 0}
              className="col-span-3 py-2.5 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CreditCard size={15} />
              <span>Charge {storeContext.currency} {totalAmount.toFixed(2)} (F8)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Customer Selector (F4) */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#222222] border border-[#383838] rounded-[10px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#303030] pb-2">
              <h3 className="text-sm font-black text-white">Select Customer (F4)</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Al-Kuwari"
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-[6px] px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+974 5500 1234"
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-[6px] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#303030]">
              <button
                onClick={() => {
                  setCustomerName("Walk-in Customer");
                  setCustomerPhone("");
                  setIsCustomerModalOpen(false);
                }}
                className="flex-1 py-2 rounded bg-[#2e2e2e] text-xs font-bold text-neutral-300 hover:text-white"
              >
                Reset to Guest
              </button>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="flex-1 py-2 rounded bg-[#faedcd] text-xs font-black text-[#1c1c1c]"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Payment Tender (F8) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#333333] rounded-[10px] w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#faedcd] font-bold uppercase tracking-wider">
                  Checkout Settlement
                </span>
                <h3 className="text-base font-black text-white">Payment Method & Tender</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Total Amount Banner */}
            <div className="bg-[#181818] border border-[#2b2b2b] rounded-[8px] p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-neutral-400">Total Payable</span>
                <div className="text-2xl font-black font-mono text-[#faedcd]">
                  {storeContext.currency} {totalAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-right text-[11px] text-neutral-400">
                <span>Items: {cart.reduce((s, l) => s + l.quantity, 0)} bottles</span>
                <div className="text-white font-bold">{customerName}</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPrimaryPaymentMethod("CASH")}
                className={`p-3 rounded-[6px] border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  primaryPaymentMethod === "CASH"
                    ? "bg-[#faedcd]/15 border-[#faedcd] text-white"
                    : "bg-[#181818] border-[#2f2f2f] text-neutral-400 hover:text-white"
                }`}
              >
                <Banknote size={20} className={primaryPaymentMethod === "CASH" ? "text-[#faedcd]" : ""} />
                <span className="text-xs font-bold">Cash</span>
              </button>

              <button
                onClick={() => setPrimaryPaymentMethod("CARD")}
                className={`p-3 rounded-[6px] border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  primaryPaymentMethod === "CARD"
                    ? "bg-[#faedcd]/15 border-[#faedcd] text-white"
                    : "bg-[#181818] border-[#2f2f2f] text-neutral-400 hover:text-white"
                }`}
              >
                <CreditCard size={20} className={primaryPaymentMethod === "CARD" ? "text-[#faedcd]" : ""} />
                <span className="text-xs font-bold">Card / Terminal</span>
              </button>

              <button
                onClick={() => setPrimaryPaymentMethod("BENEFIT_PAY")}
                className={`p-3 rounded-[6px] border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  primaryPaymentMethod === "BENEFIT_PAY"
                    ? "bg-[#faedcd]/15 border-[#faedcd] text-white"
                    : "bg-[#181818] border-[#2f2f2f] text-neutral-400 hover:text-white"
                }`}
              >
                <Smartphone size={20} className={primaryPaymentMethod === "BENEFIT_PAY" ? "text-[#faedcd]" : ""} />
                <span className="text-xs font-bold">QR / App</span>
              </button>
            </div>

            {/* Cash Tender & Change Calculations */}
            {primaryPaymentMethod === "CASH" ? (
              <div className="space-y-2 bg-[#181818] border border-[#2b2b2b] rounded-[6px] p-3">
                <label className="text-xs font-bold text-neutral-300 block">Cash Received from Customer:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    placeholder={`e.g. ${Math.ceil(totalAmount)}`}
                    className="w-full bg-[#222222] border border-[#333333] rounded-[5px] px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                  <button
                    onClick={() => setCashTendered(totalAmount)}
                    className="px-3 py-2 bg-[#2d2d2d] hover:bg-[#383838] text-xs font-bold text-neutral-300 rounded whitespace-nowrap cursor-pointer"
                  >
                    Exact
                  </button>
                </div>

                {changeDue > 0 && (
                  <div className="flex justify-between items-center pt-2 text-xs border-t border-[#262626]">
                    <span className="text-neutral-400">Change Due to Customer:</span>
                    <strong className="text-emerald-400 font-mono text-sm font-bold">
                      {storeContext.currency} {changeDue.toFixed(2)}
                    </strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#181818] border border-[#2b2b2b] rounded-[6px] p-3 space-y-1">
                <label className="text-xs font-bold text-neutral-300 block">Card Approval / Auth Reference (Optional):</label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. QNB-AUTH-9842"
                  className="w-full bg-[#222222] border border-[#333333] rounded-[5px] px-3 py-2 text-xs text-white"
                />
              </div>
            )}

            {/* Discount Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-neutral-400">Apply Custom Discount:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-mono">{storeContext.currency}</span>
                <input
                  type="number"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0.00"
                  className="w-20 bg-[#181818] border border-[#333333] rounded px-2 py-1 text-right text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Complete Sale Confirmation Button */}
            <div className="flex gap-2 pt-2 border-t border-[#2d2d2d]">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="py-2.5 px-4 rounded bg-[#2a2a2a] hover:bg-[#333333] text-xs font-bold text-neutral-300 cursor-pointer"
              >
                Back to Cart
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Authorizing & Deducting Stock...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Sale & Print Receipt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Completed Sale Thermal Receipt View */}
      {completedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#383838] rounded-[10px] w-full max-w-sm p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header with Print Buttons */}
            <div className="flex justify-between items-center border-b border-[#2e2e2e] pb-3 print:hidden">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <CheckCircle2 size={16} />
                <span>Sale Completed Successfully</span>
              </div>
              <button onClick={() => setCompletedReceipt(null)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Canvas */}
            <div className="bg-white text-black p-4 rounded-[4px] font-mono text-[11px] leading-tight space-y-3">
              <div className="text-center border-b border-dashed border-neutral-400 pb-2.5">
                <div className="font-black text-sm tracking-wider uppercase">RAMILLETTE</div>
                <div className="text-[10px] text-neutral-600 font-sans">Haute Parfumerie</div>
                <div className="text-[10px] mt-1">{completedReceipt.storeName}</div>
                <div className="text-[9px] text-neutral-600">{completedReceipt.storeAddress}</div>
                <div className="text-[9px] text-neutral-600">{completedReceipt.storePhone}</div>
              </div>

              <div className="border-b border-dashed border-neutral-400 pb-2 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span className="font-bold">{completedReceipt.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(completedReceipt.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{completedReceipt.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{completedReceipt.customerName}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-b border-dashed border-neutral-400 pb-2 space-y-1.5 text-[10px]">
                {completedReceipt.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <div className="pr-2">
                      <div className="font-bold">{it.name}</div>
                      <div className="text-[9px] text-neutral-600">
                        {it.quantity} &times; {completedReceipt.currency} {it.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <span className="font-bold shrink-0">
                      {completedReceipt.currency} {it.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{completedReceipt.currency} {completedReceipt.subtotal.toFixed(2)}</span>
                </div>
                {completedReceipt.discount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Discount:</span>
                    <span>-{completedReceipt.currency} {completedReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                {completedReceipt.tax > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT ({completedReceipt.taxRate}%):</span>
                    <span>{completedReceipt.currency} {completedReceipt.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-black">
                  <span>TOTAL:</span>
                  <span>{completedReceipt.currency} {completedReceipt.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-neutral-600 border-t border-dashed border-neutral-400">
                <div>Thank you for choosing Ramillette!</div>
                <div>Please retain this receipt for returns within 14 days.</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded bg-[#faedcd] text-[#1c1c1c] font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer size={15} />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="py-2.5 px-4 rounded bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 text-xs font-bold cursor-pointer"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
