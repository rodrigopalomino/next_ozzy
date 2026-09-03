"use client";

import { Loader2 } from "lucide-react";

import { useWhatsApp } from "@/hooks/catalogo/useProductoDetalle";
import { cn } from "@/lib/utils";
import type { OrigenWhatsApp } from "@/types/producto-detalle";

/**
 * El mensaje, el número y el registro del lead los resuelve el servidor en
 * `GET /catalogo/producto/:slug/whatsapp`. El front sólo pide el enlace y
 * redirige — no arma el texto ni conoce el número.
 */
export default function WhatsAppButton({
  slug,
  variante_id,
  origen = "DETALLE_PRODUCTO",
  cupon,
  disabled = false,
  etiqueta = "Pedir por WhatsApp",
  className,
}: {
  slug: string;
  variante_id?: number;
  origen?: OrigenWhatsApp;
  cupon?: string;
  disabled?: boolean;
  etiqueta?: string;
  className?: string;
}) {
  const { mutate, isPending, isError } = useWhatsApp();

  const pedir = () => {
    if (disabled || isPending) return;

    mutate(
      { slug, variante_id, origen, cupon },
      {
        onSuccess: ({ data }) => {
          // Navegación en la misma pestaña: un `window.open` después de await
          // lo bloquea el navegador por no venir de un gesto directo.
          window.location.href = data.url;
        },
      },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={pedir}
        disabled={disabled || isPending}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded bg-pink-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-600",
          "disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600",
          className,
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Abriendo WhatsApp...
          </>
        ) : (
          etiqueta
        )}
      </button>

      {isError ? (
        <p className="mt-2 text-center text-xs text-red-600" role="alert">
          No pudimos abrir WhatsApp. Intenta de nuevo.
        </p>
      ) : null}
    </div>
  );
}
