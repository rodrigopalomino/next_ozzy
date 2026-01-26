// src/hooks/useProducto.ts
"use client";

import { api } from "@/lib/api";
import { Producto } from "@/types/Producto";
import { useQuery } from "@tanstack/react-query";

export function useProducto(id?: string) {
  return useQuery({
    queryKey: ["producto", id],
    enabled: !!id,
    queryFn: async () => api.get(`producto/${id}`).json<Producto>(),
  });
}
