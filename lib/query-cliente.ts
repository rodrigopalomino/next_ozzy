import { QueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

/**
 * Cliente de react-query.
 *
 * Los reintentos se limitan a uno porque ky ya reintenta por su cuenta: con
 * los tres de react-query por defecto, una sola consulta fallida acababa
 * generando hasta doce peticiones y llenando la consola de ruido cuando el
 * API está reiniciándose.
 */
export const queryCliente = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (contador, error) => {
        // Un 4xx no mejora reintentando: falta sesión, el filtro no está en
        // la whitelist o el recurso no existe.
        if (error instanceof HTTPError) {
          const status = error.response.status;
          if (status >= 400 && status < 500) return false;
        }
        return contador < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Una mutación repetida puede duplicar un lead o un envío de correo.
      retry: false,
    },
  },
});
