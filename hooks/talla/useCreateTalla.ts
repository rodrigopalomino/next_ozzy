"use client";

import { api } from "@/lib/api";
import type { Talla } from "@/types/Talla";
import type { CreatedResponse } from "@/types/PaginatedResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateTallaBody = {
  etiqueta: string; // S, M, L...

  // opcional porque en DB default(true)
  activo?: boolean;
};

export const useCreateTalla = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTallaBody) => {
      const res = await api
        .post("talla", { json: payload })
        .json<CreatedResponse<Talla>>();

      if (res.status !== "created") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talla"] });
    },
  });
};
