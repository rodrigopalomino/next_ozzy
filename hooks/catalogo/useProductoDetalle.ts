import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ApiItemResponse } from "@/types/ApiResponse";
import type {
  OrigenWhatsApp,
  ProductoDetalleSalida,
  WhatsAppSalida,
} from "@/types/producto-detalle";

/** `GET /catalogo/producto/:slug` — detalle completo, por slug (no por id). */
export const useProductoDetalle = (slug: string) =>
  useQuery<ApiItemResponse<ProductoDetalleSalida>>({
    queryKey: ["catalogo", "producto", slug],
    enabled: Boolean(slug),
    queryFn: () =>
      api
        .get(`catalogo/producto/${encodeURIComponent(slug)}`)
        .json<ApiItemResponse<ProductoDetalleSalida>>(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

type ArgsWhatsApp = {
  slug: string;
  /** `variante_id` de la talla elegida, dentro del color elegido. */
  variante_id?: number;
  origen?: OrigenWhatsApp;
  cupon?: string;
};

/**
 * `GET /catalogo/producto/:slug/whatsapp`.
 *
 * Es mutación, no query, por dos razones: registra el lead como efecto y sólo
 * debe dispararse por un clic explícito. Una query se refetchearía sola y
 * generaría leads fantasma.
 *
 * El back arma el mensaje y resuelve el número, así que el front sólo redirige
 * a `data.url`. Tampoco hay que llamar a `POST /lead`: duplicaría el lead.
 */
export const useWhatsApp = () =>
  useMutation<ApiItemResponse<WhatsAppSalida>, Error, ArgsWhatsApp>({
    mutationFn: ({ slug, variante_id, origen, cupon }) => {
      const searchParams = new URLSearchParams();
      if (variante_id) searchParams.set("variante_id", String(variante_id));
      if (origen) searchParams.set("origen", origen);
      if (cupon) searchParams.set("cupon", cupon);

      return api
        .get(`catalogo/producto/${encodeURIComponent(slug)}/whatsapp`, {
          searchParams,
          // El lead no es idempotente: un reintento automático de ky sería un
          // segundo registro. El dedupe del back cubre 5 min, pero no hay que
          // apoyarse en eso.
          retry: 0,
        })
        .json<ApiItemResponse<WhatsAppSalida>>();
    },
  });
