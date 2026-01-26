"use client";

import * as React from "react";
import { Search, Plus, Pencil, ArrowUpDown, X } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

type SortKey = "orden" | "nombre" | "createdAt";
type SortDir = "asc" | "desc";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function uniqId() {
  return crypto.randomUUID();
}

const MOCK: Categoria[] = [
  {
    id: "c1",
    nombre: "Polos",
    slug: "polos",
    orden: 1,
    activo: true,
    createdAt: "2025-12-11T10:00:00.000Z",
    updatedAt: "2025-12-12T10:00:00.000Z",
  },
  {
    id: "c2",
    nombre: "Zapatillas",
    slug: "zapatillas",
    orden: 2,
    activo: true,
    createdAt: "2025-12-13T10:00:00.000Z",
    updatedAt: "2025-12-20T10:00:00.000Z",
  },
  {
    id: "c3",
    nombre: "Accesorios",
    slug: "accesorios",
    orden: 3,
    activo: false,
    createdAt: "2025-12-10T10:00:00.000Z",
    updatedAt: "2025-12-21T10:00:00.000Z",
  },
];

export default function PageCategorias() {
  const [items, setItems] = React.useState<Categoria[]>(MOCK);

  const [q, setQ] = React.useState("");
  const [estado, setEstado] = React.useState<"ALL" | "ACTIVO" | "INACTIVO">(
    "ALL",
  );
  const [sortKey, setSortKey] = React.useState<SortKey>("orden");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Categoria | null>(null);

  const hasFilters = q.trim().length > 0 || estado !== "ALL";

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();

    const res = items
      .filter((c) => {
        const matchQ =
          !qq ||
          c.nombre.toLowerCase().includes(qq) ||
          c.slug.toLowerCase().includes(qq) ||
          String(c.orden).includes(qq);

        const matchEstado =
          estado === "ALL" ? true : estado === "ACTIVO" ? c.activo : !c.activo;

        return matchQ && matchEstado;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;

        const va =
          sortKey === "createdAt"
            ? new Date(a.createdAt).getTime()
            : sortKey === "orden"
              ? a.orden
              : a.nombre.toLowerCase();

        const vb =
          sortKey === "createdAt"
            ? new Date(b.createdAt).getTime()
            : sortKey === "orden"
              ? b.orden
              : b.nombre.toLowerCase();

        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });

    return res;
  }, [items, q, estado, sortKey, sortDir]);

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

  function onCreate() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: Categoria) {
    setEditing(row);
    setOpen(true);
  }

  function upsertCategoria(
    payload: Omit<Categoria, "createdAt" | "updatedAt">,
  ) {
    const now = new Date().toISOString();

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === payload.id);
      if (idx === -1) {
        return [
          {
            ...payload,
            createdAt: now,
            updatedAt: now,
          },
          ...prev,
        ];
      }
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        ...payload,
        updatedAt: now,
      };
      return copy;
    });

    setOpen(false);
    setEditing(null);
  }

  function setActivo(id: string, value: boolean) {
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, activo: value, updatedAt: now } : x,
      ),
    );
  }

  return (
    // ✅ mismo estilo que tu "Nuevo producto"
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Administra nombre, slug, orden y estado (activo/inactivo).
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={onCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Button>
          </DialogTrigger>
          <CategoriaDialogContent
            value={editing}
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
            onSubmit={upsertCategoria}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>Listado</CardTitle>
              <CardDescription>
                Filtra y ordena sin que el layout se rompa.
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
            <div className="md:col-span-6 min-w-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre, slug u orden…"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="md:col-span-3 min-w-0">
              <Select value={estado} onValueChange={(v) => setEstado(v as any)}>
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
                  <SelectItem value="orden:asc">Orden ↑</SelectItem>
                  <SelectItem value="orden:desc">Orden ↓</SelectItem>
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
          {/* ✅ evita que en mobile se “rompa” */}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[44%] min-w-[240px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("nombre")}
                      className="-ml-2 h-8"
                    >
                      Nombre <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[24%] min-w-[180px]">Slug</TableHead>
                  <TableHead className="w-[12%] min-w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("orden")}
                      className="-ml-2 h-8"
                    >
                      Orden <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[12%] min-w-[140px]">
                    Estado
                  </TableHead>
                  <TableHead className="w-[8%] min-w-[90px] text-right">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No hay categorías con esos filtros.
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
                            {row.activo ? "ACTIVA" : "INACTIVA"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {row.slug}
                      </TableCell>
                      <TableCell>{row.orden}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={row.activo}
                            onCheckedChange={(v) => setActivo(row.id, v)}
                            aria-label="Activo"
                          />
                          <span className="text-sm text-muted-foreground">
                            {row.activo ? "On" : "Off"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {items.length}
              </span>
              .
            </div>
            <div className="font-mono">
              sort={sortKey}:{sortDir} • estado={estado} • q="{q}"
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriaDialogContent(props: {
  value: Categoria | null;
  onCancel: () => void;
  onSubmit: (payload: Omit<Categoria, "createdAt" | "updatedAt">) => void;
}) {
  const isEdit = !!props.value;

  const [nombre, setNombre] = React.useState(props.value?.nombre ?? "");
  const [slug, setSlug] = React.useState(props.value?.slug ?? "");
  const [orden, setOrden] = React.useState<number>(props.value?.orden ?? 0);
  const [activo, setActivo] = React.useState<boolean>(
    props.value?.activo ?? true,
  );

  React.useEffect(() => {
    setNombre(props.value?.nombre ?? "");
    setSlug(props.value?.slug ?? "");
    setOrden(props.value?.orden ?? 0);
    setActivo(props.value?.activo ?? true);
  }, [props.value]);

  const canSubmit = nombre.trim().length >= 2 && slug.trim().length >= 2;

  function autoSlug() {
    setSlug(slugify(nombre));
  }

  function submit() {
    if (!canSubmit) return;

    props.onSubmit({
      id: props.value?.id ?? uniqId(),
      nombre: nombre.trim(),
      slug: slugify(slug.trim()),
      orden: Number.isFinite(orden) ? orden : 0,
      activo,
    });
  }

  return (
    // ✅ todo negro dentro del modal
    <DialogContent className="sm:max-w-[560px] text-black">
      <DialogHeader>
        <DialogTitle className="text-black">
          {isEdit ? "Editar categoría" : "Nueva categoría"}
        </DialogTitle>
        <DialogDescription className="text-gray-700">
          Campos reales del modelo:{" "}
          <span className="font-mono text-black">
            nombre, slug, orden, activo
          </span>
          .
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label className="text-black">Nombre</Label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Polos"
            className="text-black placeholder:text-gray-500"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-black">Slug</Label>
            <Button type="button" variant="ghost" size="sm" onClick={autoSlug}>
              Autogenerar
            </Button>
          </div>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ej. polos"
            className="text-black placeholder:text-gray-500"
          />
          <p className="text-xs text-gray-700">
            Se normaliza automáticamente a formato URL-friendly al guardar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-2 sm:col-span-1">
            <Label className="text-black">Orden</Label>
            <Input
              inputMode="numeric"
              value={String(orden)}
              onChange={(e) => setOrden(Number(e.target.value || 0))}
              placeholder="0"
              className="text-black placeholder:text-gray-500"
            />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label className="text-black">Activo</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium text-black">
                  {activo ? "Visible" : "Oculta"}
                </div>
                <div className="text-xs text-gray-700">
                  Si está inactiva, no aparece en el catálogo.
                </div>
              </div>
              <Switch checked={activo} onCheckedChange={setActivo} />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={props.onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={submit} disabled={!canSubmit}>
          {isEdit ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
