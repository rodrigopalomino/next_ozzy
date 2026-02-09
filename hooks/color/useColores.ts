import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { PaginatedResponse } from "@/types/PaginatedResponse";
import { Color } from "@/types/Color";

export const useColores = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("color", options);

  return useQuery<PaginatedResponse<Color>>({
    queryKey,
    queryFn: async () => {
      return api
        .get("color", { searchParams })
        .json<PaginatedResponse<Color>>();
    },
  });
};
