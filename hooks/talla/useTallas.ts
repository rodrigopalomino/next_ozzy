// src/hooks/useCategorias.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Talla } from "@/types/Talla";

export function useTallas() {
  return useQuery({
    queryKey: ["tallas"],
    queryFn: async () => {
      return api.get("talla").json<Talla[]>();
    },
    staleTime: 1000 * 60 * 5,
  });
}
