import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { PaginatedResponse } from "@/types/PaginatedResponse";
import { Talla } from "@/types/Talla";

export const useTallas = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("talla", options);

  return useQuery<PaginatedResponse<Talla>>({
    queryKey,
    queryFn: async () => {
      return api
        .get("talla", { searchParams })
        .json<PaginatedResponse<Talla>>();
    },
  });
};
