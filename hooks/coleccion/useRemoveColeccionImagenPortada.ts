"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveColeccionImagenPortada(coleccionId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.patch(`coleccion/${coleccionId}/imagen/remove`).json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["coleccion"] });
    },
  });
}
