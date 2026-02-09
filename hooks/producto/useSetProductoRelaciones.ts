// src/hooks/productoo/useSetProductoRelaciones.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type SetProductoRelacionesBody = {
  categoriaIds?: number[];
  coleccionIds?: number[];
  insigniaIds?: number[];
};

export type ProductoRelacionesResponse = {
  id: string;
  categorias: Array<{ id: number; nombre: string }>;
  colecciones: Array<{ id: number; nombre: string }>;
  insignias: Array<{ id: number; nombre: string }>;
};

export function useSetProductoRelaciones(productoId: number) {
  const qc = useQueryClient();

  return useMutation<
    ProductoRelacionesResponse,
    unknown,
    SetProductoRelacionesBody
  >({
    mutationFn: async (body) => {
      return api
        .put(`producto/${productoId}/relaciones`, { json: body })
        .json<ProductoRelacionesResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
