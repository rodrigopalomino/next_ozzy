"use client";

import * as React from "react";
import { Search, ArrowUpDown, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import type { Color } from "@/types/Color";
import { useCreateColor } from "@/hooks/color/useCreateColor";
import { useUpdateColor } from "@/hooks/color/useUpdateColor";
import { useColores } from "@/hooks/color/useColores";

type SortKey = "nombre" | "createdAt";
type SortDir = "asc" | "desc";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function normalizeHex(input: string) {
  const v = input.trim();
  if (!v) return "";
  return v.startsWith("#") ? v : `#${v}`;
}

export default function PageColores() {
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  const [q, setQ] = React.useState("");
  const [estado, setEstado] = React.useState<"ALL" | "ACTIVO" | "INACTIVO">(
    "ALL",
  );
  const [sortKey, setSortKey] = React.useState<SortKey>("nombre");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const { data, isLoading, isError } = useColores({ page, limit });
  const createColor = useCreateColor();
  const updateColor = useUpdateColor();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [nombre, setNombre] = React.useState("");
  const [hex, setHex] = React.useState("");

  const [updatingId, setUpdatingId] = React.useState<number | null>(null);

  const hasFilters = q.trim().length > 0 || estado !== "ALL";

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((c) => {
        const matchQ =
          !qq ||
          c.nombre.toLowerCase().includes(qq) ||
          (c.hex ?? "").toLowerCase().includes(qq);

        const matchEstado =
          estado === "ALL" ? true : estado === "ACTIVO" ? c.activo : !c.activo;

        return matchQ && matchEstado;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;

        const va =
          sortKey === "createdAt"
            ? new Date(a.createdAt).getTime()
            : a.nombre.toLowerCase();

        const vb =
          sortKey === "createdAt"
            ? new Date(b.createdAt).getTime()
            : b.nombre.toLowerCase();

        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
  }, [rows, q, estado, sortKey, sortDir]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  function clearFilters() {
    setQ("");
    setEstado("ALL");
  }

  const canPrev = page > 1;
  const canNext = meta?.totalPages ? page < meta.totalPages : true;

  async function submitCreate() {
    const n = nombre.trim();
    const h = normalizeHex(hex);

    if (n.length < 2) return;

    await createColor.mutateAsync({
      nombre: n,
      hex: h.length ? h : null,
    });

    setOpenCreate(false);
    setNombre("");
    setHex("");
  }

  async function toggleActivo(row: Color, value: boolean) {
    setUpdatingId(row.id);
    try {
      await updateColor.mutateAsync({ id: row.id, payload: { activo: value } });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Colores</h1>
        </div>

        {/* ✅ CREATE */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo color
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-130">
            <DialogHeader>
              <DialogTitle>Nuevo color</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Nombre</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Rojo"
                />
              </div>

              <div className="grid gap-2">
                <Label>HEX</Label>
                <Input
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="Ej. #FF0000"
                />
                <div className="text-xs text-muted-foreground">
                  Opcional. Puedes poner con o sin #.
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreate(false)}
                disabled={createColor.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={submitCreate}
                disabled={createColor.isPending || nombre.trim().length < 2}
              >
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>Listado</CardTitle>
              <CardDescription>
                Filtra y ordena la página actual.
              </CardDescription>
            </div>

            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-7 min-w-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre o hex…"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="md:col-span-2 min-w-0">
              <Select
                value={estado}
                onValueChange={(v: "ALL" | "ACTIVO" | "INACTIVO") =>
                  setEstado(v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 min-w-0">
              <Select
                value={`${sortKey}:${sortDir}`}
                onValueChange={(v) => {
                  const [k, d] = v.split(":") as [SortKey, SortDir];
                  setSortKey(k);
                  setSortDir(d);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre:asc">Nombre A–Z</SelectItem>
                  <SelectItem value="nombre:desc">Nombre Z–A</SelectItem>
                  <SelectItem value="createdAt:desc">Más recientes</SelectItem>
                  <SelectItem value="createdAt:asc">Más antiguas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%] min-w-60">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("nombre")}
                      className="-ml-2 h-8"
                    >
                      Nombre <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[25%] min-w-45">HEX</TableHead>
                  <TableHead className="w-[15%] min-w-35">Estado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Error cargando colores.
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No hay colores con esos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-middle">
                        <div className="flex items-center justify-between gap-3 min-w-0">
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {row.nombre}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Creado: {formatDate(row.createdAt)} • Editado:{" "}
                              {formatDate(row.updatedAt)}
                            </div>
                          </div>

                          <Badge
                            variant={row.activo ? "default" : "secondary"}
                            className="shrink-0"
                          >
                            {row.activo ? "ACTIVO" : "INACTIVO"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span>{row.hex ?? "-"}</span>
                          {row.hex ? (
                            <span
                              className="h-4 w-4 rounded border"
                              style={{ backgroundColor: row.hex }}
                              aria-label={`Color ${row.hex}`}
                              title={row.hex}
                            />
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={row.activo}
                            disabled={updatingId === row.id}
                            onCheckedChange={(v) => toggleActivo(row, v)}
                            aria-label="Activo"
                          />
                          <span className="text-sm text-muted-foreground">
                            {row.activo ? "On" : "Off"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Página{" "}
              <span className="font-medium text-foreground">
                {meta?.page ?? page}
              </span>
              {meta?.totalPages ? (
                <>
                  {" "}
                  de{" "}
                  <span className="font-medium text-foreground">
                    {meta.totalPages}
                  </span>
                </>
              ) : null}{" "}
              • Total:{" "}
              <span className="font-medium text-foreground">
                {meta?.total ?? 0}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
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
