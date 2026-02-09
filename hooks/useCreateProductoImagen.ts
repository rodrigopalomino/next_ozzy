// src/hooks/useCreateProductoImagen.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateProductoImagenBody = {
  url: string;
  alt?: string | null;
  orden: number;

  // ✅ nuevo modelo
  esPrincipal?: boolean;
  esHover?: boolean;
};

export function useCreateProductoImagen(productoId: number) {
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
      await queryClient.invalidateQueries({
        queryKey: ["producto", productoId],
      });
    },
  });
}
