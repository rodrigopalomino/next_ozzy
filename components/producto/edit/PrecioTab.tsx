// src/components/admin/productos/edit/tabs/PrecioTab.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type PrecioForm = {
  precioOriginal: string;
  porcentajeDescuento: string;
  precioOferta: string;
  iniciaEn: string;
  terminaEn: string;
  activo: boolean;
  msg: { type: "ok" | "err"; text: string } | null;
};

export function PrecioTab({
  state,
  actions,
}: {
  state: {
    form: PrecioForm;
    setForm: React.Dispatch<React.SetStateAction<PrecioForm>>;
  };
  actions: {
    hasPrecio: boolean;
    saving: boolean;
    deleting: boolean;
    onSave: () => Promise<void>;
    onDelete: () => Promise<void>;
  };
}) {
  const { form, setForm } = state;
  const busy = actions.saving || actions.deleting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Precio y oferta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label>Precio original</Label>
            <Input
              value={form.precioOriginal}
              onChange={(e) =>
                setForm((p) => ({ ...p, precioOriginal: e.target.value }))
              }
              placeholder="Ej: 199.90"
              disabled={busy}
            />
          </div>

          <div className="grid gap-2">
            <Label>% Descuento</Label>
            <Input
              value={form.porcentajeDescuento}
              onChange={(e) =>
                setForm((p) => ({ ...p, porcentajeDescuento: e.target.value }))
              }
              placeholder="0 - 100"
              disabled={busy}
            />
          </div>

          <div className="grid gap-2">
            <Label>Precio oferta (opcional)</Label>
            <Input
              value={form.precioOferta}
              onChange={(e) =>
                setForm((p) => ({ ...p, precioOferta: e.target.value }))
              }
              placeholder="Ej: 149.90"
              disabled={busy}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Inicia (datetime)</Label>
            <Input
              value={form.iniciaEn}
              onChange={(e) =>
                setForm((p) => ({ ...p, iniciaEn: e.target.value }))
              }
              placeholder="2026-01-25T10:00:00"
              disabled={busy}
            />
          </div>
          <div className="grid gap-2">
            <Label>Termina (datetime)</Label>
            <Input
              value={form.terminaEn}
              onChange={(e) =>
                setForm((p) => ({ ...p, terminaEn: e.target.value }))
              }
              placeholder="2026-01-26T23:59:59"
              disabled={busy}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-pink-500"
            checked={form.activo}
            onChange={(e) =>
              setForm((p) => ({ ...p, activo: e.target.checked }))
            }
            disabled={busy}
          />
          <span>Oferta activa</span>
        </div>

        {form.msg ? (
          <div
            className={[
              "rounded-md border p-3 text-sm",
              form.msg.type === "ok"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}
          >
            {form.msg.text}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={actions.onDelete}
            disabled={busy || !actions.hasPrecio}
          >
            {actions.deleting ? "Eliminando..." : "Eliminar precio/oferta"}
          </Button>

          <Button onClick={actions.onSave} disabled={busy}>
            {actions.saving ? "Guardando..." : "Guardar oferta"}
          </Button>
        </div>

        <Separator />
      </CardContent>
    </Card>
  );
}
