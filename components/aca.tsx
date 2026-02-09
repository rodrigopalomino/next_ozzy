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

import { useProductos } from "@/hooks/producto/useProductos";
import type { Producto } from "@/types/Producto";

type EstadoProducto = "ACTIVO" | "OCULTO" | "ARCHIVADO";
type EstadoFilter = EstadoProducto | "ALL";

type Sort = "newest" | "name_asc" | "name_desc" | "price_asc" | "price_desc";
type SortFilter = Sort;

const ESTADOS: readonly EstadoProducto[] = [
  "ACTIVO",
  "OCULTO",
  "ARCHIVADO",
] as const;
const SORTS: readonly Sort[] = [
  "newest",
  "name_asc",
  "name_desc",
  "price_asc",
  "price_desc",
] as const;
const LIMITS: readonly number[] = [5, 10, 20, 50] as const;

function isEstadoProducto(v: string): v is EstadoProducto {
  return (ESTADOS as readonly string[]).includes(v);
}
function isEstadoFilter(v: string): v is EstadoFilter {
  return v === "ALL" || isEstadoProducto(v);
}
function isSort(v: string): v is SortFilter {
  return (SORTS as readonly string[]).includes(v);
}
function isLimit(v: string): v is `${number}` {
  return /^\d+$/.test(v);
}

function estadoBadgeVariant(estado: EstadoProducto) {
  switch (estado) {
    case "ACTIVO":
      return "default";
    case "OCULTO":
      return "secondary";
    case "ARCHIVADO":
      return "outline";
  }
}

function formatMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return `S/ ${Number(n).toFixed(2)}`;
}

export default function PageProductos() {
  const router = useRouter();
  const sp = useSearchParams();

  // init desde URL
  const [nombre, setNombre] = React.useState<string>(
    () => sp.get("filtros[nombre]") ?? "",
  );

  const [estado, setEstado] = React.useState<EstadoFilter>(() => {
    const raw = sp.get("filtros[estado]");
    if (!raw) return "ALL";
    return isEstadoFilter(raw) ? raw : "ALL";
  });

  const [sort, setSort] = React.useState<SortFilter>(() => {
    const raw = sp.get("sort");
    if (!raw) return "newest";
    return isSort(raw) ? raw : "newest";
  });

  const [page, setPage] = React.useState<number>(() => {
    const p = Number(sp.get("page") ?? "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const [limit, setLimit] = React.useState<number>(() => {
    const l = Number(sp.get("limit") ?? "10");
    return Number.isFinite(l) && l > 0 ? l : 10;
  });

  // URL builder (sin window.location.search)
  const pushUrlFromState = React.useCallback(
    (
      next?: Partial<{
        nombre: string;
        estado: EstadoFilter;
        sort: SortFilter;
        page: number;
        limit: number;
      }>,
    ) => {
      const nombreV = (next?.nombre ?? nombre).trim();
      const estadoV = next?.estado ?? estado;
      const sortV = next?.sort ?? sort;
      const pageV = next?.page ?? page;
      const limitV = next?.limit ?? limit;

      const params = new URLSearchParams();

      if (nombreV) params.set("filtros[nombre]", nombreV);
      if (estadoV !== "ALL") params.set("filtros[estado]", estadoV);

      if (sortV !== "newest") params.set("sort", sortV);
      if (pageV !== 1) params.set("page", String(pageV));
      if (limitV !== 10) params.set("limit", String(limitV));

      const qs = params.toString();
      router.replace(qs ? `?${qs}` : `?`, { scroll: false });
    },
    [router, nombre, estado, sort, page, limit],
  );

  // ✅ Backend: TU FORMATO REAL
  const productosQuery = useProductos({
    page,
    limit,
    filtros: {
      nombre: nombre.trim() || undefined,
      estado: estado === "ALL" ? undefined : estado,
    },
  });

  const rows: Producto[] = productosQuery.data?.data ?? [];
  const meta = productosQuery.data?.meta;

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const effectivePage = Math.min(Math.max(1, page), totalPages);

  // corrige page fuera de rango
  React.useEffect(() => {
    if (effectivePage !== page) {
      setPage(effectivePage);
      pushUrlFromState({ page: effectivePage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sort client
  const filtered = React.useMemo(() => {
    const data = rows.slice();

    data.sort((a, b) => {
      if (sort === "newest") return 0;
      if (sort === "name_asc")
        return (a.nombre ?? "").localeCompare(b.nombre ?? "");
      if (sort === "name_desc")
        return (b.nombre ?? "").localeCompare(a.nombre ?? "");
      if (sort === "price_asc")
        return Number(a.precioBase ?? 0) - Number(b.precioBase ?? 0);
      if (sort === "price_desc")
        return Number(b.precioBase ?? 0) - Number(a.precioBase ?? 0);
      return 0;
    });

    return data;
  }, [rows, sort]);

  function resetFilters() {
    setNombre("");
    setEstado("ALL");
    setSort("newest");
    setPage(1);
    setLimit(10);
    pushUrlFromState({
      nombre: "",
      estado: "ALL",
      sort: "newest",
      page: 1,
      limit: 10,
    });
  }

  function goPrev() {
    const next = Math.max(1, effectivePage - 1);
    setPage(next);
    pushUrlFromState({ page: next });
  }

  function goNext() {
    const next = Math.min(totalPages, effectivePage + 1);
    setPage(next);
    pushUrlFromState({ page: next });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Administra el catálogo.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

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
              <Label className="text-xs">Buscar por nombre</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Ej: rodri"
                  value={nombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNombre(v);
                    setPage(1);
                    pushUrlFromState({ nombre: v, page: 1 });
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs">Estado</Label>
              <Select
                value={estado}
                onValueChange={(v) => {
                  if (!isEstadoFilter(v)) return;
                  setEstado(v);
                  setPage(1);
                  pushUrlFromState({ estado: v, page: 1 });
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
                  if (!isSort(v)) return;
                  setSort(v);
                  setPage(1);
                  pushUrlFromState({ sort: v, page: 1 });
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
                  if (!isLimit(v)) return;
                  const n = Number(v);
                  if (!LIMITS.includes(n)) return;
                  setLimit(n);
                  setPage(1);
                  pushUrlFromState({ limit: n, page: 1 });
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

            <div className="lg:col-span-12 flex items-end justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full lg:w-auto"
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {total} producto{total === 1 ? "" : "s"} • página {effectivePage} de{" "}
            {totalPages}
          </div>
        </CardContent>
      </Card>

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
                  </div>

                  <div className="flex-1" />

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {isEstadoProducto(String(p.estado)) ? (
                      <Badge variant={estadoBadgeVariant(p.estado)}>
                        {p.estado}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{String(p.estado)}</Badge>
                    )}

                    <div className="rounded-md border px-2 py-1 text-xs">
                      <span className="text-muted-foreground">
                        Precio base:{" "}
                      </span>
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
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Mostrando {total === 0 ? 0 : (effectivePage - 1) * limit + 1} -{" "}
              {Math.min(effectivePage * limit, total)} de {total}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={effectivePage <= 1}
              >
                Anterior
              </Button>
              <div className="rounded-md border px-3 py-1 text-sm">
                {effectivePage} / {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={goNext}
                disabled={effectivePage >= totalPages}
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
