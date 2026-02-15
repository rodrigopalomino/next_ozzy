"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type SetColeccionImagenBody = {
  coleccionId: number;
  url: string;
};

export function useSetColeccionImagen() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: SetColeccionImagenBody) => {
      return api
        .patch(`admin/coleccion/${body.coleccionId}/imagen`, {
          json: { url: body.url },
        })
        .json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["coleccion"] });
    },
  });
}
