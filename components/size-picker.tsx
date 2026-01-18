"use client";

import { useState } from "react";

export default function SizePicker({
  label,
  sizes,
}: {
  label: string;
  sizes: string[];
}) {
  const [selected, setSelected] = useState<string>(sizes?.[0] ?? "");

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm font-medium text-neutral-800">{label}</span>

      <div className="flex items-center gap-2">
        {sizes.map((s) => {
          const active = s === selected;
          return (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={[
                "h-9 w-9 rounded border text-sm",
                active
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-neutral-300 hover:bg-black/5",
              ].join(" ")}
              aria-label={`Talla ${s}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
