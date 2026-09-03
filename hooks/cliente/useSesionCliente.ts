"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { useDispositivo } from "@/hooks/useDispositivo";
import { api } from "@/lib/api";
import type { ApiItemResponse } from "@/types/ApiResponse";
import type {
  ActualizarClienteBody,
  AvisoStockBody,
  Cliente,
  SesionGoogleSalida,
} from "@/types/cliente";

/**
 * Sesión de cliente de la tienda.
 *
 * Deliberadamente separada del store del panel (`store/auth-store.ts`): son
 * dos mundos distintos y dos cookies distintas. La puerta del admin la guarda
 * el back, pero con estados separados un bug del front no puede ni plantear
 * la pregunta.
 *
 * Tampoco se persiste el cliente en localStorage: la cookie es httpOnly, así
 * que el front no la lee y la única forma honesta de saber si hay sesión es
 * preguntar por `GET /cliente/me`.
 */

const CLAVE_SESION = ["cliente", "me"] as const;

/**
 * `GET /cliente/me` — `null` si no hay sesión.
 *
 * Un 401 aquí es la respuesta esperada de un visitante anónimo, no un fallo:
 * se traduce a `null` en vez de dejar la consulta en estado de error.
 */
export const useClienteActual = () =>
  useQuery<Cliente | null>({
    queryKey: CLAVE_SESION,
    queryFn: async () => {
      try {
        const respuesta = await api
          .get("cliente/me")
          .json<ApiItemResponse<Cliente>>();
        return respuesta.data;
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 401) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

/**
 * `POST /cliente/auth/google`.
 *
 * El `idToken` es el de Google Identity Services y lo verifica el back. Se
 * manda el `dispositivo` para que adopte los favoritos y el carrito guardados
 * sin cuenta.
 */
export const useLoginGoogle = () => {
  const dispositivo = useDispositivo();
  const queryClient = useQueryClient();

  return useMutation<ApiItemResponse<SesionGoogleSalida>, Error, string>({
    mutationFn: (idToken) =>
      api
        .post("cliente/auth/google", {
          json: { idToken, ...(dispositivo ? { dispositivo } : {}) },
          // El login no es idempotente: sin esto un reintento de ky podría
          // reenviar el idToken ya consumido.
          retry: 0,
        })
        .json<ApiItemResponse<SesionGoogleSalida>>(),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(CLAVE_SESION, data.cliente);
      // El back acaba de adoptar lo anónimo: ambas listas cambiaron.
      void queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      void queryClient.invalidateQueries({ queryKey: ["carrito"] });
    },
  });
};

/** `POST /cliente/auth/logout` */
export const useLogoutCliente = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post("cliente/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(CLAVE_SESION, null);
      // Al cerrar sesión el carrito y los favoritos vuelven a resolverse por
      // `dispositivo`, así que ya no son los mismos.
      void queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      void queryClient.invalidateQueries({ queryKey: ["carrito"] });
    },
  });
};

/** `PATCH /cliente/me` */
export const useActualizarCliente = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiItemResponse<Cliente>, Error, ActualizarClienteBody>({
    mutationFn: (body) =>
      api.patch("cliente/me", { json: body }).json<ApiItemResponse<Cliente>>(),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(CLAVE_SESION, data);
    },
  });
};

/**
 * `POST /cliente/avisos-stock` — alta de aviso cuando una variante vuelva a
 * tener stock.
 *
 * La respuesta no trae el token de baja: viaja sólo en el email. Por eso el
 * front no puede ofrecer "cancelar" desde aquí, y no debe intentarlo.
 */
export const useAvisoStock = () =>
  useMutation<ApiItemResponse<{ id: number }>, Error, AvisoStockBody>({
    mutationFn: (body) =>
      api
        .post("cliente/avisos-stock", { json: body })
        .json<ApiItemResponse<{ id: number }>>(),
  });
