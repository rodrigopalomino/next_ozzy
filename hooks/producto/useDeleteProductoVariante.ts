// src/hooks/productoo/useDeleteProductoVariante.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type DeleteProductoVarianteResponse = {
  productoId: number;
  varianteId: number;
  deleted: true;
};

export function useDeleteProductoVariante(
  productoId: number,
  varianteId: number,
) {
  const qc = useQueryClient();

  return useMutation<DeleteProductoVarianteResponse>({
    mutationFn: async () => {
      return api
        .delete(`producto/${productoId}/variantes/${varianteId}`)
        .json<DeleteProductoVarianteResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
