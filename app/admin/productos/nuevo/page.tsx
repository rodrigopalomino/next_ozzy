"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EstadoProducto,
  useCreateProducto,
} from "@/hooks/productoo/useCreateProducto";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Page() {
  const router = useRouter();

  const createProducto = useCreateProducto();

  const [nombre, setNombre] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [estado, setEstado] = React.useState<EstadoProducto>("ACTIVO");
  const [precioBase, setPrecioBase] = React.useState<string>("");

  const [autoSlug, setAutoSlug] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!autoSlug) return;
    setSlug(slugify(nombre));
  }, [nombre, autoSlug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (!slug.trim()) return setError("El slug es obligatorio.");

    const precio =
      precioBase.trim() === "" ? null : Number(precioBase.replace(",", "."));

    if (
      precioBase.trim() !== "" &&
      (Number.isNaN(precio) || (precio ?? 0) < 0)
    ) {
      return setError("Precio base inválido.");
    }

    try {
      const created = await createProducto.mutateAsync({
        nombre,
        slug,
        descripcion,
        estado,
        precioBase: precio,
      });

      router.push(`/admin/productos/${created.id}`);
    } catch (err: any) {
      // Ky suele devolver error con .message; si tu backend devuelve JSON, lo manejas aquí luego
      setError(err?.message ?? "Error inesperado creando el producto.");
    }
  }

  const loading = createProducto.isPending;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nuevo producto
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea el producto base. Luego podrás agregar imágenes, precio/oferta,
          variantes y relaciones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Casaca Oversize"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="slug">Slug</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="accent-pink-500"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      disabled={loading}
                    />
                    Auto
                  </label>
                </div>

                <Input
                  id="slug"
                  placeholder="ej: casaca-oversize"
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setSlug(e.target.value);
                  }}
                  disabled={loading}
                />

                <p className="text-xs text-muted-foreground">
                  Se usa en la URL pública:{" "}
                  <span className="font-medium">/producto/{slug || "..."}</span>
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el producto (material, fit, recomendaciones, etc.)"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={5}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select
                    value={estado}
                    onValueChange={(v) => setEstado(v as EstadoProducto)}
                    disabled={loading}
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
                  <p className="text-xs text-muted-foreground">
                    ACTIVO aparece en el catálogo. OCULTO no aparece. ARCHIVADO
                    es “eliminado” lógico.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="precioBase">Precio base (opcional)</Label>
                  <Input
                    id="precioBase"
                    inputMode="decimal"
                    placeholder="Ej: 129.90"
                    value={precioBase}
                    onChange={(e) => setPrecioBase(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si usarás ofertas por tabla{" "}
                    <span className="font-medium">PrecioProducto</span>, aquí
                    puedes dejarlo vacío.
                  </p>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/productos")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
