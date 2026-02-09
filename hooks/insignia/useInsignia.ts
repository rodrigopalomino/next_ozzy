import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { PaginatedResponse } from "@/types/PaginatedResponse";
import { Insignia } from "@/types/Insignia";

export const useInsignias = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("insignia", options);

  return useQuery<PaginatedResponse<Insignia>>({
    queryKey,
    queryFn: async () => {
      return api
        .get("insignia", { searchParams })
        .json<PaginatedResponse<Insignia>>();
    },
  });
};
