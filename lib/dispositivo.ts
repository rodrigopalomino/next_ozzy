"use client";

/**
 * Id de dispositivo para carrito y favoritos sin cuenta.
 *
 * El back persiste en BD lo que se guarda con este id (no es un almacén local:
 * las rutas llevan `ClienteOpcionalGuard` y aceptan `dispositivo` sin sesión),
 * y al entrar con Google adopta y fusiona lo que hubiera. Por eso el id vive
 * en localStorage y se manda en todas las llamadas anónimas.
 *
 * El back lo valida con `/^[a-zA-Z0-9-]{8,64}$/`, forma que cumple un
 * `crypto.randomUUID()`.
 */

const CLAVE = "ozzy.dispositivo";
const FORMATO = /^[a-zA-Z0-9-]{8,64}$/;

const generar = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  // Navegadores sin `randomUUID` (o contextos no seguros): 32 hex, que sigue
  // cumpliendo la regex del back.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Devuelve el id del dispositivo, creándolo la primera vez.
 *
 * En el servidor devuelve `null`: no hay localStorage y no debe inventarse uno
 * por render, o cada petición del servidor crearía un carrito distinto.
 */
export const obtenerDispositivo = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const guardado = window.localStorage.getItem(CLAVE);
    if (guardado && FORMATO.test(guardado)) return guardado;

    const nuevo = generar();
    window.localStorage.setItem(CLAVE, nuevo);
    return nuevo;
  } catch {
    // Modo privado o almacenamiento bloqueado: el carrito funciona en memoria
    // durante la sesión, sin persistir entre recargas.
    return null;
  }
};
