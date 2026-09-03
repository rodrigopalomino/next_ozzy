"use client";

import { useState } from "react";
import { Check, Loader2, ShoppingBag } from "lucide-react";

import { useCarritoAcciones } from "@/hooks/carrito/useCarrito";
import { cn } from "@/lib/utils";
import { useCarritoDrawer } from "@/store/carrito-drawer-store";
import { MAX_POR_LINEA } from "@/types/carrito";

/**
 * Añade una variante al carrito. Sólo se manda `variante_id` y cantidad: el
 * precio y el total los calcula el servidor.
 */
export default function AddToCartButton({
  variante_id,
  cantidad = 1,
  disabled = false,
  className,
}: {
  variante_id?: number;
  cantidad?: number;
  disabled?: boolean;
  className?: string;
}) {
  const { agregar } = useCarritoAcciones();
  const abrirCarrito = useCarritoDrawer((s) => s.abrir);
  const [agregado, setAgregado] = useState(false);

  const bloqueado = disabled || !variante_id || agregar.isPending;

  const alClic = () => {
    if (bloqueado) return;

    agregar.mutate(
      { variante_id, cantidad: Math.min(cantidad, MAX_POR_LINEA) },
      {
        onSuccess: () => {
          setAgregado(true);
          window.setTimeout(() => setAgregado(false), 2000);
          // Abrir el drawer es la confirmación: el cliente ve lo que acaba de
          // añadir y el total, sin salir de la ficha.
          abrirCarrito();
        },
      },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={alClic}
        disabled={bloqueado}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded border border-neutral-900 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50",
          "disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-white",
          className,
        )}
      >
        {agregar.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Agregando...
          </>
        ) : agregado ? (
          <>
            <Check className="h-4 w-4" />
            Agregado
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            Agregar al carrito
          </>
        )}
      </button>

      {agregar.isError ? (
        <p className="mt-2 text-center text-xs text-red-600" role="alert">
          No se pudo agregar. Intenta de nuevo.
        </p>
      ) : null}
    </div>
  );
}
