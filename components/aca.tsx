"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Pencil,
  Archive,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useProductos } from "@/hooks/productoo/useProductos";

type EstadoProducto = "ACTIVO" | "OCULTO" | "ARCHIVADO";

type ProductoRow = {
  id: string;
  nombre: string;
  slug: string;
  estado: EstadoProducto;
  precioBase: number | null;

  imagenUrl?: string | null;
  tieneOferta?: boolean;
  colecciones: string[];
  categorias: string[];
  insignias: string[];
};

function estadoBadgeVariant(estado: EstadoProducto) {
  switch (estado) {
    case "ACTIVO":
      return "default";
    case "OCULTO":
      return "secondary";
    case "ARCHIVADO":
      return "outline";
    default:
      return "secondary";
  }
}

function formatMoney(n: number | null | undefined) {
  return n;
  // return `S/ ${n.toFixed(2)}`;
}

export default function PageAca() {
  const router = useRouter();
  const sp = useSearchParams();

  // ======================
  // options estáticos (aún no vienen del backend)
  // ======================
  const collectionOptions = React.useMemo(
    () => ["Accesorios", "Drop Enero", "Street 2026"],
    [],
  );
  const categoryOptions = React.useMemo(
    () => [
      "Polos",
      "Casacas",
      "Invierno",
      "Hoodies",
      "Pantalones",
      "Accesorios",
    ],
    [],
  );
  const badgeOptions = React.useMemo(() => ["OFERTA", "NUEVO", "TOP"], []);

  // ======================
  // UI State (filtros)
  // ======================
  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [estado, setEstado] = React.useState<EstadoProducto | "ALL">(
    (sp.get("estado") as any) ?? "ALL",
  );
  const [coleccion, setColeccion] = React.useState<string>(
    sp.get("coleccion") ?? "ALL",
  );
  const [categoria, setCategoria] = React.useState<string>(
    sp.get("categoria") ?? "ALL",
  );
  const [insignia, setInsignia] = React.useState<string>(
    sp.get("insignia") ?? "ALL",
  );
  const [soloConOferta, setSoloConOferta] = React.useState<boolean>(
    sp.get("oferta") === "1",
  );

  const [sort, setSort] = React.useState<
    "newest" | "name_asc" | "name_desc" | "price_asc" | "price_desc"
  >((sp.get("sort") as any) ?? "newest");

  const [page, setPage] = React.useState<number>(() => {
    const p = Number(sp.get("page") ?? "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [limit, setLimit] = React.useState<number>(() => {
    const l = Number(sp.get("limit") ?? "10");
    return Number.isFinite(l) && l > 0 ? l : 10;
  });

  // ======================
  // Backend: productos reales (q/estado/page/limit)
  // ======================
  const productosQuery = useProductos({
    q: q.trim() ? q.trim() : undefined,
    estado: estado === "ALL" ? undefined : estado,
    page,
    limit,
  });

  const apiRows: ProductoRow[] = React.useMemo(() => {
    const data = productosQuery.data?.data ?? [];
    return data.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      estado: p.estado as EstadoProducto,
      precioBase: p.precioBase ?? null,

      imagenUrl: p.imagenUrl ?? null,
      tieneOferta: Boolean(p.tieneOferta),
      colecciones: p.colecciones ?? [],
      categorias: p.categorias ?? [],
      insignias: p.insignias ?? [],
    }));
  }, [productosQuery.data]);

  // ======================
  // filtros “extra” (estáticos por ahora) + sort client
  // ======================
  const filtered = React.useMemo(() => {
    let rows = apiRows;

    rows = rows.filter((p) => {
      const matchesColeccion =
        coleccion === "ALL" ? true : p.colecciones.includes(coleccion);
      const matchesCategoria =
        categoria === "ALL" ? true : p.categorias.includes(categoria);
      const matchesInsignia =
        insignia === "ALL" ? true : p.insignias.includes(insignia);
      const matchesOferta = soloConOferta ? Boolean(p.tieneOferta) : true;

      return (
        matchesColeccion && matchesCategoria && matchesInsignia && matchesOferta
      );
    });

    rows = rows.slice();
    rows.sort((a, b) => {
      if (sort === "newest") return 0; // ya no mostramos "actualizado", y no tenemos updatedAt aquí
      if (sort === "name_asc") return a.nombre.localeCompare(b.nombre);
      if (sort === "name_desc") return b.nombre.localeCompare(a.nombre);
      if (sort === "price_asc")
        return (a.precioBase ?? 0) - (b.precioBase ?? 0);
      if (sort === "price_desc")
        return (b.precioBase ?? 0) - (a.precioBase ?? 0);
      return 0;
    });

    return rows;
  }, [apiRows, coleccion, categoria, insignia, soloConOferta, sort]);

  // meta real del backend
  const total = productosQuery.data?.meta?.total ?? 0;
  const totalPages = productosQuery.data?.meta?.totalPages ?? 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  React.useEffect(() => {
    if (safePage !== page) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  // update url (client-side)
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (estado !== "ALL") params.set("estado", estado);
    if (coleccion !== "ALL") params.set("coleccion", coleccion);
    if (categoria !== "ALL") params.set("categoria", categoria);
    if (insignia !== "ALL") params.set("insignia", insignia);
    if (soloConOferta) params.set("oferta", "1");
    if (sort !== "newest") params.set("sort", sort);
    if (safePage !== 1) params.set("page", String(safePage));
    if (limit !== 10) params.set("limit", String(limit));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : `?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    q,
    estado,
    coleccion,
    categoria,
    insignia,
    soloConOferta,
    sort,
    safePage,
    limit,
  ]);

  function resetFilters() {
    setQ("");
    setEstado("ALL");
    setColeccion("ALL");
    setCategoria("ALL");
    setInsignia("ALL");
    setSoloConOferta(false);
    setSort("newest");
    setPage(1);
    setLimit(10);
  }

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  const activeChips = React.useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> =
      [];

    if (q.trim())
      chips.push({
        key: "q",
        label: `Búsqueda: "${q.trim()}"`,
        onClear: () => setQ(""),
      });
    if (estado !== "ALL")
      chips.push({
        key: "estado",
        label: `Estado: ${estado}`,
        onClear: () => setEstado("ALL"),
      });
    if (coleccion !== "ALL")
      chips.push({
        key: "coleccion",
        label: `Colección: ${coleccion}`,
        onClear: () => setColeccion("ALL"),
      });
    if (categoria !== "ALL")
      chips.push({
        key: "categoria",
        label: `Categoría: ${categoria}`,
        onClear: () => setCategoria("ALL"),
      });
    if (insignia !== "ALL")
      chips.push({
        key: "insignia",
        label: `Insignia: ${insignia}`,
        onClear: () => setInsignia("ALL"),
      });
    if (soloConOferta)
      chips.push({
        key: "oferta",
        label: "Solo con oferta",
        onClear: () => setSoloConOferta(false),
      });
    if (sort !== "newest")
      chips.push({
        key: "sort",
        label: `Orden: ${sort}`,
        onClear: () => setSort("newest"),
      });

    return chips;
  }, [q, estado, coleccion, categoria, insignia, soloConOferta, sort]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Administra el catálogo: estado, precios, media, variantes y
            relaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 size-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="size-4" />
            Filtros
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Label className="text-xs">Buscar</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Nombre, slug o ID…"
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs">Estado</Label>
              <Select
                value={estado}
                onValueChange={(v) => {
                  setPage(1);
                  setEstado(v as any);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                  <SelectItem value="OCULTO">OCULTO</SelectItem>
                  <SelectItem value="ARCHIVADO">ARCHIVADO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs">Ordenar</Label>
              <Select
                value={sort}
                onValueChange={(v) => {
                  setPage(1);
                  setSort(v as any);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="name_asc">Nombre A-Z</SelectItem>
                  <SelectItem value="name_desc">Nombre Z-A</SelectItem>
                  <SelectItem value="price_asc">Precio ↑</SelectItem>
                  <SelectItem value="price_desc">Precio ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs">Por página</Label>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-4">
              <Label className="text-xs">Colección</Label>
              <Select
                value={coleccion}
                onValueChange={(v) => {
                  setPage(1);
                  setColeccion(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  {collectionOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-4">
              <Label className="text-xs">Categoría</Label>
              <Select
                value={categoria}
                onValueChange={(v) => {
                  setPage(1);
                  setCategoria(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-4">
              <Label className="text-xs">Insignia</Label>
              <Select
                value={insignia}
                onValueChange={(v) => {
                  setPage(1);
                  setInsignia(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  {badgeOptions.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-8">
              <Label className="text-xs">Oferta</Label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-pink-500"
                    checked={soloConOferta}
                    onChange={(e) => {
                      setPage(1);
                      setSoloConOferta(e.target.checked);
                    }}
                  />
                  <span>Solo productos con oferta</span>
                </label>

                <div className="text-sm text-muted-foreground">
                  {total} producto{total === 1 ? "" : "s"} • página {safePage}{" "}
                  de {totalPages}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 lg:flex lg:items-end lg:justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full lg:w-auto"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {activeChips.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.onClear}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted"
                  title="Quitar filtro"
                >
                  {c.label}
                  <X className="size-3" />
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Limpiar todo
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="size-4" />
            Listado
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {productosQuery.isLoading ? (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              Cargando productos…
            </div>
          ) : productosQuery.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              Error cargando productos.
            </div>
          ) : filtered.length ? (
            <div className="grid gap-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-md border bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          p.imagenUrl ?? "https://placehold.co/256x256?text=IMG"
                        }
                        alt={p.nombre}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {p.nombre}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        /producto/{p.slug}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: <span className="font-mono">{p.id}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.colecciones.slice(0, 2).map((c) => (
                          <Badge key={c} variant="secondary">
                            {c}
                          </Badge>
                        ))}
                        {p.categorias.slice(0, 2).map((c) => (
                          <Badge key={c} variant="outline">
                            {c}
                          </Badge>
                        ))}
                        {p.insignias.slice(0, 2).map((b) => (
                          <Badge key={b}>{b}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1" />

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Badge variant={estadoBadgeVariant(p.estado) as any}>
                      {p.estado}
                    </Badge>

                    {p.tieneOferta ? (
                      <Badge variant="secondary">OFERTA</Badge>
                    ) : null}

                    <div className="rounded-md border px-2 py-1 text-xs">
                      <span className="text-muted-foreground">Precio: </span>
                      <span className="font-medium">
                        {formatMoney(p.precioBase)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 size-4" />
                      Ver
                    </Button>

                    <Button asChild size="sm">
                      <Link href={`/admin/productos/${p.id}`}>
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </Link>
                    </Button>

                    <Button variant="destructive" size="sm">
                      <Archive className="mr-2 size-4" />
                      Archivar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border p-6 text-center">
              <div className="text-sm font-medium">Sin resultados</div>
              <div className="text-sm text-muted-foreground">
                Prueba cambiando filtros o limpiando la búsqueda.
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {total === 0 ? 0 : (safePage - 1) * limit + 1} -{" "}
              {Math.min(safePage * limit, total)} de {total}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={safePage <= 1}
              >
                Anterior
              </Button>
              <div className="rounded-md border px-3 py-1 text-sm">
                {safePage} / {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={goNext}
                disabled={safePage >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
