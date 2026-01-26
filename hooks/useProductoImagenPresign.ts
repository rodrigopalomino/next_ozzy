// src/hooks/useProductoImagenPresign.ts
"use client";

import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export type PresignBody = {
  filename: string;
  contentType: string;
};

export type PresignResponse = {
  uploadUrl: string; // PUT directo a MinIO
  url: string; // URL pública para guardar en BD
  objectKey: string; // key dentro del bucket
};

export function useProductoImagenPresign(productoId: string) {
  return useMutation({
    mutationFn: async (body: PresignBody) => {
      return api
        .post(`admin/producto/${productoId}/imagenes/presign`, {
          json: body,
        })
        .json<PresignResponse>();
    },
  });
}
