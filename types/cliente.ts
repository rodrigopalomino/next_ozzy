import type { ISODateString } from "./helpers-enums";

/**
 * Cliente de la tienda. Cuenta separada del panel: las cuentas de Google son
 * de clientes y viven en su propia tabla, y una cuenta de cliente nunca da
 * acceso al admin.
 */
export interface Cliente {
  id: number;
  email: string;
  nombre: string | null;
  avatar: string | null;
  telefono: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * `POST /cliente/auth/google`.
 *
 * Mandando el `dispositivo` de las llamadas anónimas, el back adopta favoritos
 * y carrito guardados sin cuenta en la misma llamada.
 */
export interface SesionGoogleSalida {
  cliente: Cliente;
  esNuevo: boolean;
  favoritosAdoptados: number;
  /** Líneas de carrito adoptadas más las fusionadas. */
  carritoAdoptado: number;
}

/** Cuerpo de `PATCH /cliente/me`. */
export interface ActualizarClienteBody {
  nombre?: string;
  telefono?: string;
}

/**
 * `POST /cliente/avisos-stock`.
 *
 * La respuesta NO trae el token de baja: iba en la respuesta y permitía
 * suscribir el email de otra persona y obtener su token para cancelar la
 * alerta. Ahora el token viaja sólo en el email, aleatorio por suscripción y
 * hasheado en BD.
 */
export interface AvisoStockBody {
  variante_id: number;
  email: string;
}
