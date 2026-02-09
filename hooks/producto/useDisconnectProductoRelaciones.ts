// src/hooks/productoo/useDisconnectProductoRelaciones.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type DisconnectProductoRelacionesBody = {
  categoriaIds?: string[];
  coleccionIds?: string[];
  insigniaIds?: string[];
};

export type ProductoRelacionesResponse = {
  id: string;
  categorias: Array<{ id: string; nombre: string }>;
  colecciones: Array<{ id: string; nombre: string }>;
  insignias: Array<{ id: string; nombre: string }>;
};

export function useDisconnectProductoRelaciones(productoId: string) {
  const qc = useQueryClient();

  return useMutation<
    ProductoRelacionesResponse,
    unknown,
    DisconnectProductoRelacionesBody
  >({
    mutationFn: async (body) => {
      return api
        .put(`producto/${productoId}/relaciones/disconnect`, { json: body })
        .json<ProductoRelacionesResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
