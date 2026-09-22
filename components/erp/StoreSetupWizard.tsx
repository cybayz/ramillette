"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  CheckCircle2,
  Building2,
  MapPin,
  Coins,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Store,
} from "lucide-react";

interface SetupCountry {
  code: string;
  name: string;
  currency: string;
  flag: string;
  taxRate: number;
}

interface SetupRegion {
  id: string;
  countryCode: string;
  name: string;
}

export function StoreSetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<SetupCountry[]>([]);
  const [regions, setRegions] = useState<SetupRegion[]>([]);
  const [existingStores, setExistingStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCountryCode, setSelectedCountryCode] = useState("QA");
  const [regionName, setRegionName] = useState("Doha");
  const [storeName, setStoreName] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeCurrency, setStoreCurrency] = useState("QAR");
  const [storeTaxRate, setStoreTaxRate] = useState(0);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const res = await fetch("/api/erp/setup");
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries || []);
          setRegions(data.regions || []);
          setExistingStores(data.stores || []);
        }
      } catch (err) {
        console.error("Setup data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  // Update defaults when country changes
  useEffect(() => {
    const c = countries.find((item) => item.code === selectedCountryCode);
    if (c) {
      setStoreCurrency(c.currency);
      setStoreTaxRate(c.taxRate);
    }
  }, [selectedCountryCode, countries]);

  const handleNext = () => {
    if (step === 1 && !selectedCountryCode) {
      alert("Please choose a Country.");
      return;
    }
    if (step === 2 && !regionName.trim()) {
      alert("Please enter a Region / Municipality name.");
      return;
    }
    if (step === 3 && (!storeName.trim() || !storeCode.trim())) {
      alert("Store Name and unique Store Code are required.");
      return;
    }
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteSetup = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/erp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: selectedCountryCode,
          regionName,
          storeName,
          storeCode,
          address: storeAddress,
          phone: storePhone,
          email: storeEmail,
          currency: storeCurrency,
          taxRate: storeTaxRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to configure store");

      // Switch context to newly created store
      await fetch("/api/erp/stores/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: data.store.id }),
      });

      alert(`Branch ${data.store.name} initialized successfully!`);
      router.push("/erp");
      router.refresh();
    } catch (err: any) {
      alert(`Setup Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    "Country Selection",
    "Regional Cluster",
    "Store Name & Code",
    "Location & Contact",
    "Currency & Tax Rules",
    "Review & Launch",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faedcd]/10 border border-[#faedcd]/20 text-[#faedcd] text-xs font-mono font-bold">
          <Sliders size={13} />
          <span>Branch Initialization Wizard</span>
        </div>
        <h1 className="text-2xl font-black text-white">Configure Physical Store Branch</h1>
        <p className="text-xs text-neutral-400">
          Step {step} of 6: {stepTitles[step - 1]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= step ? "bg-[#faedcd]" : "bg-[#282828]"
            }`}
          />
        ))}
      </div>

      {/* Step Card */}
      <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[10px] p-6 shadow-xl space-y-5">
        {/* STEP 1: Country */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Select Store Country:</h3>
              <p className="text-xs text-neutral-400">
                Determines national catalog availability, base currency, and cross-border protection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountryCode(c.code)}
                  className={`p-4 rounded-[8px] border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                    selectedCountryCode === c.code
                      ? "bg-[#faedcd]/15 border-[#faedcd] text-white"
                      : "bg-[#222222] border-[#2e2e2e] text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <span className="font-bold text-sm block text-white">{c.name}</span>
                    <span className="text-xs text-neutral-400 font-mono">{c.currency}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Region */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Define Store Region / Municipality:</h3>
              <p className="text-xs text-neutral-400">
                Used by the online order router to assign fulfillment to the closest store.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">Region Name:</label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="e.g. Doha, Al Rayyan, Abu Dhabi, Downtown Dubai"
                className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Store Name & Unique Code */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Store Name & Code:</h3>
              <p className="text-xs text-neutral-400">
                The store code is stamped on receipts, POS order numbers, and stock ledger events.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Store Name:</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Ramillette Place Vendôme Boutique"
                  className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Store Code (Unique Identifier):
                </label>
                <input
                  type="text"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DOH-003, DXB-002"
                  className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Physical Address & Contact */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Address & Contact Info:</h3>
              <p className="text-xs text-neutral-400">
                Printed on customer thermal receipts and used for courier handoff.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Physical Address:</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="e.g. Ground Floor, Canal Walk, Place Vendôme Mall, Lusail"
                  className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Branch Phone:</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="+974 4400 1122"
                    className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Branch Email:</label>
                  <input
                    type="email"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    placeholder="vendome@ramillette.com"
                    className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Currency & Tax */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Currency & Tax Configuration:</h3>
              <p className="text-xs text-neutral-400">
                Inherited from country settings, customizable per physical branch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Branch Currency:</label>
                <input
                  type="text"
                  value={storeCurrency}
                  onChange={(e) => setStoreCurrency(e.target.value.toUpperCase())}
                  className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Tax / VAT Rate (%):</label>
                <input
                  type="number"
                  value={storeTaxRate}
                  onChange={(e) => setStoreTaxRate(Number(e.target.value))}
                  className="w-full bg-[#242424] border border-[#383838] rounded-[6px] px-3.5 py-2.5 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Launch */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Review Branch Setup:</h3>
              <p className="text-xs text-neutral-400">
                Confirm configurations. Initial store inventory will be automatically seeded from the central catalog.
              </p>
            </div>

            <div className="p-4 bg-[#181818] border border-[#2b2b2b] rounded-[8px] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Country:</span>
                <strong className="text-white">{selectedCountryCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Region:</span>
                <strong className="text-white">{regionName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Store Name:</span>
                <strong className="text-white">{storeName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Store Code:</span>
                <strong className="text-white font-mono">{storeCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Currency:</span>
                <strong className="text-white font-mono">{storeCurrency}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">VAT Rate:</span>
                <strong className="text-white">{storeTaxRate}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Physical Address:</span>
                <strong className="text-white truncate max-w-xs">{storeAddress || "N/A"}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-[#2a2a2a]">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-[6px] bg-[#242424] hover:bg-[#2c2c2c] text-xs font-bold text-neutral-300 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-[6px] bg-[#faedcd] hover:bg-[#ebd59f] text-[#1c1c1c] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleCompleteSetup}
              disabled={submitting}
              className="px-6 py-2.5 rounded-[6px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? "Initializing Branch..." : "Launch Branch & Seed Stock"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
