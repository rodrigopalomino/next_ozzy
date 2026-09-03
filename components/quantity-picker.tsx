"use client";

import { cn } from "@/lib/utils";
import { MAX_POR_LINEA } from "@/types/carrito";

/**
 * Selector de cantidad, controlado: quien lo usa necesita el valor para
 * mandarlo al carrito o al pedido. Con estado interno la cantidad elegida no
 * salía del componente.
 *
 * El tope por línea lo impone el back (`MAX_POR_LINEA`) porque el mensaje de
 * WhatsApp tiene límite de longitud.
 */
export default function QuantityPicker({
  label,
  value,
  onChange,
  max = MAX_POR_LINEA,
  className,
}: {
  label: string;
  value: number;
  onChange: (cantidad: number) => void;
  max?: number;
  className?: string;
}) {
  const tope = Math.min(max, MAX_POR_LINEA);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="w-20 text-sm font-medium text-neutral-800">{label}</span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="h-9 w-9 rounded border border-neutral-300 text-lg hover:bg-black/5 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
          aria-label="Disminuir cantidad"
        >
          −
        </button>

        <output
          className="grid h-9 w-12 place-items-center rounded border border-neutral-300 text-sm tabular-nums"
          aria-label={`Cantidad: ${value}`}
        >
          {value}
        </output>

        <button
          type="button"
          onClick={() => onChange(Math.min(tope, value + 1))}
          disabled={value >= tope}
          className="h-9 w-9 rounded border border-neutral-300 text-lg hover:bg-black/5 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    </div>
  );
}
