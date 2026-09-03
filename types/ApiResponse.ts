/**
 * Contrato de respuesta unificado de nest_ozzy.
 *
 * TODA respuesta del API (admin y público) tiene esta forma. `meta` lleva la
 * paginación en los listados y es `null` en el resto.
 */

export type ResponseStatus = "success" | "created" | "updated" | "deleted";

export interface ResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: ResponseStatus;
  message: string;
  data: T;
  meta: (ResponseMeta & Record<string, unknown>) | null;
}

/** Listado paginado: `meta` siempre presente. */
export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta & Record<string, unknown>;
}

/** Respuesta sin paginación: `meta` siempre `null`. */
export interface ApiItemResponse<T> extends ApiResponse<T> {
  meta: null;
}

/**
 * Los fallos NO llegan como `status: 'error'`: viajan por status HTTP y los
 * captura el filtro de excepciones del back. Con ky eso significa que un 400
 * lanza `HTTPError` y nunca se resuelve a un `ApiResponse`.
 */
export const isPaginated = <T>(
  response: ApiResponse<T[]>,
): response is ApiListResponse<T> => response.meta !== null;
