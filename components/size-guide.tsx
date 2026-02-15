"use client";

import React, { useState } from "react";

type SizeGuideProps = {
  // ✅ ya no filtramos por variaciones
  sizes?: string[];
  linkLabel?: string;
  title?: string;
};

type Row = {
  size: string;
  bust: string;
  waist: string;
  hip: string;
};

const BASE_TABLE: Row[] = [
  { size: "XS", bust: "80–84", waist: "60–64", hip: "86–90" },
  { size: "S", bust: "84–88", waist: "64–68", hip: "90–94" },
  { size: "M", bust: "88–92", waist: "68–72", hip: "94–98" },
  { size: "L", bust: "92–96", waist: "72–76", hip: "98–102" },
  { size: "XL", bust: "96–102", waist: "76–82", hip: "102–108" },
];

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function SizeGuide({
  linkLabel = "Guía de tallas",
  title = "Guía de tallas (mujer)",
}: SizeGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Link */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-80"
      >
        {linkLabel}
      </button>

      {/* Modal */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Panel */}
          <div
            className={cn(
              "relative z-10 w-full max-w-2xl rounded-t-3xl bg-white shadow-xl sm:rounded-3xl",
              "mx-2 sm:mx-4",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 p-4">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {title}
                </div>
                <div className="mt-0.5 text-xs text-neutral-600">
                  Medidas en centímetros (cm)
                </div>
              </div>

              {/* X */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[75dvh] overflow-auto p-4">
              <div className="overflow-hidden rounded-2xl border border-neutral-200">
                <div className="grid grid-cols-4 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-700">
                  <div>Talla</div>
                  <div>Busto</div>
                  <div>Cintura</div>
                  <div>Cadera</div>
                </div>

                <div className="divide-y divide-neutral-200">
                  {BASE_TABLE.map((r) => (
                    <div
                      key={r.size}
                      className="grid grid-cols-4 px-4 py-3 text-xs text-neutral-800"
                    >
                      <div className="font-semibold">{r.size}</div>
                      <div>{r.bust}</div>
                      <div>{r.waist}</div>
                      <div>{r.hip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
