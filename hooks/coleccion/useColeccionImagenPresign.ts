"use client";

import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export type ColeccionPresignBody = {
  coleccionId: number;
  filename: string;
  contentType: string;
};

export type ColeccionPresignResponse = {
  uploadUrl: string;
  url: string;
  objectKey: string;
};

export function useColeccionImagenPresign() {
  return useMutation({
    mutationFn: async (body: ColeccionPresignBody) => {
      return api
        .post(`admin/coleccion/${body.coleccionId}/imagen/presign`, {
          json: { filename: body.filename, contentType: body.contentType },
        })
        .json<ColeccionPresignResponse>();
    },
  });
}
