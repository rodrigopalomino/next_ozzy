import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { QueryOptions, buildQueryOptions } from "@/lib/query-options";
import { DataResponse } from "@/types/PaginatedResponse";
import { Producto } from "@/types/Producto";

export const useProducto = (
  producto_id: number,
  options: QueryOptions = {},
) => {
  const { searchParams } = buildQueryOptions("turno", options);

  return useQuery<DataResponse<Producto>>({
    queryKey: ["producto", producto_id, searchParams.toString()],
    enabled: !!producto_id,
    queryFn: async () => {
      return api
        .get(`producto/${producto_id}`, { searchParams })
        .json<DataResponse<Producto>>();
    },
  });
};
