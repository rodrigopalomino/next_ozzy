"use client";

import { api } from "@/lib/api";
import type { Talla } from "@/types/Talla";
import type { UpdatedResponse } from "@/types/PaginatedResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateTallaBody = Partial<Pick<Talla, "etiqueta" | "activo">>;

export const useUpdateTalla = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; payload: UpdateTallaBody }) => {
      const res = await api
        .patch(`talla/${params.id}`, { json: params.payload })
        .json<UpdatedResponse<Talla>>();

      if (res.status !== "updated") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talla"] });
    },
  });
};
