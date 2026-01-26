// src/hooks/useCategorias.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Categoria } from "@/types/Categoria";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      return api.get("categoria").json<Categoria[]>();
    },
    staleTime: 1000 * 60 * 5,
  });
}
