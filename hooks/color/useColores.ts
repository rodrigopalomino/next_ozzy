// src/hooks/useCategorias.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Color } from "@/types/Color";

export function useColores() {
  return useQuery({
    queryKey: ["colores"],
    queryFn: async () => {
      return api.get("color").json<Color[]>();
    },
    staleTime: 1000 * 60 * 5,
  });
}
