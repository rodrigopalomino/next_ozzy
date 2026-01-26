/* eslint-disable @typescript-eslint/no-explicit-any */
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

type ImgUI = {
  id: string;
  imagenId?: string;
  file?: File;
  previewUrl: string;
  alt: string;
  tipo: "principal" | "galeria";
  orden: number;
  status?: "idle" | "uploading" | "done" | "error";
  errorMsg?: string;
};

export function ImagenesTab({
  productoId,
  initial,
}: {
  productoId: string;
  initial: Array<{
    id: string;
    previewUrl: string;
    alt: string;
    tipo: "principal" | "galeria";
    orden: number;
  }>;
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
  productoId: string;
  initial: Array<{
    id: string;
    previewUrl: string;
    alt: string;
    tipo: "principal" | "galeria";
    orden: number;
  }>;
}) {
  const { mutateAsync: presignAsync } = useProductoImagenPresign(productoId);
  const { mutateAsync: createAsync, isPending: isCreating } =
    useCreateProductoImagen(productoId);
  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    useDeleteProductoImagen(productoId);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const [items, setItems] = React.useState<ImgUI[]>(() =>
    initial
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((x, i) => ({
        id: x.id,
        imagenId: x.id,
        previewUrl: x.previewUrl,
        alt: x.alt ?? "",
        tipo: x.tipo,
        orden: i,
        status: "done",
      })),
  );

  React.useEffect(() => {
    setItems(
      initial
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((x, i) => ({
          id: x.id,
          imagenId: x.id,
          previewUrl: x.previewUrl,
          alt: x.alt ?? "",
          tipo: x.tipo,
          orden: i,
          status: "done",
        })),
    );
  }, [initial]);

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

  function nextOrdenBase() {
    return items.length;
  }

  async function uploadAndCreateOne(file: File, tipo: "principal" | "galeria") {
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

    await createAsync({
      url: publicUrl,
      alt: "",
      orden: nextOrdenBase(),
      tipo,
    });
  }

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;

    const hasPrincipal = items.some((x) => x.tipo === "principal");

    const tempToAdd: ImgUI[] = arr.map((f, idx) => {
      const tempId = crypto.randomUUID();
      const willBePrincipal = !hasPrincipal && idx === 0;
      return {
        id: tempId,
        file: f,
        previewUrl: URL.createObjectURL(f),
        alt: "",
        tipo: willBePrincipal ? "principal" : "galeria",
        orden: 0,
        status: "uploading",
      };
    });

    setItems((prev) => {
      const merged = [...prev, ...tempToAdd];
      const next = merged
        .slice()
        .sort((a, b) => (a.tipo === "principal" ? -1 : 1));
      return next.map((x, i) => ({ ...x, orden: i }));
    });

    for (const img of tempToAdd) {
      try {
        await uploadAndCreateOne(img.file!, img.tipo);
        setItems((prev) =>
          prev.map((x) => (x.id === img.id ? { ...x, status: "done" } : x)),
        );
      } catch (e: any) {
        setItems((prev) =>
          prev.map((x) =>
            x.id === img.id
              ? {
                  ...x,
                  status: "error",
                  errorMsg: e?.message || "Error subiendo imagen",
                }
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

  function setPrincipalUI(id: string) {
    setItems((prev) => {
      const next = prev.map((x) =>
        x.id === id
          ? { ...x, tipo: "principal" as const }
          : { ...x, tipo: "galeria" as const },
      );

      next.sort((a) => (a.tipo === "principal" ? -1 : 1));
      return next.map((x, i) => ({ ...x, orden: i }));
    });
  }

  function moveUI(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const ordered = prev.slice().sort((a, b) => a.orden - b.orden);
      const idx = ordered.findIndex((x) => x.id === id);
      if (idx < 0) return prev;

      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= ordered.length) return prev;

      if (
        ordered[idx].tipo !== "principal" &&
        ordered[swapIdx].tipo === "principal"
      ) {
        return prev;
      }

      const next = ordered.slice();
      const tmp = next[idx];
      next[idx] = next[swapIdx];
      next[swapIdx] = tmp;

      return next.map((x, i) => ({ ...x, orden: i }));
    });
  }

  async function remove(img: ImgUI) {
    if (!img.imagenId) {
      if (img.previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(img.previewUrl);
      setItems((prev) => {
        const next = prev.filter((x) => x.id !== img.id);
        return next.map((x, i) => ({ ...x, orden: i }));
      });
      return;
    }
    await deleteAsync(img.imagenId);
  }

  function setAltUI(id: string, alt: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, alt } : x)));
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
            Sube imágenes (MinIO), marca principal (UI) y elimina.
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
          {ordered.map((img) => (
            <div key={img.id} className="rounded-lg border p-3 space-y-3">
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
                  onChange={(e) => setAltUI(img.id, e.target.value)}
                  placeholder="Ej: Foto frontal"
                  disabled={img.status === "uploading" || busy}
                />
                <p className="text-[11px] text-muted-foreground">
                  Para guardar Alt/Orden/Principal en BD te falta un endpoint
                  update.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPrincipalUI(img.id)}
                  disabled={
                    img.tipo === "principal" || img.status === "uploading"
                  }
                >
                  Hacer principal (UI)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => moveUI(img.id, -1)}
                  disabled={
                    img.tipo === "principal" || img.status === "uploading"
                  }
                  title="Subir"
                >
                  ↑
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => moveUI(img.id, 1)}
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
                {img.imagenId ? "• BD" : "• Local"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Aún no hay imágenes.
        </div>
      )}
    </div>
  );
}
