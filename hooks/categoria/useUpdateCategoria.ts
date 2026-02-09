"use client";

import { api } from "@/lib/api";
import type { Categoria } from "@/types/Categoria";
import type { UpdatedResponse } from "@/types/PaginatedResponse"; // donde lo tengas
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateCategoriaBody = Partial<
  Pick<Categoria, "nombre" | "slug" | "activo">
>;

export const useUpdateCategoria = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: number;
      payload: UpdateCategoriaBody;
    }) => {
      const res = await api
        .patch(`categoria/${params.id}`, { json: params.payload })
        .json<UpdatedResponse<Categoria>>();

      if (res.status !== "updated") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categoria"] });
    },
  });
};
