// src/hooks/productoo/useDeleteProductoVariante.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type DeleteProductoVarianteResponse = {
  productoId: string;
  varianteId: string;
  deleted: true;
};

export function useDeleteProductoVariante(
  productoId: string,
  varianteId: string,
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
