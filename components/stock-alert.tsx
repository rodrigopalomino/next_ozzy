"use client";

import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";

import {
  useAvisoStock,
  useClienteActual,
} from "@/hooks/cliente/useSesionCliente";

/**
 * Aviso cuando una variante agotada vuelva a tener stock.
 *
 * La baja NO se ofrece desde aquí: el token de cancelación viaja sólo en el
 * email (antes venía en esta respuesta, y eso permitía suscribir el correo de
 * otra persona y quedarse con su token para cancelarle la alerta).
 */
export default function StockAlert({ variante_id }: { variante_id: number }) {
  const { data: cliente } = useClienteActual();
  const aviso = useAvisoStock();

  const [email, setEmail] = useState("");
  const [listo, setListo] = useState(false);

  // Con sesión no se pide el correo: ya lo tiene el back.
  const correo = cliente?.email ?? email.trim();

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo || aviso.isPending) return;

    aviso.mutate(
      { variante_id, email: correo },
      { onSuccess: () => setListo(true) },
    );
  };

  if (listo) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Te avisaremos a <strong>{correo}</strong> cuando vuelva a estar
          disponible.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
        <BellRing className="h-3.5 w-3.5" />
        Avísame cuando vuelva
      </div>

      {cliente ? (
        <p className="mt-1 text-xs text-neutral-600">
          Te escribiremos a {cliente.email}.
        </p>
      ) : (
        <>
          <label htmlFor="email-aviso" className="sr-only">
            Tu correo
          </label>
          <input
            id="email-aviso"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="mt-2 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
        </>
      )}

      <button
        type="submit"
        disabled={aviso.isPending || !correo}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
      >
        {aviso.isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Guardando...
          </>
        ) : (
          "Avisarme"
        )}
      </button>

      {aviso.isError ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          No se pudo guardar el aviso. Intenta de nuevo.
        </p>
      ) : null}
    </form>
  );
}
