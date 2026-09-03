"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDispositivo } from "@/hooks/useDispositivo";
import { api } from "@/lib/api";
import type { ApiItemResponse } from "@/types/ApiResponse";
import type {
  ConfiguracionSalida,
  FacetasSalida,
  FavoritosSalida,
  GuiaTallasSalida,
  ValidacionCupon,
} from "@/types/tienda";

/**
 * `GET /catalogo/facetas` — filtros con conteos.
 *
 * Los conteos son globales (no reflejan los filtros aplicados) y el back los
 * cachea 5 min, así que esto se pide una vez y no se repite en cada cambio de
 * filtro: sería una llamada desperdiciada.
 */
export const useFacetas = () =>
  useQuery<ApiItemResponse<FacetasSalida>>({
    queryKey: ["catalogo", "facetas"],
    queryFn: () => api.get("catalogo/facetas").json<ApiItemResponse<FacetasSalida>>(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

/** `GET /configuracion` — ajustes públicos de la tienda. */
export const useConfiguracion = () =>
  useQuery<ApiItemResponse<ConfiguracionSalida>>({
    queryKey: ["configuracion"],
    queryFn: () =>
      api.get("configuracion").json<ApiItemResponse<ConfiguracionSalida>>(),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

/**
 * `GET /catalogo/producto/:slug/guia-tallas` — `data` es `null` cuando el
 * producto no tiene guía (responde 200, no 404).
 */
export const useGuiaTallas = (slug: string, habilitado = true) =>
  useQuery<ApiItemResponse<GuiaTallasSalida | null>>({
    queryKey: ["catalogo", "guia-tallas", slug],
    enabled: Boolean(slug) && habilitado,
    queryFn: () =>
      api
        .get(`catalogo/producto/${encodeURIComponent(slug)}/guia-tallas`)
        .json<ApiItemResponse<GuiaTallasSalida | null>>(),
    staleTime: 10 * 60_000,
  });

/** `GET /cliente/favoritos` — no pagina. */
export const useFavoritos = () => {
  const dispositivo = useDispositivo();

  return useQuery<ApiItemResponse<FavoritosSalida>>({
    queryKey: ["favoritos", dispositivo],
    enabled: dispositivo !== null,
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (dispositivo) searchParams.set("dispositivo", dispositivo);

      return api
        .get("cliente/favoritos", { searchParams })
        .json<ApiItemResponse<FavoritosSalida>>();
    },
  });
};

/**
 * Alta y baja de favoritos.
 *
 * Los favoritos anónimos se persisten en BD contra el `dispositivo` (no en
 * localStorage), y al entrar con Google el back los adopta.
 */
export const useFavoritosAcciones = () => {
  const dispositivo = useDispositivo();
  const queryClient = useQueryClient();

  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: ["favoritos"] });
  };

  const agregar = useMutation({
    // `producto_id`, con guion bajo, como espera el back.
    mutationFn: (producto_id: number) =>
      api
        .post("cliente/favoritos", {
          json: { producto_id, ...(dispositivo ? { dispositivo } : {}) },
        })
        .json<ApiItemResponse<{ id: number; createdAt?: string }>>(),
    onSuccess: invalidar,
  });

  const quitar = useMutation({
    mutationFn: (producto_id: number) => {
      const searchParams = new URLSearchParams();
      if (dispositivo) searchParams.set("dispositivo", dispositivo);

      return api
        .delete(`cliente/favoritos/${producto_id}`, { searchParams })
        .json<ApiItemResponse<unknown>>();
    },
    onSuccess: invalidar,
  });

  return { agregar, quitar };
};

/**
 * `GET /cupon/:codigo/validar` — valida sin consumir.
 *
 * Responde 200 siempre, con `valido: false` para un código malo, así que una
 * excepción aquí ya es red o servidor y hay que distinguirla en la UI.
 */
export const useValidarCupon = () =>
  useMutation<ApiItemResponse<ValidacionCupon>, Error, string>({
    mutationFn: (codigo) =>
      api
        .get(`cupon/${encodeURIComponent(codigo)}/validar`)
        .json<ApiItemResponse<ValidacionCupon>>(),
  });
