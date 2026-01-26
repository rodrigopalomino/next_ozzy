// src/hooks/useCategorias.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Coleccion } from "@/types/Coleccion";

export function useColecciones() {
  return useQuery({
    queryKey: ["colecciones"],
    queryFn: async () => {
      return api.get("coleccion").json<Coleccion[]>();
    },
    staleTime: 1000 * 60 * 5,
  });
}
