"use client";

import { useState } from "react";

export default function QuantityPicker({ label }: { label: string }) {
  const [qty, setQty] = useState(1);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm font-medium text-neutral-800">{label}</span>

      <div className="flex items-center gap-2">
        <button
          onClick={dec}
          className="h-9 w-9 rounded border border-neutral-300 text-lg hover:bg-black/5"
          aria-label="Disminuir"
        >
          −
        </button>

        <div className="grid h-9 w-12 place-items-center rounded border border-neutral-300 text-sm">
          {qty}
        </div>

        <button
          onClick={inc}
          className="h-9 w-9 rounded border border-neutral-300 text-lg hover:bg-black/5"
          aria-label="Aumentar"
        >
          +
        </button>
      </div>
    </div>
  );
}
