"use client";

import { useState } from "react";

const OPTIONS = [
  "Relevancia",
  "Precio: menor a mayor",
  "Precio: mayor a menor",
  "Nombre: A-Z",
  "Nombre: Z-A",
];

export default function SortBar() {
  const [value, setValue] = useState(OPTIONS[0]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-neutral-800">Opciones</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-pink-500"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
