// src/hooks/useUpsertProductoPrecio.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpsertProductoPrecioBody = {
  precioOriginal: number;
  porcentajeDescuento?: number;
  precioOferta?: number | null;
  iniciaEn?: string | null;
  terminaEn?: string | null;
  activo?: boolean;
};

export type UpsertProductoPrecioResponse = {
  productoId: string;
  precioOriginal: number;
  porcentajeDescuento: number;
  precioOferta: number | null;
  iniciaEn: string | null;
  terminaEn: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useUpsertProductoPrecio(productoId: string) {
  const qc = useQueryClient();

  return useMutation<
    UpsertProductoPrecioResponse,
    unknown,
    UpsertProductoPrecioBody
  >({
    mutationFn: async (body) => {
      return api
        .put(`producto/${productoId}/precio`, {
          json: {
            precioOriginal: body.precioOriginal,
            porcentajeDescuento: body.porcentajeDescuento ?? 0,
            precioOferta: body.precioOferta ?? null,
            iniciaEn: body.iniciaEn ?? null,
            terminaEn: body.terminaEn ?? null,
            activo: body.activo ?? true,
          },
        })
        .json<UpsertProductoPrecioResponse>();
    },
    onSuccess: () => {
      // refresca el producto completo
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
