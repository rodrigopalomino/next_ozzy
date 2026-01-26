// src/hooks/productoo/useCreateProductoVariante.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateProductoVarianteBody = {
  tallaId: string;
  colorId: string;
  sku?: string;
  precio?: number;
  stock?: number;
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

export function useCreateProductoVariante(productoId: string) {
  const qc = useQueryClient();

  return useMutation<
    ProductoVarianteResponse,
    unknown,
    CreateProductoVarianteBody
  >({
    mutationFn: async (body) => {
      return api
        .post(`producto/${productoId}/variantes`, {
          json: {
            tallaId: body.tallaId,
            colorId: body.colorId,
            sku: body.sku ?? undefined,
            precio: body.precio ?? undefined,
            stock: body.stock ?? undefined,
            activo: body.activo ?? true,
          },
        })
        .json<ProductoVarianteResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
