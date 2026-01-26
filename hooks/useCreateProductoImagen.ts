// src/hooks/useCreateProductoImagen.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateProductoImagenBody = {
  url: string;
  alt?: string | null;
  orden: number;
  tipo: "principal" | "galeria";
};

export function useCreateProductoImagen(productoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateProductoImagenBody) => {
      return api
        .post(`admin/producto/${productoId}/imagenes`, {
          json: body,
        })
        .json();
    },
    onSuccess: async () => {
      // refresca el producto → imágenes actualizadas
      await queryClient.invalidateQueries({
        queryKey: ["producto", productoId],
      });
    },
  });
}
