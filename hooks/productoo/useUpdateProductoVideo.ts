// src/hooks/productoo/useUpdateProductoVideo.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type PlataformaVideo = "INSTAGRAM" | "TIKTOK";

export type UpdateProductoVideoBody = {
  plataforma?: PlataformaVideo;
  url?: string;
  etiqueta?: string | null;
  orden?: number;
};

export type UpdateProductoVideoResponse = {
  id: string;
  productoId: string;
  plataforma: PlataformaVideo;
  url: string;
  etiqueta: string | null;
  orden: number;
  createdAt: string;
  updatedAt: string;
};

export function useUpdateProductoVideo(productoId: string, videoId: string) {
  const qc = useQueryClient();

  return useMutation<
    UpdateProductoVideoResponse,
    unknown,
    UpdateProductoVideoBody
  >({
    mutationFn: async (body) => {
      return api
        .put(`producto/${productoId}/videos/${videoId}`, {
          json: {
            plataforma: body.plataforma ?? undefined,
            url: body.url ?? undefined,
            etiqueta: body.etiqueta === undefined ? undefined : body.etiqueta,
            orden: body.orden ?? undefined,
          },
        })
        .json<UpdateProductoVideoResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
