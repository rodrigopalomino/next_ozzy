"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Pencil,
  ArrowUpDown,
  X,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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
import { Progress } from "@/components/ui/progress";

// ✅ HOOKS (tuyos)
import { useCreateColeccion } from "@/hooks/coleccion/useCreateColeccion";
import { useUpdateColeccion } from "@/hooks/coleccion/useUpdateColeccion";
import { useColecciones } from "@/hooks/coleccion/useColecciones";

// ✅ Hooks de imagen (los 3 nuevos que ya tienes)
import { useColeccionImagenPresign } from "@/hooks/coleccion/useColeccionImagenPresign";
import { useSetColeccionImagenPortada } from "@/hooks/coleccion/useSetColeccionImagenPortada";
import { useRemoveColeccionImagenPortada } from "@/hooks/coleccion/useRemoveColeccionImagenPortada";

// ✅ TIPOS (usa tus types reales si ya existen)
type Coleccion = {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagenPortada?: string | null;
  iniciaEn?: string | null;
  terminaEn?: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

type SortKey = "nombre" | "createdAt";
type SortDir = "asc" | "desc";

const ESTADO_VALUES = ["ALL", "ACTIVO", "INACTIVO"] as const;
type EstadoFilter = (typeof ESTADO_VALUES)[number];

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

function normalizeIsoOrNull(v: string) {
  const t = v.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (p: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const p = Math.round((e.loaded / e.total) * 100);
      onProgress(Math.max(1, Math.min(99, p)));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("Upload error"));
    xhr.send(file);
  });
}

export default function PageColecciones() {
  // ✅ paginado real
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  // filtros UI locales (solo página actual)
  const [q, setQ] = React.useState("");
  const [estado, setEstado] = React.useState<EstadoFilter>("ALL");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  // modal
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coleccion | null>(null);

  // ✅ data real
  const { data, isLoading, isError } = useColecciones({ page, limit });
  const createColeccion = useCreateColeccion();
  const updateColeccion = useUpdateColeccion();

  // control de UI
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const hasFilters = q.trim().length > 0 || estado !== "ALL";

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((c) => {
        const matchQ =
          !qq ||
          c.nombre.toLowerCase().includes(qq) ||
          c.slug.toLowerCase().includes(qq) ||
          (c.descripcion ?? "").toLowerCase().includes(qq);

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

  function clearFilters() {
    setQ("");
    setEstado("ALL");
  }

  function onCreate() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: Coleccion) {
    setEditing(row);
    setOpen(true);
  }

  async function onSubmitForm(payload: {
    nombre: string;
    slug: string;
    descripcion: string | null;
    imagenPortada: string | null;
    iniciaEn: string | null;
    terminaEn: string | null;
    activo: boolean;
  }) {
    if (!payload.nombre.trim() || !payload.slug.trim()) return;

    if (!editing) {
      await createColeccion.mutateAsync({
        nombre: payload.nombre.trim(),
        slug: slugify(payload.slug.trim()),
        descripcion: payload.descripcion,
        imagenPortada: payload.imagenPortada,
        iniciaEn: payload.iniciaEn,
        terminaEn: payload.terminaEn,
        activo: payload.activo,
      });
    } else {
      await updateColeccion.mutateAsync({
        id: editing.id,
        payload: {
          nombre: payload.nombre.trim(),
          slug: slugify(payload.slug.trim()),
          descripcion: payload.descripcion,
          imagenPortada: payload.imagenPortada,
          iniciaEn: payload.iniciaEn,
          terminaEn: payload.terminaEn,
          activo: payload.activo,
        },
      });
    }

    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(row: Coleccion, value: boolean) {
    setUpdatingId(row.id);
    try {
      await updateColeccion.mutateAsync({
        id: row.id,
        payload: { activo: value },
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const canPrev = page > 1;
  const canNext = meta?.totalPages ? page < meta.totalPages : true;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Colecciones</h1>
          <p className="text-sm text-muted-foreground">
            Administra nombre, slug, descripción, portada, vigencia y estado.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={onCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva colección
            </Button>
          </DialogTrigger>

          <ColeccionDialogContent
            value={editing}
            loading={createColeccion.isPending || updateColeccion.isPending}
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
            onSubmit={onSubmitForm}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>Listado</CardTitle>
              <CardDescription>
                Paginado real + filtros locales.
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
                  placeholder="Buscar por nombre, slug o descripción…"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="md:col-span-3 min-w-0">
              <Select
                value={estado}
                onValueChange={(v) => {
                  if (ESTADO_VALUES.includes(v as EstadoFilter)) {
                    setEstado(v as EstadoFilter);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVO">Activas</SelectItem>
                  <SelectItem value="INACTIVO">Inactivas</SelectItem>
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
                  <SelectItem value="createdAt:desc">Más recientes</SelectItem>
                  <SelectItem value="createdAt:asc">Más antiguas</SelectItem>
                  <SelectItem value="nombre:asc">Nombre A–Z</SelectItem>
                  <SelectItem value="nombre:desc">Nombre Z–A</SelectItem>
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
                  <TableHead className="w-[44%] min-w-[260px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (sortKey !== "nombre") {
                          setSortKey("nombre");
                          setSortDir("asc");
                        } else {
                          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                        }
                      }}
                      className="-ml-2 h-8"
                    >
                      Colección <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>

                  <TableHead className="w-[20%] min-w-[180px]">Slug</TableHead>
                  <TableHead className="w-[16%] min-w-[200px]">
                    Vigencia
                  </TableHead>
                  <TableHead className="w-[12%] min-w-[150px]">
                    Estado
                  </TableHead>
                  <TableHead className="w-[8%] min-w-[90px] text-right">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Error cargando colecciones.
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No hay colecciones con esos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {row.imagenPortada ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.imagenPortada}
                                alt={row.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {row.nombre}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {row.descripcion
                                ? row.descripcion
                                : "Sin descripción"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Creado: {formatDate(row.createdAt)} • Editado:{" "}
                              {formatDate(row.updatedAt)}
                            </div>
                          </div>

                          <Badge
                            variant={row.activo ? "default" : "secondary"}
                            className="ml-auto shrink-0"
                          >
                            {row.activo ? "ACTIVA" : "INACTIVA"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {row.slug}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {row.iniciaEn ? formatDate(row.iniciaEn) : "—"}{" "}
                          <span className="text-muted-foreground">→</span>{" "}
                          {row.terminaEn ? formatDate(row.terminaEn) : "—"}
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

// =====================================================================================

function ColeccionDialogContent(props: {
  value: Coleccion | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: {
    nombre: string;
    slug: string;
    descripcion: string | null;
    imagenPortada: string | null;
    iniciaEn: string | null;
    terminaEn: string | null;
    activo: boolean;
  }) => void;
}) {
  const isEdit = !!props.value;
  const coleccionId = props.value?.id ?? 0;

  // ✅ hooks imagen (USAR los tuyos)
  const presign = useColeccionImagenPresign();
  const setPortada = useSetColeccionImagenPortada(coleccionId);
  const removePortada = useRemoveColeccionImagenPortada(coleccionId);

  const [nombre, setNombre] = React.useState(props.value?.nombre ?? "");
  const [slug, setSlug] = React.useState(props.value?.slug ?? "");
  const [descripcion, setDescripcion] = React.useState(
    props.value?.descripcion ?? "",
  );
  const [activo, setActivo] = React.useState<boolean>(
    props.value?.activo ?? true,
  );

  const [iniciaEn, setIniciaEn] = React.useState<string>(
    props.value?.iniciaEn ?? "",
  );
  const [terminaEn, setTerminaEn] = React.useState<string>(
    props.value?.terminaEn ?? "",
  );

  const [imagenPortada, setImagenPortada] = React.useState<string>(
    props.value?.imagenPortada ?? "",
  );
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setNombre(props.value?.nombre ?? "");
    setSlug(props.value?.slug ?? "");
    setDescripcion(props.value?.descripcion ?? "");
    setActivo(props.value?.activo ?? true);
    setIniciaEn(props.value?.iniciaEn ?? "");
    setTerminaEn(props.value?.terminaEn ?? "");
    setImagenPortada(props.value?.imagenPortada ?? "");
    setUploading(false);
    setProgress(0);
  }, [props.value]);

  const canSubmit = nombre.trim().length >= 2;

  function autoSlug() {
    setSlug(slugify(nombre));
  }

  function submit() {
    if (!canSubmit) return;

    props.onSubmit({
      nombre: nombre.trim(),
      slug: slugify((slug.trim() || nombre).trim()),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
      imagenPortada: imagenPortada.trim() ? imagenPortada.trim() : null,
      iniciaEn: normalizeIsoOrNull(iniciaEn),
      terminaEn: normalizeIsoOrNull(terminaEn),
      activo,
    });
  }

  async function uploadImage(file: File) {
    // ✅ Crear primero; luego editar para subir imagen (porque necesitas ID)
    if (!isEdit || !coleccionId) return;

    setUploading(true);
    setProgress(5);

    try {
      const pres = await presign.mutateAsync({
        coleccionId,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });

      await uploadWithProgress(pres.uploadUrl, file, (p) => setProgress(p));

      await setPortada.mutateAsync({ url: pres.url });

      setImagenPortada(pres.url);
      setProgress(100);
    } catch {
      setProgress(0);
    } finally {
      setTimeout(() => setUploading(false), 150);
    }
  }

  function onPickFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void uploadImage(file);
  }

  async function removeImage() {
    if (!imagenPortada) return;

    // si es nuevo sin ID, solo limpia UI
    if (!isEdit || !coleccionId) {
      setImagenPortada("");
      setProgress(0);
      return;
    }

    setUploading(true);
    setProgress(35);

    try {
      await removePortada.mutateAsync();
      setImagenPortada("");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <DialogContent className="w-[50vw] max-h-[85vh] box-border flex flex-col overflow-hidden text-black px-4 sm:px-6">
      <DialogHeader className="shrink-0">
        <DialogTitle className="text-black">
          {isEdit ? "Editar colección" : "Nueva colección"}
        </DialogTitle>
        <DialogDescription className="text-gray-700">
          {isEdit
            ? "Puedes subir, reemplazar o quitar la portada."
            : "Crea la colección primero. Luego podrás subir la imagen de portada."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="grid gap-4 pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-black">Nombre</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ofertas"
                className="text-black placeholder:text-gray-500"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-black">Slug</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={autoSlug}
                >
                  Autogenerar
                </Button>
              </div>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej. ofertas"
                className="text-black placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-700">
                Se normaliza a formato URL-friendly al guardar.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-black">Descripción (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Texto corto para el catálogo…"
              className="min-h-[5.5rem] text-black placeholder:text-gray-500"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-black">Imagen de portada (opcional)</Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <Dropzone
                  disabled={uploading || !isEdit}
                  onFiles={onPickFile}
                />

                {uploading && (
                  <div className="mt-3 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-black">
                      <UploadCloud className="h-4 w-4" />
                      Subiendo imagen…
                    </div>
                    <Progress value={progress} className="mt-2" />
                    <div className="mt-1 text-xs text-gray-700">
                      {progress}%
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-black">Preview</div>

                <div className="mt-2 aspect-[4/3] overflow-hidden rounded-md border bg-muted">
                  {imagenPortada ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagenPortada}
                      alt="Portada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-gray-700">
                      <ImageIcon className="mb-2 h-4 w-4" />
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="mt-3 grid gap-2">
                  <Input
                    value={imagenPortada ?? ""}
                    onChange={(e) => setImagenPortada(e.target.value)}
                    placeholder="https://..."
                    className="text-black placeholder:text-gray-500"
                    disabled
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => void removeImage()}
                      disabled={!imagenPortada || uploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {!isEdit ? (
              <p className="text-xs text-gray-700">
                * Guarda la colección para habilitar la subida de imagen.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-black">Inicia en (opcional)</Label>
              <Input
                value={iniciaEn}
                onChange={(e) => setIniciaEn(e.target.value)}
                placeholder="2026-01-01"
                className="text-black placeholder:text-gray-500"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-black">Termina en (opcional)</Label>
              <Input
                value={terminaEn}
                onChange={(e) => setTerminaEn(e.target.value)}
                placeholder="2026-03-31"
                className="text-black placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid gap-2">
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

      <DialogFooter className="shrink-0 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={props.onCancel}
          disabled={props.loading || uploading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={submit}
          disabled={!canSubmit || uploading || props.loading}
        >
          {isEdit ? "Guardar cambios" : "Crear colección"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Dropzone(props: {
  disabled?: boolean;
  onFiles: (files: FileList | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = React.useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (props.disabled) return;
    setIsOver(true);
  }

  function onDragLeave() {
    setIsOver(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
    if (props.disabled) return;
    props.onFiles(e.dataTransfer.files);
  }

  return (
    <div
      className={[
        "group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center transition",
        isOver ? "bg-muted/60" : "bg-background",
        props.disabled ? "opacity-60 pointer-events-none" : "hover:bg-muted/40",
      ].join(" ")}
      onClick={openPicker}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => props.onFiles(e.target.files)}
      />

      <UploadCloud className="mb-3 h-6 w-6 text-muted-foreground" />
      <div className="text-sm font-medium">
        Arrastra y suelta tu imagen aquí
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        o haz click para seleccionar (JPG/PNG/WebP)
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openPicker();
          }}
          disabled={props.disabled}
        >
          Seleccionar archivo
        </Button>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          Portada 4:3 recomendado
        </span>
      </div>
    </div>
  );
}
