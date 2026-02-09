import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { PaginatedResponse } from "@/types/PaginatedResponse";
import { Coleccion } from "@/types/Coleccion";

export const useColecciones = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("coleccion", options);

  return useQuery<PaginatedResponse<Coleccion>>({
    queryKey,
    queryFn: async () => {
      return api
        .get("coleccion", { searchParams })
        .json<PaginatedResponse<Coleccion>>();
    },
  });
};
