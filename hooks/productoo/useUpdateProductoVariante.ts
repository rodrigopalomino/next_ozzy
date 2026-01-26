// src/hooks/productoo/useUpdateProductoVariante.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateProductoVarianteBody = {
  tallaId?: string;
  colorId?: string;
  sku?: string | null;
  precio?: number | null;
  stock?: number | null;
  activo?: boolean;
};

export type ProductoVarianteResponse = {
  id: string;
  productoId: string;
  tallaId: string;
  colorId: string;
  sku: string | null;
  precio: number | null;
  stock: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  talla?: { id: string; etiqueta: string } | null;
  color?: { id: string; nombre: string } | null;
};

export function useUpdateProductoVariante(
  productoId: string,
  varianteId: string,
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
            tallaId: body.tallaId ?? undefined,
            colorId: body.colorId ?? undefined,
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
