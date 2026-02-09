"use client";

import { api } from "@/lib/api";
import type { Color } from "@/types/Color";
import type { CreatedResponse } from "@/types/PaginatedResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateColorBody = {
  nombre: string;
  hex?: string | null;

  // opcional porque en DB default(true)
  activo?: boolean;
};

export const useCreateColor = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateColorBody) => {
      const res = await api
        .post("color", { json: payload })
        .json<CreatedResponse<Color>>();

      if (res.status !== "created") throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["color"] });
    },
  });
};
