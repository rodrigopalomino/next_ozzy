// src/hooks/useProductos.ts
"use client";

import { api } from "@/lib/api";
import { Producto } from "@/types/producto";
import { useQuery } from "@tanstack/react-query";

export type ProductosResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Producto[];
};

type Params = {
  q?: string;
  estado?: string;
  page?: number;
  limit?: number;
};

export const useProductos = (params?: Params) => {
  return useQuery({
    queryKey: ["productos", params],
    queryFn: async () =>
      api
        .get("producto", {
          searchParams: {
            ...(params?.q ? { q: params.q } : {}),
            ...(params?.estado ? { estado: params.estado } : {}),
            ...(params?.page ? { page: String(params.page) } : {}),
            ...(params?.limit ? { limit: String(params.limit) } : {}),
          },
        })
        .json<ProductosResponse>(),
  });
};
