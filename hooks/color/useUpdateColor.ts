"use client";

import { api } from "@/lib/api";
import type { Color } from "@/types/Color";
import type { UpdatedResponse } from "@/types/PaginatedResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateColorBody = Partial<Pick<Color, "nombre" | "hex" | "activo">>;

export const useUpdateColor = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; payload: UpdateColorBody }) => {
      const res = await api
        .patch(`color/${params.id}`, { json: params.payload })
        .json<UpdatedResponse<Color>>();

      if (res.status !== "updated") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["color"] });
    },
  });
};
