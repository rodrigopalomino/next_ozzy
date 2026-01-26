// src/components/admin/productos/edit/ProductosHeader.tsx
"use client";

import { Button } from "@/components/ui/button";

export function ProductosHeader({
  producto,
}: {
  producto: { nombre: string; slug: string };
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar producto
        </h1>
        <p className="text-sm text-muted-foreground">
          {producto.nombre} •{" "}
          <span className="font-medium">{producto.slug}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline">Ver en tienda</Button>
        <Button variant="destructive">Archivar</Button>
      </div>
    </div>
  );
}
