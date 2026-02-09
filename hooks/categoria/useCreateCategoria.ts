"use client";

import { api } from "@/lib/api";
import type { Categoria } from "@/types/Categoria";
import type { CreatedResponse } from "@/types/PaginatedResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateCategoriaBody = {
  nombre: string;
  slug: string;
};

export const useCreateCategoria = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoriaBody) => {
      const res = await api
        .post("categoria", { json: payload })
        .json<CreatedResponse<Categoria>>();

      if (res.status !== "created") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categoria"] });
    },
  });
};
