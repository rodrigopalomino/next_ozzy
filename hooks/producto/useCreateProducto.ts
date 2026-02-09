// src/hooks/useCreateProducto.ts
"use client";

import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export type EstadoProducto = "ACTIVO" | "OCULTO" | "ARCHIVADO";

export type CreateProductoBody = {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  estado?: EstadoProducto;
  precioBase?: number | null;
};

export type CreateProductoResponse = {
  id: string;
  nombre: string;
  slug: string;
  estado: EstadoProducto;
  createdAt: string;
};

export function useCreateProducto() {
  return useMutation<CreateProductoResponse, unknown, CreateProductoBody>({
    mutationFn: async (body) => {
      return api
        .post("producto", {
          json: {
            nombre: body.nombre.trim(),
            slug: body.slug.trim(),
            descripcion: body.descripcion?.trim()
              ? body.descripcion.trim()
              : null,
            estado: body.estado ?? "ACTIVO",
            precioBase: body.precioBase ?? null,
          },
        })
        .json<CreateProductoResponse>();
    },
  });
}
