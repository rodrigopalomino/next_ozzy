import type { ApiItemResponse } from "@/types/ApiResponse";

/**
 * Fetch del catálogo público desde el servidor (server components,
 * `generateMetadata`, `sitemap.ts`).
 *
 * No usa la instancia de ky de `lib/api.ts` a propósito: esa manda
 * `credentials: "include"` y vive en el navegador. Aquí se usa el `fetch` de
 * Next para aprovechar su caché, alineada con el `Cache-Control` +
 * `stale-while-revalidate` que ya manda el back.
 */

const baseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL no está definida: el catálogo no puede resolverse en el servidor.",
    );
  }
  return url.replace(/\/+$/, "");
};

export class ErrorApi extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

/**
 * Devuelve `null` en 404 para que la página pueda llamar a `notFound()`, y
 * lanza en el resto de los fallos.
 *
 * `revalidate` por defecto en 60 s: el back manda ETag y responde 304, así
 * que revalidar es barato.
 */
export const obtenerDelCatalogo = async <T>(
  ruta: string,
  opciones: { revalidate?: number } = {},
): Promise<ApiItemResponse<T> | null> => {
  const respuesta = await fetch(`${baseUrl()}/${ruta.replace(/^\/+/, "")}`, {
    next: { revalidate: opciones.revalidate ?? 60 },
  });

  if (respuesta.status === 404) return null;

  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      `El catálogo respondió ${respuesta.status} en /${ruta}`,
    );
  }

  return (await respuesta.json()) as ApiItemResponse<T>;
};
