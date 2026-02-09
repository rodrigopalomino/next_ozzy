import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { PaginatedResponse } from "@/types/PaginatedResponse";
import { Producto } from "@/types/Producto";

export const useProductos = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("producto", options);

  return useQuery<PaginatedResponse<Producto>>({
    queryKey,
    queryFn: async () => {
      return api
        .get("producto", { searchParams })
        .json<PaginatedResponse<Producto>>();
    },
  });
};
