// src/components/producto/edit/VariantesTab.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateProductoVariante } from "@/hooks/productoo/useCreateProductoVariante";
import { useUpdateProductoVariante } from "@/hooks/productoo/useUpdateProductoVariante";
import { useDeleteProductoVariante } from "@/hooks/productoo/useDeleteProductoVariante";

export type VariantesForm = {
  tallaId: string;
  colorId: string;
  sku: string;
  precio: string;
  stock: string;
  activo: boolean;
};

type VarianteItem = {
  id: string;
  talla?: { id?: string; etiqueta: string } | null;
  color?: { id?: string; nombre: string } | null;
  sku?: string | null;
  precio?: number | null;
  stock?: number | null;
  activo: boolean;
};

function toIntOrUndefined(raw: string) {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  const v = Number(s.replace(",", "."));
  if (!Number.isFinite(v)) return undefined;
  return Math.max(0, Math.trunc(v));
}

export function VariantesTab({
  productoId,
  state,
  catalog,
  variantes,
}: {
  productoId: string;
  state: {
    form: VariantesForm;
    setForm: React.Dispatch<React.SetStateAction<VariantesForm>>;
  };
  catalog: {
    tallas: Array<{ id: string; etiqueta: string }>;
    colores: Array<{ id: string; nombre: string }>;
  };
  variantes: VarianteItem[];
}) {
  const { form, setForm } = state;
  const { tallas, colores } = catalog;

  const { mutateAsync: createAsync, isPending: isCreating } =
    useCreateProductoVariante(productoId);

  const [msg, setMsg] = React.useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function onCreate() {
    try {
      setMsg(null);

      if (!form.tallaId) throw new Error("Selecciona una talla");
      if (!form.colorId) throw new Error("Selecciona un color");

      await createAsync({
        tallaId: form.tallaId,
        colorId: form.colorId,
        sku: form.sku.trim() ? form.sku.trim() : undefined,
        precio: toIntOrUndefined(form.precio),
        stock: toIntOrUndefined(form.stock),
        activo: Boolean(form.activo),
      });

      setForm((p) => ({
        ...p,
        tallaId: "",
        colorId: "",
        sku: "",
        precio: "",
        stock: "",
        activo: true,
      }));

      setMsg({ type: "ok", text: "Variante agregada." });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Error creando variante." });
    }
  }

  const busy = isCreating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variantes (talla + color)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-md border p-4 space-y-3">
          <div className="text-sm font-medium">Crear variante</div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Talla</Label>
              <Select
                value={form.tallaId}
                onValueChange={(v) => setForm((p) => ({ ...p, tallaId: v }))}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {tallas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <Select
                value={form.colorId}
                onValueChange={(v) => setForm((p) => ({ ...p, colorId: v }))}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {colores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {/* <div className="grid gap-2">
              <Label>SKU (opcional)</Label>
              <Input
                value={form.sku}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sku: e.target.value }))
                }
                disabled={busy}
              />
            </div> */}
            <div className="grid gap-2">
              <Label>Precio (opcional)</Label>
              <Input
                value={form.precio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, precio: e.target.value }))
                }
                disabled={busy}
              />
            </div>
            <div className="grid gap-2">
              <Label>Stock (opcional)</Label>
              <Input
                value={form.stock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stock: e.target.value }))
                }
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
            <span>Activa</span>
          </div>

          {msg ? (
            <div
              className={[
                "rounded-md border p-3 text-sm",
                msg.type === "ok"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800",
              ].join(" ")}
            >
              {msg.text}
            </div>
          ) : null}

          <Button onClick={onCreate} disabled={busy}>
            {isCreating ? "Agregando..." : "Agregar variante"}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Lista</div>

          {variantes.length ? (
            <div className="grid gap-3">
              {variantes.map((v) => (
                <VarianteRow
                  key={v.id}
                  productoId={productoId}
                  variante={v}
                  catalog={catalog}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Aún no hay variantes.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function VarianteRow({
  productoId,
  variante,
  catalog,
}: {
  productoId: string;
  variante: VarianteItem;
  catalog: {
    tallas: Array<{ id: string; etiqueta: string }>;
    colores: Array<{ id: string; nombre: string }>;
  };
}) {
  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    useDeleteProductoVariante(productoId, variante.id);

  const { mutateAsync: updateAsync, isPending: isUpdating } =
    useUpdateProductoVariante(productoId, variante.id);

  const [edit, setEdit] = React.useState(false);
  const [draft, setDraft] = React.useState({
    tallaId:
      catalog.tallas.find((t) => t.etiqueta === variante.talla?.etiqueta)?.id ??
      "",
    colorId:
      catalog.colores.find((c) => c.nombre === variante.color?.nombre)?.id ??
      "",
    sku: variante.sku ?? "",
    precio: variante.precio == null ? "" : String(variante.precio),
    stock: variante.stock == null ? "" : String(variante.stock),
    activo: Boolean(variante.activo),
  });

  React.useEffect(() => {
    setDraft({
      tallaId:
        catalog.tallas.find((t) => t.etiqueta === variante.talla?.etiqueta)
          ?.id ?? "",
      colorId:
        catalog.colores.find((c) => c.nombre === variante.color?.nombre)?.id ??
        "",
      sku: variante.sku ?? "",
      precio: variante.precio == null ? "" : String(variante.precio),
      stock: variante.stock == null ? "" : String(variante.stock),
      activo: Boolean(variante.activo),
    });
  }, [
    variante.id,
    variante.talla?.etiqueta,
    variante.color?.nombre,
    variante.sku,
    variante.precio,
    variante.stock,
    variante.activo,
    catalog.tallas,
    catalog.colores,
  ]);

  const busy = isDeleting || isUpdating;

  async function onDelete() {
    await deleteAsync();
  }

  async function onSave() {
    if (!draft.tallaId) return;
    if (!draft.colorId) return;

    await updateAsync({
      tallaId: draft.tallaId,
      colorId: draft.colorId,
      sku: draft.sku.trim() ? draft.sku.trim() : null,
      precio: draft.precio.trim()
        ? (toIntOrUndefined(draft.precio) ?? null)
        : null,
      stock: draft.stock.trim()
        ? (toIntOrUndefined(draft.stock) ?? null)
        : null,
      activo: Boolean(draft.activo),
    });

    setEdit(false);
  }

  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="min-w-0 flex-1">
        {!edit ? (
          <>
            <div className="text-sm font-medium">
              {variante.talla?.etiqueta} • {variante.color?.nombre} •{" "}
              {variante.activo ? "Activa" : "Inactiva"}
            </div>
            <div className="text-xs text-muted-foreground">
              SKU: {variante.sku ?? "—"} • Precio: {variante.precio ?? "—"} •
              Stock: {variante.stock ?? "—"}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Talla</Label>
                <Select
                  value={draft.tallaId}
                  onValueChange={(v) => setDraft((p) => ({ ...p, tallaId: v }))}
                  disabled={busy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.tallas.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Color</Label>
                <Select
                  value={draft.colorId}
                  onValueChange={(v) => setDraft((p) => ({ ...p, colorId: v }))}
                  disabled={busy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.colores.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {/* <div className="grid gap-2">
                <Label>SKU</Label>
                <Input
                  value={draft.sku}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, sku: e.target.value }))
                  }
                  disabled={busy}
                />
              </div> */}
              <div className="grid gap-2">
                <Label>Precio</Label>
                <Input
                  value={draft.precio}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, precio: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="grid gap-2">
                <Label>Stock</Label>
                <Input
                  value={draft.stock}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, stock: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-pink-500"
                checked={draft.activo}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, activo: e.target.checked }))
                }
                disabled={busy}
              />
              <span>Activa</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!edit ? (
          <Button
            variant="outline"
            onClick={() => setEdit(true)}
            disabled={busy}
          >
            Editar
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setEdit(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={busy}>
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </>
        )}

        <Button variant="destructive" onClick={onDelete} disabled={busy}>
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </div>
  );
}
