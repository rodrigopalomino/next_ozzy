// src/hooks/productoo/useDeleteProductoVideo.ts
"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type DeleteProductoVideoResponse = {
  productoId: string;
  videoId: string;
  deleted: true;
};

export function useDeleteProductoVideo(productoId: string, videoId: string) {
  const qc = useQueryClient();

  return useMutation<DeleteProductoVideoResponse>({
    mutationFn: async () => {
      return api
        .delete(`producto/${productoId}/videos/${videoId}`)
        .json<DeleteProductoVideoResponse>();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["producto", productoId] });
    },
  });
}
