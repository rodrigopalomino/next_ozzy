// src/hooks/productoo/useCreateProductoVideo.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type PlataformaVideo = "INSTAGRAM" | "TIKTOK";

export type CreateProductoVideoBody = {
  plataforma: PlataformaVideo;
  url: string;
  etiqueta?: string;
  orden?: number;
};

export type CreateProductoVideoResponse = {
  id: number;
  productoId: number;
  plataforma: PlataformaVideo;
  url: string;
  etiqueta: string | null;
  orden: number;
  createdAt: string;
  updatedAt: string;
};

export function useCreateProductoVideo(productoId: number) {
  const qc = useQueryClient();

  return useMutation<
    CreateProductoVideoResponse,
    unknown,
    CreateProductoVideoBody
  >({
    mutationFn: async (body) => {
      return api
        .post(`producto/${productoId}/videos`, {
          json: {
            plataforma: body.plataforma,
            url: body.url,
            etiqueta: body.etiqueta ?? undefined,
            orden: body.orden ?? 0,
          },
        })
        .json<CreateProductoVideoResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
