// src/components/admin/productos/edit/tabs/RelacionesTab.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSetProductoRelaciones } from "@/hooks/productoo/useSetProductoRelaciones";

export type RelacionesForm = {
  selectedCatIds: string[];
  selectedColIds: string[];
  selectedBadgeIds: string[];
};

export function RelacionesTab({
  productoId,
  state,
  catalog,
}: {
  productoId: string;
  state: {
    form: RelacionesForm;
    setForm: React.Dispatch<React.SetStateAction<RelacionesForm>>;
  };
  catalog: {
    cats: Array<{ id: string; nombre: string }>;
    cols: Array<{ id: string; nombre: string }>;
    badges: Array<{ id: string; nombre: string }>;
  };
}) {
  const { form, setForm } = state;
  const { cats, cols, badges } = catalog;

  const { mutateAsync, isPending } = useSetProductoRelaciones(productoId);

  const [msg, setMsg] = React.useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  function toggle(listKey: keyof RelacionesForm, id: string, checked: boolean) {
    setForm((prev) => {
      const list = prev[listKey];
      const next = checked ? [...list, id] : list.filter((x) => x !== id);
      return { ...prev, [listKey]: next };
    });
  }

  async function guardar() {
    try {
      setMsg(null);

      await mutateAsync({
        categoriaIds: form.selectedCatIds,
        coleccionIds: form.selectedColIds,
        insigniaIds: form.selectedBadgeIds,
      });

      setMsg({ type: "ok", text: "Relaciones guardadas correctamente." });
    } catch (e: any) {
      setMsg({
        type: "err",
        text: e?.message || "Error guardando relaciones.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías, Colecciones, Insignias</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Box
            title="Categorías"
            items={cats}
            selected={form.selectedCatIds}
            onToggle={(id, checked) => toggle("selectedCatIds", id, checked)}
            disabled={isPending}
          />
          <Box
            title="Colecciones"
            items={cols}
            selected={form.selectedColIds}
            onToggle={(id, checked) => toggle("selectedColIds", id, checked)}
            disabled={isPending}
          />
          <Box
            title="Insignias"
            items={badges}
            selected={form.selectedBadgeIds}
            onToggle={(id, checked) => toggle("selectedBadgeIds", id, checked)}
            disabled={isPending}
          />
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

        <div className="flex justify-end">
          <Button onClick={guardar} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar relaciones"}
          </Button>
        </div>

        <Separator />
      </CardContent>
    </Card>
  );
}

function Box({
  title,
  items,
  selected,
  onToggle,
  disabled,
}: {
  title: string;
  items: Array<{ id: string; nombre: string }>;
  selected: string[];
  onToggle: (id: string, checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{title}</div>
      <div className="max-h-64 space-y-2 overflow-auto rounded-md border p-3">
        {items.map((i) => {
          const checked = selected.includes(i.id);
          return (
            <label
              key={i.id}
              className={[
                "flex items-center gap-2 text-sm",
                disabled ? "opacity-60" : "",
              ].join(" ")}
            >
              <input
                type="checkbox"
                className="accent-pink-500"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onToggle(i.id, e.target.checked)}
              />
              <span>{i.nombre}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
