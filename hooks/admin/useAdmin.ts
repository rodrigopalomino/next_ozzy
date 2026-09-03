"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { buildQueryOptions, type QueryOptions } from "@/lib/query-options";
import type { ApiItemResponse, ApiListResponse } from "@/types/ApiResponse";
import type {
  ActualizarConfiguracionBody,
  AuditoriaSalida,
  CarritoAdminSalida,
  ConfiguracionEntrada,
  CuponAdmin,
  CuponBody,
  DestinatariosSalida,
  HuerfanasSalida,
} from "@/types/admin";

/* --------------------------------------------------------- configuración */

const CLAVE_CONFIG = ["admin", "configuracion"] as const;

/** `GET /admin/configuracion` — array de entradas con su descripción. */
export const useConfiguracionAdmin = () =>
  useQuery<ApiItemResponse<ConfiguracionEntrada[]>>({
    queryKey: CLAVE_CONFIG,
    queryFn: () =>
      api
        .get("admin/configuracion")
        .json<ApiItemResponse<ConfiguracionEntrada[]>>(),
  });

/**
 * `PATCH /admin/configuracion` — objeto parcial `{clave: valor}`.
 *
 * Una clave fuera de la whitelist responde 400 en vez de crearse, así que un
 * error de tecleo se ve en vez de guardarse como clave muerta.
 */
export const useActualizarConfiguracion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiItemResponse<unknown>,
    Error,
    ActualizarConfiguracionBody
  >({
    mutationFn: (body) =>
      api
        .patch("admin/configuracion", { json: body })
        .json<ApiItemResponse<unknown>>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_CONFIG });
      // La tienda pública lee las mismas claves: header y footer cambian.
      void queryClient.invalidateQueries({ queryKey: ["configuracion"] });
    },
  });
};

/* -------------------------------------------------------------- cupones */

const CLAVE_CUPONES = ["admin", "cupon"] as const;

/**
 * `GET /admin/cupon` — verificado en vivo: devuelve `meta: null`, no pagina.
 * Por eso se tipa como respuesta de item con un array dentro.
 */
export const useCupones = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("admin/cupon", options);

  return useQuery<ApiItemResponse<CuponAdmin[]>>({
    queryKey: [...CLAVE_CUPONES, ...queryKey],
    queryFn: () =>
      api
        .get("admin/cupon", { searchParams })
        .json<ApiItemResponse<CuponAdmin[]>>(),
  });
};

export const useCuponAcciones = () => {
  const queryClient = useQueryClient();
  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: CLAVE_CUPONES });
  };

  const crear = useMutation<ApiItemResponse<CuponAdmin>, Error, CuponBody>({
    mutationFn: (body) =>
      api
        .post("admin/cupon", { json: body })
        .json<ApiItemResponse<CuponAdmin>>(),
    onSuccess: invalidar,
  });

  const actualizar = useMutation<
    ApiItemResponse<CuponAdmin>,
    Error,
    { id: number; body: Partial<CuponBody> }
  >({
    mutationFn: ({ id, body }) =>
      api
        .patch(`admin/cupon/${id}`, { json: body })
        .json<ApiItemResponse<CuponAdmin>>(),
    onSuccess: invalidar,
  });

  const eliminar = useMutation<ApiItemResponse<unknown>, Error, number>({
    mutationFn: (id) =>
      api.delete(`admin/cupon/${id}`).json<ApiItemResponse<unknown>>(),
    onSuccess: invalidar,
  });

  return { crear, actualizar, eliminar };
};

/* ------------------------------------------------------------- auditoría */

export const useAuditoria = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("admin/auditoria", options);

  return useQuery<ApiListResponse<AuditoriaSalida>>({
    queryKey: ["admin", "auditoria", ...queryKey],
    queryFn: () =>
      api
        .get("admin/auditoria", { searchParams })
        .json<ApiListResponse<AuditoriaSalida>>(),
  });
};

/* ---------------------------------------------------------- mantenimiento */

/**
 * `GET /mantenimiento/huerfanas` — sólo lista, no borra.
 *
 * `staleTime: 0` a propósito: la confirmación de borrado muestra este recuento
 * y no debe venir de caché, o se confirmaría un número que ya cambió.
 */
export const useHuerfanas = (habilitado = false) =>
  useQuery<ApiItemResponse<HuerfanasSalida>>({
    queryKey: ["admin", "huerfanas"],
    enabled: habilitado,
    staleTime: 0,
    queryFn: () =>
      api
        .get("admin/mantenimiento/huerfanas")
        .json<ApiItemResponse<HuerfanasSalida>>(),
  });

/** `POST /mantenimiento/huerfanas` — **borra archivos de MinIO sin vuelta atrás**. */
export const useBorrarHuerfanas = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiItemResponse<unknown>, Error, void>({
    mutationFn: () =>
      api
        .post("admin/mantenimiento/huerfanas", { retry: 0 })
        .json<ApiItemResponse<unknown>>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "huerfanas"] });
    },
  });
};

/** `POST /mantenimiento/recalcular-precios` */
export const useRecalcularPrecios = () =>
  useMutation<ApiItemResponse<unknown>, Error, void>({
    mutationFn: () =>
      api
        .post("admin/mantenimiento/recalcular-precios", { retry: 0 })
        .json<ApiItemResponse<unknown>>(),
  });

/* --------------------------------------------------------- notificaciones */

/** `GET /admin/notificacion/destinatarios` — cuenta sin enviar nada. */
export const useDestinatarios = () =>
  useQuery<ApiItemResponse<DestinatariosSalida>>({
    queryKey: ["admin", "destinatarios"],
    staleTime: 0,
    queryFn: () =>
      api
        .get("admin/notificacion/destinatarios")
        .json<ApiItemResponse<DestinatariosSalida>>(),
  });

/** `GET /notificacion` — cola de correos. */
export const useNotificaciones = (options: QueryOptions = {}) => {
  const { searchParams, queryKey } = buildQueryOptions("admin/notificacion", options);

  return useQuery<ApiListResponse<Record<string, unknown>>>({
    queryKey: ["admin", "notificacion", ...queryKey],
    queryFn: () =>
      api
        .get("admin/notificacion", { searchParams })
        .json<ApiListResponse<Record<string, unknown>>>(),
  });
};

export const useNotificacionAcciones = () => {
  const queryClient = useQueryClient();
  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "notificacion"] });
  };

  /** Envía correo real: la UI confirma con el número de destinatarios. */
  const difundir = useMutation<ApiItemResponse<unknown>, Error, void>({
    mutationFn: () =>
      api
        .post("admin/notificacion/difundir", { retry: 0 })
        .json<ApiItemResponse<unknown>>(),
    onSuccess: invalidar,
  });

  const reintentar = useMutation<ApiItemResponse<unknown>, Error, number>({
    mutationFn: (id) =>
      api
        .post(`admin/notificacion/${id}/reintentar`, { retry: 0 })
        .json<ApiItemResponse<unknown>>(),
    onSuccess: invalidar,
  });

  const procesar = useMutation<ApiItemResponse<unknown>, Error, void>({
    mutationFn: () =>
      api
        .post("admin/notificacion/procesar", { retry: 0 })
        .json<ApiItemResponse<unknown>>(),
    onSuccess: invalidar,
  });

  return { difundir, reintentar, procesar };
};

/* ------------------------------------------------------- carritos admin */

/** `GET /admin/carrito` — abandonados, ordenados por `updatedAt desc`. */
export const useCarritosAdmin = (page = 1, limit = 20) =>
  useQuery<ApiListResponse<CarritoAdminSalida>>({
    queryKey: ["admin", "carrito", page, limit],
    queryFn: () =>
      api
        .get("admin/carrito", { searchParams: { page, limit } })
        .json<ApiListResponse<CarritoAdminSalida>>(),
  });
