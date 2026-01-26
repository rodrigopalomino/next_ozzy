// src/components/producto/edit/VideosTab.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateProductoVideo } from "@/hooks/productoo/useCreateProductoVideo";
import { useDeleteProductoVideo } from "@/hooks/productoo/useDeleteProductoVideo";
import { useUpdateProductoVideo } from "@/hooks/productoo/useUpdateProductoVideo";

type PlataformaVideo = "INSTAGRAM" | "TIKTOK";

export type VideosForm = {
  plataforma: PlataformaVideo;
  url: string;
  etiqueta: string;
  orden: string;
};

type VideoItem = {
  id: string;
  plataforma: string;
  url: string;
  etiqueta?: string | null;
  orden: number;
};

function toIntOrZero(raw: string) {
  const v = Number(String(raw ?? "").trim());
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.trunc(v));
}

function isValidUrl(raw: string) {
  try {
    new URL(raw);
    return true;
  } catch {
    return false;
  }
}

export function VideosTab({
  productoId,
  state,
  videos,
}: {
  productoId: string;
  state: {
    form: VideosForm;
    setForm: React.Dispatch<React.SetStateAction<VideosForm>>;
  };
  videos: VideoItem[];
}) {
  const { form, setForm } = state;

  // hooks
  const { mutateAsync: createAsync, isPending: isCreating } =
    useCreateProductoVideo(productoId);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const [msg, setMsg] = React.useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function onCreate() {
    try {
      setMsg(null);

      const url = form.url.trim();
      if (!url) throw new Error("URL es requerida");
      if (!isValidUrl(url)) throw new Error("URL inválida");

      await createAsync({
        plataforma: form.plataforma,
        url,
        etiqueta: form.etiqueta.trim() ? form.etiqueta.trim() : undefined,
        orden: toIntOrZero(form.orden),
      });

      // limpiar form
      setForm((p) => ({ ...p, url: "", etiqueta: "", orden: "0" }));
      setMsg({ type: "ok", text: "Video agregado." });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Error agregando video." });
    }
  }

  const busy = isCreating || Boolean(deletingId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Videos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-md border p-4 space-y-3">
          <div className="text-sm font-medium">Agregar video</div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Plataforma</Label>
              <Select
                value={form.plataforma}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, plataforma: v as PlataformaVideo }))
                }
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTAGRAM">INSTAGRAM</SelectItem>
                  <SelectItem value="TIKTOK">TIKTOK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, url: e.target.value }))
                }
                placeholder="https://..."
                disabled={busy}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-2">
              <Label>Etiqueta (opcional)</Label>
              <Input
                value={form.etiqueta}
                onChange={(e) =>
                  setForm((p) => ({ ...p, etiqueta: e.target.value }))
                }
                disabled={busy}
              />
            </div>
            <div className="grid gap-2">
              <Label>Orden</Label>
              <Input
                value={form.orden}
                onChange={(e) =>
                  setForm((p) => ({ ...p, orden: e.target.value }))
                }
                disabled={busy}
              />
            </div>
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

          <Button onClick={onCreate} disabled={busy}>
            {isCreating ? "Agregando..." : "Agregar video"}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Lista</div>

          {videos.length ? (
            <div className="grid gap-3">
              {videos
                .slice()
                .sort((a, b) => a.orden - b.orden)
                .map((v) => (
                  <VideoRow
                    key={v.id}
                    productoId={productoId}
                    video={v}
                    onBusy={(id) => setDeletingId(id)}
                    onDone={() => setDeletingId(null)}
                  />
                ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Aún no hay videos.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** ======================
 * Row: editar (inline) + eliminar
 * ====================== */
function VideoRow({
  productoId,
  video,
  onBusy,
  onDone,
}: {
  productoId: string;
  video: VideoItem;
  onBusy: (id: string) => void;
  onDone: () => void;
}) {
  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    useDeleteProductoVideo(productoId, video.id);

  const { mutateAsync: updateAsync, isPending: isUpdating } =
    useUpdateProductoVideo(productoId, video.id);

  const [edit, setEdit] = React.useState(false);

  const [draft, setDraft] = React.useState({
    plataforma: (video.plataforma as PlataformaVideo) ?? "INSTAGRAM",
    url: video.url ?? "",
    etiqueta: video.etiqueta ?? "",
    orden: String(video.orden ?? 0),
  });

  React.useEffect(() => {
    setDraft({
      plataforma: (video.plataforma as PlataformaVideo) ?? "INSTAGRAM",
      url: video.url ?? "",
      etiqueta: video.etiqueta ?? "",
      orden: String(video.orden ?? 0),
    });
  }, [video.id, video.plataforma, video.url, video.etiqueta, video.orden]);

  const busy = isDeleting || isUpdating;

  async function onDelete() {
    try {
      onBusy(video.id);
      await deleteAsync();
    } finally {
      onDone();
    }
  }

  async function onSave() {
    const url = draft.url.trim();
    if (!url) return; // no hagas nada silencioso si quieres, cámbialo por toast
    if (!isValidUrl(url)) return;

    await updateAsync({
      plataforma: draft.plataforma,
      url,
      etiqueta: String(draft.etiqueta ?? "").trim()
        ? String(draft.etiqueta ?? "").trim()
        : null,
      orden: toIntOrZero(draft.orden),
    });

    setEdit(false);
  }

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {!edit ? (
            <>
              <div className="text-sm font-medium">
                {video.plataforma} • orden {video.orden}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {video.url}
              </div>
              {video.etiqueta ? (
                <div className="text-xs">{video.etiqueta}</div>
              ) : null}
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Plataforma</Label>
                  <Select
                    value={draft.plataforma}
                    onValueChange={(v) =>
                      setDraft((p) => ({
                        ...p,
                        plataforma: v as PlataformaVideo,
                      }))
                    }
                    disabled={busy}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTAGRAM">INSTAGRAM</SelectItem>
                      <SelectItem value="TIKTOK">TIKTOK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>URL</Label>
                  <Input
                    value={draft.url}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, url: e.target.value }))
                    }
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Etiqueta</Label>
                  <Input
                    value={draft.etiqueta ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, etiqueta: e.target.value }))
                    }
                    disabled={busy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Orden</Label>
                  <Input
                    value={draft.orden}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, orden: e.target.value }))
                    }
                    disabled={busy}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!edit ? (
            <Button
              variant="outline"
              onClick={() => setEdit(true)}
              disabled={busy}
            >
              Editar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setEdit(false)}
                disabled={busy}
              >
                Cancelar
              </Button>
              <Button onClick={onSave} disabled={busy}>
                {isUpdating ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}

          <Button variant="destructive" onClick={onDelete} disabled={busy}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
