import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { PaginatedResponse } from "@/types/PaginatedResponse";
import { Categoria } from "@/types/Categoria";

export const useCategorias = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("categoria", options);

  return useQuery<PaginatedResponse<Categoria>>({
    queryKey,
    queryFn: async () => {
      return api
        .get("categoria", { searchParams })
        .json<PaginatedResponse<Categoria>>();
    },
  });
};
