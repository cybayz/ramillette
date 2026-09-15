import React from "react";
import { Sparkles, Wind, Clock } from "lucide-react";

interface FragranceNotesPyramidProps {
  topNotes?: string | null;
  heartNotes?: string | null;
  baseNotes?: string | null;
  fragranceFamily?: string | null;
}

export function FragranceNotesPyramid({
  topNotes = "Bergamot, Sicilian Lemon, Pink Pepper",
  heartNotes = "Damascena Rose, French Lavender, Ambergris",
  baseNotes = "Royal Arabian Oud, Madagascar Vanilla, Rich Amber",
  fragranceFamily = "Oriental Woody / Amber Floral",
}: FragranceNotesPyramidProps) {
  return (
    <div className="space-y-6">
      {/* Fragrance Family Tag */}
      {fragranceFamily && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#faedcd] border border-[#ecdec1] rounded-full text-xs font-semibold text-[#1c1c1c]">
          <Sparkles size={13} className="text-[#b6713e]" />
          <span>Olfactory Family: {fragranceFamily}</span>
        </div>
      )}

      {/* Olfactory Pyramid Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Notes */}
        <div className="p-4 rounded-[6px] bg-[#fbf9f5] border border-[#e5e5e5]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#b6713e] block mb-1">
            Top Notes (First 15 Mins)
          </span>
          <p className="text-sm font-semibold text-[#1c1c1c]">{topNotes}</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">
            Instant burst of fresh citrus & vibrant aromatics upon spraying.
          </span>
        </div>

        {/* Heart Notes */}
        <div className="p-4 rounded-[6px] bg-[#fbf9f5] border border-[#e5e5e5]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#b6713e] block mb-1">
            Heart Notes (2 – 6 Hours)
          </span>
          <p className="text-sm font-semibold text-[#1c1c1c]">{heartNotes}</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">
            The core character: opulent florals, spices, and warm resin.
          </span>
        </div>

        {/* Base Notes */}
        <div className="p-4 rounded-[6px] bg-[#fbf9f5] border border-[#e5e5e5]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#b6713e] block mb-1">
            Base Notes (6 – 24+ Hours)
          </span>
          <p className="text-sm font-semibold text-[#1c1c1c]">{baseNotes}</p>
          <span className="text-[11px] text-neutral-500 mt-2 block">
            Deep lingering sillage of aged agarwood oud and golden amber.
          </span>
        </div>
      </div>

      {/* Sillage & Longevity Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-3 bg-white border border-[#e5e5e5] rounded-[5px] flex items-center gap-3">
          <Clock size={20} className="text-[#b6713e] shrink-0" />
          <div>
            <span className="text-xs font-bold text-[#1c1c1c] block">
              Longevity: 12 – 16 Hours
            </span>
            <span className="text-[11px] text-neutral-500">
              High fragrance oil concentration (Extrait de Parfum quality)
            </span>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#e5e5e5] rounded-[5px] flex items-center gap-3">
          <Wind size={20} className="text-[#b6713e] shrink-0" />
          <div>
            <span className="text-xs font-bold text-[#1c1c1c] block">
              Sillage: Strong & Radiating
            </span>
            <span className="text-[11px] text-neutral-500">
              Leaves an enchanting aromatic trail without overpowering
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
