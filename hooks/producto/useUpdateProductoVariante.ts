// src/hooks/productoo/useUpdateProductoVariante.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateProductoVarianteBody = {
  talla_id?: number;
  color_id?: number;
  sku?: string | null;
  precio?: number | null;
  stock?: number | null;
  activo?: boolean;
};

export type ProductoVarianteResponse = {
  id: number;
  productoId: number;
  talla_id: number;
  color_id: number;
  sku: string | null;
  precio: number | null;
  stock: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  talla?: { id: number; etiqueta: string } | null;
  color?: { id: number; nombre: string } | null;
};

export function useUpdateProductoVariante(
  productoId: number,
  varianteId: number,
) {
  const qc = useQueryClient();

  return useMutation<
    ProductoVarianteResponse,
    unknown,
    UpdateProductoVarianteBody
  >({
    mutationFn: async (body) => {
      return api
        .put(`producto/${productoId}/variantes/${varianteId}`, {
          json: {
            talla_id: body.talla_id ?? undefined,
            color_id: body.color_id ?? undefined,
            sku: body.sku === undefined ? undefined : body.sku,
            precio: body.precio === undefined ? undefined : body.precio,
            stock: body.stock === undefined ? undefined : body.stock,
            activo: body.activo ?? undefined,
          },
        })
        .json<ProductoVarianteResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
