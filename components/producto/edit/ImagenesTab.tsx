// src/components/admin/productos/edit/tabs/ImagenesTab.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useProductoImagenPresign } from "@/hooks/useProductoImagenPresign";
import { useCreateProductoImagen } from "@/hooks/useCreateProductoImagen";
import { useDeleteProductoImagen } from "@/hooks/useDeleteProductoImagen";

type ImgTipo = "principal" | "hover" | "galeria";
type ImgStatus = "idle" | "uploading" | "done" | "error";

type ImgUI = {
  // ✅ id BD: number | null si aún no existe en BD
  imagenId: number | null;

  // ✅ id temporal SOLO para UI/local
  tempId: string;

  file?: File;
  previewUrl: string;
  alt: string;

  // ✅ UI: mantenemos un "tipo" para ordenar y marcar etiquetas
  tipo: ImgTipo;

  orden: number;
  status: ImgStatus;
  errorMsg?: string;
};

type InitialImg = {
  id: number;
  previewUrl: string;
  alt: string;
  orden: number;

  // ✅ viene del backend (nuevo modelo)
  esPrincipal?: boolean | null;
  esHover?: boolean | null;
};

export function ImagenesTab({
  productoId,
  initial,
}: {
  productoId: number;
  initial: InitialImg[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ImageManagerShopifyLike productoId={productoId} initial={initial} />
      </CardContent>
    </Card>
  );
}

function ImageManagerShopifyLike({
  productoId,
  initial,
}: {
  productoId: number;
  initial: InitialImg[];
}) {
  const { mutateAsync: presignAsync } = useProductoImagenPresign(productoId);
  const { mutateAsync: createAsync, isPending: isCreating } =
    useCreateProductoImagen(productoId);
  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    useDeleteProductoImagen(productoId);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  function computeTipo(x: InitialImg): ImgTipo {
    if (x.esPrincipal) return "principal";
    if (x.esHover) return "hover";
    return "galeria";
  }

  const toUI = React.useCallback((arr: InitialImg[]): ImgUI[] => {
    // ✅ orden: principal, hover, galeria (y luego por orden asc)
    const sorted = arr.slice().sort((a, b) => {
      const ta = computeTipo(a);
      const tb = computeTipo(b);
      const rank = (t: ImgTipo) =>
        t === "principal" ? 0 : t === "hover" ? 1 : 2;
      const ra = rank(ta);
      const rb = rank(tb);
      if (ra !== rb) return ra - rb;
      return (a.orden ?? 0) - (b.orden ?? 0);
    });

    return sorted.map((x, i) => ({
      imagenId: x.id,
      tempId: `bd-${x.id}`,
      previewUrl: x.previewUrl,
      alt: x.alt ?? "",
      tipo: computeTipo(x),
      orden: i,
      status: "done" as const,
    }));
  }, []);

  const [items, setItems] = React.useState<ImgUI[]>(() => toUI(initial));

  // ✅ cuando cambia initial (refetch), rehidrata
  React.useEffect(() => {
    setItems(toUI(initial));
  }, [initial, toUI]);

  // ✅ limpiar blobs en unmount
  React.useEffect(() => {
    return () => {
      items.forEach((i) => {
        if (i.previewUrl.startsWith("blob:")) URL.revokeObjectURL(i.previewUrl);
      });
    };
  }, [items]);

  function openPicker() {
    inputRef.current?.click();
  }

  function nextOrdenBase(current: ImgUI[]) {
    return current.length;
  }

  function getKey(img: ImgUI) {
    // ✅ clave estable para UI
    return img.imagenId != null ? `bd-${img.imagenId}` : img.tempId;
  }

  async function uploadAndCreateOne(file: File, tipo: ImgTipo, orden: number) {
    const presign = await presignAsync({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
    });

    const res = await fetch(presign.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });

    if (!res.ok) throw new Error(`Error subiendo archivo (HTTP ${res.status})`);

    const publicUrl = presign.url;
    if (!publicUrl || typeof publicUrl !== "string" || publicUrl.length < 5) {
      throw new Error("Presign no devolvió una URL válida");
    }

    // ✅ nuevo: sin "tipo"
    await createAsync({
      url: publicUrl,
      alt: "",
      orden,
      esPrincipal: tipo === "principal",
      esHover: tipo === "hover",
    });
  }

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;

    const hasPrincipal = items.some((x) => x.tipo === "principal");
    const hasHover = items.some((x) => x.tipo === "hover");

    // ✅ crea items locales primero (UI inmediata)
    const tempToAdd: ImgUI[] = arr.map((f, idx) => {
      // primer archivo: si no hay principal => principal
      // si ya hay principal pero no hay hover => hover
      const willBePrincipal = !hasPrincipal && idx === 0;
      const willBeHover = !willBePrincipal && !hasHover && idx === 0;

      return {
        imagenId: null,
        tempId: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        alt: "",
        tipo: willBePrincipal ? "principal" : willBeHover ? "hover" : "galeria",
        orden: 0,
        status: "uploading",
      };
    });

    // ✅ inserta y reordena (principal arriba, hover segundo)
    setItems((prev) => {
      const merged = [...prev, ...tempToAdd];

      const rank = (t: ImgTipo) =>
        t === "principal" ? 0 : t === "hover" ? 1 : 2;
      const ordered = merged
        .slice()
        .sort((a, b) => rank(a.tipo) - rank(b.tipo) || a.orden - b.orden);

      return ordered.map((x, i) => ({ ...x, orden: i }));
    });

    // ✅ sube uno por uno
    for (const img of tempToAdd) {
      try {
        const currentOrden = (() => {
          const rank = (t: ImgTipo) =>
            t === "principal" ? 0 : t === "hover" ? 1 : 2;

          const snap = items
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .concat(tempToAdd)
            .sort((a, b) => rank(a.tipo) - rank(b.tipo) || a.orden - b.orden)
            .map((x, i) => ({ ...x, orden: i }));

          const found = snap.find((x) => x.tempId === img.tempId);
          return found?.orden ?? nextOrdenBase(items);
        })();

        await uploadAndCreateOne(img.file!, img.tipo, currentOrden);

        setItems((prev) =>
          prev.map((x) =>
            x.tempId === img.tempId ? { ...x, status: "done" } : x,
          ),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error subiendo imagen";
        setItems((prev) =>
          prev.map((x) =>
            x.tempId === img.tempId
              ? { ...x, status: "error", errorMsg: msg }
              : x,
          ),
        );
      }
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function setPrincipalUI(key: string) {
    setItems((prev) => {
      const next = prev.map((x) =>
        getKey(x) === key
          ? { ...x, tipo: "principal" as const }
          : x.tipo === "principal"
            ? { ...x, tipo: "galeria" as const } // el principal anterior baja a galería
            : x,
      );

      // si el marcado como principal era hover => quita hover de ese slot (ya está implícito)
      next.forEach((x) => {
        if (x.tipo === "principal") return;
      });

      const rank = (t: ImgTipo) =>
        t === "principal" ? 0 : t === "hover" ? 1 : 2;
      next.sort((a, b) => rank(a.tipo) - rank(b.tipo));
      return next.map((x, i) => ({ ...x, orden: i }));
    });
  }

  function setHoverUI(key: string) {
    setItems((prev) => {
      const next = prev.map((x) =>
        getKey(x) === key
          ? { ...x, tipo: "hover" as const }
          : x.tipo === "hover"
            ? { ...x, tipo: "galeria" as const }
            : x,
      );

      // (solo para evitar estados raros locales, no cambia estilos)
      // si el hover cayó sobre el principal por accidente, lo dejamos como principal
      // (esto no debería pasar por el botón, pero queda blindado)
      const rank = (t: ImgTipo) =>
        t === "principal" ? 0 : t === "hover" ? 1 : 2;
      next.sort((a, b) => rank(a.tipo) - rank(b.tipo));
      return next.map((x, i) => ({ ...x, orden: i }));
    });
  }

  function moveUI(key: string, dir: -1 | 1) {
    setItems((prev) => {
      const ordered = prev.slice().sort((a, b) => a.orden - b.orden);
      const idx = ordered.findIndex((x) => getKey(x) === key);
      if (idx < 0) return prev;

      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= ordered.length) return prev;

      // no permitas pasar por encima de principal/hover si no eres ese tipo
      const rank = (t: ImgTipo) =>
        t === "principal" ? 0 : t === "hover" ? 1 : 2;
      if (rank(ordered[idx].tipo) > rank(ordered[swapIdx].tipo)) return prev;

      const next = ordered.slice();
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((x, i) => ({ ...x, orden: i }));
    });
  }

  async function remove(img: ImgUI) {
    // ✅ si no existe en BD, solo quita de UI
    if (img.imagenId == null) {
      if (img.previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(img.previewUrl);

      setItems((prev) => {
        const next = prev.filter((x) => x.tempId !== img.tempId);
        return next.map((x, i) => ({ ...x, orden: i }));
      });
      return;
    }

    // ✅ BD id: number
    await deleteAsync(img.imagenId);
  }

  function setAltUI(key: string, alt: string) {
    setItems((prev) =>
      prev.map((x) => (getKey(x) === key ? { ...x, alt } : x)),
    );
  }

  const ordered = items.slice().sort((a, b) => a.orden - b.orden);
  const busy = isCreating || isDeleting;

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">Media</div>
          <div className="text-xs text-muted-foreground">
            Sube imágenes (MinIO), marca principal/hover (UI) y elimina.
          </div>
        </div>

        <Button type="button" onClick={openPicker} disabled={busy}>
          Agregar imágenes
        </Button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "rounded-lg border border-dashed p-6 transition",
          dragOver ? "bg-muted" : "bg-background",
        ].join(" ")}
      >
        <div className="text-sm font-medium">Arrastra y suelta aquí</div>
        <div className="text-xs text-muted-foreground">
          o usa “Agregar imágenes”. PNG, JPG, WEBP.
        </div>
      </div>

      {ordered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((img) => {
            const key = getKey(img);
            return (
              <div key={key} className="rounded-lg border p-3 space-y-3">
                <div className="relative overflow-hidden rounded-md border bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.alt}
                    className="h-48 w-full object-cover"
                  />

                  {img.tipo === "principal" ? (
                    <div className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-xs text-white">
                      Principal
                    </div>
                  ) : null}

                  {img.tipo === "hover" ? (
                    <div className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-xs text-white">
                      Hover
                    </div>
                  ) : null}

                  {img.status === "uploading" ? (
                    <div className="absolute inset-0 grid place-items-center bg-black/40 text-xs text-white">
                      Subiendo...
                    </div>
                  ) : null}

                  {img.status === "error" ? (
                    <div className="absolute inset-0 grid place-items-center bg-red-600/60 px-2 text-center text-xs text-white">
                      {img.errorMsg ?? "Error"}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">Alt (UI por ahora)</Label>
                  <Input
                    value={img.alt}
                    onChange={(e) => setAltUI(key, e.target.value)}
                    placeholder="Ej: Foto frontal"
                    disabled={img.status === "uploading" || busy}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Para guardar Alt/Orden/Principal/Hover en BD te falta un
                    endpoint update.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPrincipalUI(key)}
                    disabled={
                      img.tipo === "principal" || img.status === "uploading"
                    }
                  >
                    Hacer principal (UI)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHoverUI(key)}
                    disabled={
                      img.tipo === "hover" ||
                      img.tipo === "principal" ||
                      img.status === "uploading"
                    }
                  >
                    Hacer hover (UI)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => moveUI(key, -1)}
                    disabled={img.status === "uploading"}
                    title="Subir"
                  >
                    ↑
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => moveUI(key, 1)}
                    disabled={img.status === "uploading"}
                    title="Bajar"
                  >
                    ↓
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(img)}
                    disabled={img.status === "uploading" || busy}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Orden(UI): {img.orden} • Tipo(UI): {img.tipo}{" "}
                  {img.imagenId != null ? `• BD#${img.imagenId}` : "• Local"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Aún no hay imágenes.
        </div>
      )}
    </div>
  );
}
