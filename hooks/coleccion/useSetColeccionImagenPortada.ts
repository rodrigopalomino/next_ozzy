"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type SetColeccionImagenPortadaBody = {
  url: string;
};

export function useSetColeccionImagenPortada(coleccionId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: SetColeccionImagenPortadaBody) => {
      return api
        .patch(`coleccion/${coleccionId}/imagen`, { json: body })
        .json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["coleccion"] });
    },
  });
}
