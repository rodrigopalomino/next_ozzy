// src/hooks/useDeleteProductoImagen.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProductoImagen(productoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imgId: string) => {
      return api
        .delete(`admin/producto/${productoId}/imagenes/${imgId}`)
        .json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["producto", productoId],
      });
    },
  });
}
