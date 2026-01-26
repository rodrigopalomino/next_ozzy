// src/hooks/useDeleteProductoPrecio.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type DeleteProductoPrecioResponse = {
  productoId: string;
  deleted: true;
};

export function useDeleteProductoPrecio(productoId: string) {
  const qc = useQueryClient();

  return useMutation<DeleteProductoPrecioResponse>({
    mutationFn: async () => {
      return api
        .delete(`producto/${productoId}/precio`)
        .json<DeleteProductoPrecioResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
