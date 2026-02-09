"use client";

import { api } from "@/lib/api";
import { Coleccion } from "@/types/Coleccion";
import type { UpdatedResponse } from "@/types/PaginatedResponse"; // donde lo tengas
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateColeccionBody = Partial<
  Pick<
    Coleccion,
    | "nombre"
    | "slug"
    | "descripcion"
    | "imagenPortada"
    | "iniciaEn"
    | "terminaEn"
    | "activo"
  >
>;

export const useUpdateColeccion = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: number;
      payload: UpdateColeccionBody;
    }) => {
      const res = await api
        .patch(`coleccion/${params.id}`, { json: params.payload })
        .json<UpdatedResponse<Coleccion>>();

      if (res.status !== "updated") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coleccion"] });
    },
  });
};
