"use client";

import { useSyncExternalStore } from "react";

import { obtenerDispositivo } from "@/lib/dispositivo";

/**
 * Id de dispositivo para las llamadas anónimas (carrito, favoritos).
 *
 * Se lee con `useSyncExternalStore` porque el id vive en localStorage, que es
 * un almacén externo a React: eso da `null` durante el render del servidor y
 * el valor real en el cliente sin desajuste de hidratación, y sin el render
 * extra que provocaría resolverlo en un effect.
 *
 * El primer render del cliente ya devuelve `null` sólo si no hay id todavía;
 * las consultas que dependan de él deben quedar deshabilitadas hasta que
 * llegue.
 */

// El id no cambia mientras la pestaña vive, así que no hay nada que notificar.
const sinSuscripcion = () => () => {};

const leerEnCliente = (): string | null => obtenerDispositivo();

// En el servidor no hay localStorage: nunca se inventa un id, o cada petición
// crearía un carrito anónimo distinto.
const leerEnServidor = (): string | null => null;

export const useDispositivo = (): string | null =>
  useSyncExternalStore(sinSuscripcion, leerEnCliente, leerEnServidor);
