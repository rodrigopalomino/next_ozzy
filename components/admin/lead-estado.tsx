"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActualizarLead } from "@/hooks/admin/useLeads";
import { cn } from "@/lib/utils";
import { ESTADOS_LEAD, type EstadoLead, type LeadSalida } from "@/types/admin";

const ESTILOS: Record<EstadoLead, string> = {
  NUEVO: "bg-sky-500 text-white hover:bg-sky-600",
  CONTACTADO: "bg-amber-500 text-white hover:bg-amber-600",
  VENDIDO: "bg-emerald-600 text-white hover:bg-emerald-700",
  PERDIDO: "bg-neutral-500 text-white hover:bg-neutral-600",
};

const ETIQUETAS: Record<EstadoLead, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  VENDIDO: "Vendido",
  PERDIDO: "Perdido",
};

/**
 * Cambia el estado de un lead.
 *
 * Pasar a `VENDIDO` consume el cupón que traía el lead —incrementa sus usos y
 * no se puede deshacer—, así que en ese caso se pide confirmación explícita en
 * vez de aplicarlo con un clic.
 */
export default function LeadEstado({ lead }: { lead: LeadSalida }) {
  const actualizar = useActualizarLead();
  const [confirmando, setConfirmando] = useState<EstadoLead | null>(null);

  const aplicar = (estado: EstadoLead) => {
    actualizar.mutate({ id: lead.id, body: { estado } });
    setConfirmando(null);
  };

  const alElegir = (estado: EstadoLead) => {
    if (estado === lead.estado) return;

    // Sólo la transición HACIA vendido consume el cupón; si ya estaba
    // vendido, no hay nada que gastar.
    const consumiriaCupon =
      estado === "VENDIDO" && lead.cupon_id !== null && lead.estado !== "VENDIDO";

    if (consumiriaCupon) {
      setConfirmando(estado);
      return;
    }

    aplicar(estado);
  };

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {ESTADOS_LEAD.map((estado) => {
          const activo = estado === lead.estado;

          return (
            <button
              key={estado}
              type="button"
              onClick={() => alElegir(estado)}
              disabled={actualizar.isPending}
              aria-pressed={activo}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                activo
                  ? ESTILOS[estado]
                  : "border border-neutral-300 text-neutral-600 hover:bg-neutral-100",
              )}
            >
              {activo && actualizar.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                ETIQUETAS[estado]
              )}
            </button>
          );
        })}
      </div>

      <Dialog
        open={confirmando !== null}
        onOpenChange={(abierto) => !abierto && setConfirmando(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como vendido</DialogTitle>
            <DialogDescription>
              Este lead tiene un cupón aplicado. Al marcarlo como vendido, el
              cupón se consume: su contador de usos sube y no se puede
              revertir.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(null)}>
              Cancelar
            </Button>
            <Button onClick={() => confirmando && aplicar(confirmando)}>
              Sí, marcar como vendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
