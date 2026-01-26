// src/hooks/useCategorias.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Insignia } from "@/types/Insignia";

export function useInsignias() {
  return useQuery({
    queryKey: ["insignias"],
    queryFn: async () => {
      return api.get("insignias").json<Insignia[]>();
    },
    staleTime: 1000 * 60 * 5,
  });
}
