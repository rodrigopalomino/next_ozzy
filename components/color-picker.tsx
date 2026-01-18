"use client";

import { useState } from "react";

export default function ColorPicker({
  label,
  colors,
}: {
  label: string;
  colors: string[];
}) {
  const [selected, setSelected] = useState<string>(colors?.[0] ?? "");

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm font-medium text-neutral-800">{label}</span>

      <div className="flex flex-wrap items-center gap-2">
        {colors.map((c) => {
          const active = c === selected;
          return (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={[
                "rounded border px-3 py-2 text-sm",
                active
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-neutral-300 hover:bg-black/5",
              ].join(" ")}
              aria-label={`Color ${c}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
