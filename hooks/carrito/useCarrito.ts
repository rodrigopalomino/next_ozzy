"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDispositivo } from "@/hooks/useDispositivo";
import { api } from "@/lib/api";
import type { ApiItemResponse } from "@/types/ApiResponse";
import type { CarritoSalida, CarritoWhatsAppSalida } from "@/types/carrito";

const CLAVE_CARRITO = ["carrito"] as const;

/**
 * El `dispositivo` sólo hace falta sin sesión: con cookie de cliente el back
 * resuelve el carrito por sesión. Se manda siempre que exista porque el back
 * prioriza la sesión cuando hay ambas.
 */
const conDispositivo = (dispositivo: string | null) => {
  const params = new URLSearchParams();
  if (dispositivo) params.set("dispositivo", dispositivo);
  return params;
};

/** `GET /carrito` */
export const useCarrito = () => {
  const dispositivo = useDispositivo();

  return useQuery<ApiItemResponse<CarritoSalida>>({
    queryKey: [...CLAVE_CARRITO, dispositivo],
    // Sin dispositivo resuelto todavía no se consulta: evita crear un carrito
    // anónimo distinto en el primer render.
    enabled: dispositivo !== null,
    queryFn: () =>
      api
        .get("carrito", { searchParams: conDispositivo(dispositivo) })
        .json<ApiItemResponse<CarritoSalida>>(),
    staleTime: 0,
  });
};

/**
 * Mutaciones del carrito. Todas invalidan el carrito al terminar en vez de
 * parchear la caché: el total, el `agotado` y el `disponible` los recalcula el
 * servidor, así que adivinarlos aquí sería mostrar cifras inventadas.
 */
export const useCarritoAcciones = () => {
  const dispositivo = useDispositivo();
  const queryClient = useQueryClient();

  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: CLAVE_CARRITO });
  };

  const agregar = useMutation({
    mutationFn: (args: { variante_id: number; cantidad: number }) =>
      api
        .post("carrito/items", {
          json: { ...args, ...(dispositivo ? { dispositivo } : {}) },
        })
        .json<ApiItemResponse<CarritoSalida>>(),
    onSuccess: invalidar,
  });

  const cambiarCantidad = useMutation({
    mutationFn: (args: { variante_id: number; cantidad: number }) =>
      api
        .patch(`carrito/items/${args.variante_id}`, {
          json: {
            cantidad: args.cantidad,
            ...(dispositivo ? { dispositivo } : {}),
          },
        })
        .json<ApiItemResponse<CarritoSalida>>(),
    onSuccess: invalidar,
  });

  const quitar = useMutation({
    mutationFn: (variante_id: number) =>
      api
        .delete(`carrito/items/${variante_id}`, {
          searchParams: conDispositivo(dispositivo),
        })
        .json<ApiItemResponse<CarritoSalida>>(),
    onSuccess: invalidar,
  });

  const vaciar = useMutation({
    mutationFn: () =>
      api
        .delete("carrito", { searchParams: conDispositivo(dispositivo) })
        .json<ApiItemResponse<CarritoSalida>>(),
    onSuccess: invalidar,
  });

  return { agregar, cambiarCantidad, quitar, vaciar };
};

/**
 * `GET /carrito/whatsapp` — mutación, no query: se dispara por un clic y el
 * back registra el cierre. `retry: 0` por el mismo motivo que el botón
 * individual: un reintento automático duplicaría el registro.
 */
export const useCarritoWhatsApp = () => {
  const dispositivo = useDispositivo();

  return useMutation<ApiItemResponse<CarritoWhatsAppSalida>, Error, void>({
    mutationFn: () =>
      api
        .get("carrito/whatsapp", {
          searchParams: conDispositivo(dispositivo),
          retry: 0,
        })
        .json<ApiItemResponse<CarritoWhatsAppSalida>>(),
  });
};
