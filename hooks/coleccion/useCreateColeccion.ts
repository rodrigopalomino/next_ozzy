"use client";

import { api } from "@/lib/api";
import { Coleccion } from "@/types/Coleccion";
import type { CreatedResponse } from "@/types/PaginatedResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateColeccionBody = {
  nombre: string;
  slug: string;

  descripcion?: string | null;
  imagenPortada?: string | null;

  // en front normalmente mandas ISO string
  iniciaEn?: string | null;
  terminaEn?: string | null;

  // opcional porque en DB default(true)
  activo?: boolean;
};

export const useCreateColeccion = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateColeccionBody) => {
      const res = await api
        .post("coleccion", { json: payload })
        .json<CreatedResponse<Coleccion>>();

      if (res.status !== "created") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coleccion"] });
    },
  });
};
