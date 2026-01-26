// src/components/admin/productos/edit/tabs/GeneralTab.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EstadoProducto = "ACTIVO" | "OCULTO" | "ARCHIVADO";

export type GeneralForm = {
  nombre: string;
  slug: string;
  descripcion: string;
  estado: EstadoProducto;
  precioBase: string;
};

export function GeneralTab({
  state,
}: {
  state: {
    form: GeneralForm;
    setForm: React.Dispatch<React.SetStateAction<GeneralForm>>;
  };
}) {
  const { form, setForm } = state;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2">
          <Label>Nombre</Label>
          <Input
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            URL pública:{" "}
            <span className="font-medium">/producto/{form.slug || "..."}</span>
          </p>
        </div>

        <div className="grid gap-2">
          <Label>Descripción</Label>
          <Textarea
            value={form.descripcion}
            onChange={(e) =>
              setForm((p) => ({ ...p, descripcion: e.target.value }))
            }
            rows={5}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select
              value={form.estado}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, estado: v as any }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                <SelectItem value="OCULTO">OCULTO</SelectItem>
                <SelectItem value="ARCHIVADO">ARCHIVADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Precio base (opcional)</Label>
            <Input
              inputMode="decimal"
              placeholder="Ej: 129.90"
              value={form.precioBase}
              onChange={(e) =>
                setForm((p) => ({ ...p, precioBase: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Guardar cambios</Button>
        </div>
      </CardContent>
    </Card>
  );
}
