"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { buildQueryOptions, type QueryOptions } from "@/lib/query-options";
import type { ApiItemResponse, ApiListResponse } from "@/types/ApiResponse";
import type {
  ActualizarLeadBody,
  ConversionSalida,
  EmbudoLeadSalida,
  LeadSalida,
  MetricasLeadSalida,
} from "@/types/admin";

const CLAVE_LEADS = ["admin", "lead"] as const;

/** `GET /lead` — paginado, ordenado por `createdAt desc`. */
export const useLeads = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("lead", options);

  return useQuery<ApiListResponse<LeadSalida>>({
    queryKey: [...CLAVE_LEADS, ...queryKey],
    queryFn: () =>
      api.get("lead", { searchParams }).json<ApiListResponse<LeadSalida>>(),
  });
};

/** `GET /lead/:id` */
export const useLead = (id: number) =>
  useQuery<ApiItemResponse<LeadSalida>>({
    queryKey: [...CLAVE_LEADS, id],
    enabled: id > 0,
    queryFn: () => api.get(`lead/${id}`).json<ApiItemResponse<LeadSalida>>(),
  });

/**
 * `PATCH /lead/:id`
 *
 * Pasar a `VENDIDO` consume el cupón del lead en el servidor, así que las
 * métricas y el listado se invalidan juntos.
 */
export const useActualizarLead = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiItemResponse<LeadSalida>,
    Error,
    { id: number; body: ActualizarLeadBody }
  >({
    mutationFn: ({ id, body }) =>
      api.patch(`lead/${id}`, { json: body }).json<ApiItemResponse<LeadSalida>>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_LEADS });
    },
  });
};

/** `GET /lead/metricas?dias=` — ventana de 1 a 365 días. */
export const useMetricasLead = (dias = 30) =>
  useQuery<ApiItemResponse<MetricasLeadSalida>>({
    queryKey: [...CLAVE_LEADS, "metricas", dias],
    queryFn: () =>
      api
        .get("lead/metricas", { searchParams: { dias } })
        .json<ApiItemResponse<MetricasLeadSalida>>(),
  });

/** `GET /lead/embudo?dias=` */
export const useEmbudoLead = (dias = 30) =>
  useQuery<ApiItemResponse<EmbudoLeadSalida>>({
    queryKey: [...CLAVE_LEADS, "embudo", dias],
    queryFn: () =>
      api
        .get("lead/embudo", { searchParams: { dias } })
        .json<ApiItemResponse<EmbudoLeadSalida>>(),
  });

/** `GET /lead/conversion?limite=` — por producto. */
export const useConversion = (limite = 20) =>
  useQuery<ApiItemResponse<ConversionSalida>>({
    queryKey: [...CLAVE_LEADS, "conversion", limite],
    queryFn: () =>
      api
        .get("lead/conversion", { searchParams: { limite } })
        .json<ApiItemResponse<ConversionSalida>>(),
  });
