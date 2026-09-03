import type { DecimalLike, ISODateString, OrigenLead } from "./helpers-enums";
import type { CarritoItemSalida } from "./carrito";

/* ------------------------------------------------------------------ leads */

/** Los cuatro estados del enum del back. Son los botones del panel. */
export const ESTADOS_LEAD = [
  "NUEVO",
  "CONTACTADO",
  "VENDIDO",
  "PERDIDO",
] as const;

export type EstadoLead = (typeof ESTADOS_LEAD)[number];

/** `GET /lead` — producto y variante vienen embebidos: no hace falta pedirlos. */
export interface LeadSalida {
  id: number;
  producto_id: number;
  variante_id: number | null;
  mensaje: string;
  origen: OrigenLead;
  estado: EstadoLead;
  nota: string | null;
  telefono: string | null;
  /** Precio en el momento del clic, no el actual: sirve para ver divergencias. */
  precioMostrado: DecimalLike | null;
  huella: string | null;
  cupon_id: number | null;
  createdAt: ISODateString;

  producto: { id: number; nombre: string; slug: string };
  variante: {
    id: number;
    sku: string | null;
    talla: { id: number; etiqueta: string };
    color: { id: number; nombre: string };
  } | null;
}

/**
 * Cuerpo de `PATCH /lead/:id`. Los tres son opcionales y se aplica sólo lo
 * que se manda.
 *
 * Pasar a `VENDIDO` **consume el cupón** del lead (incrementa `usos`), y sólo
 * en esa transición. Por eso la UI avisa antes cuando el lead trae `cupon_id`.
 */
export interface ActualizarLeadBody {
  estado?: EstadoLead;
  nota?: string | null;
  telefono?: string | null;
}

/** `GET /lead/metricas?dias=30` */
export interface MetricasLeadSalida {
  ventanaDias: number;
  /** Histórico completo, no sólo la ventana. */
  total: number;
  enVentana: number;
  porOrigen: { origen: OrigenLead; leads: number }[];
  /** Máximo 10, ya ordenado. `producto` es `null` si se borró. */
  topProductos: {
    producto: { id: number; nombre: string; slug: string } | null;
    leads: number;
  }[];
}

/**
 * `GET /lead/embudo?dias=30`
 *
 * `porEstado` sólo trae estados **con leads**: para un embudo de cuatro
 * columnas fijas hay que rellenar los que falten con 0.
 *
 * El `porcentaje` viene calculado por el servidor y no se recalcula aquí: si
 * el back cambia el criterio, dos cálculos distintos divergirían.
 */
export interface EmbudoLeadSalida {
  ventanaDias: number;
  total: number;
  porEstado: { estado: EstadoLead; leads: number; porcentaje: number }[];
  /** % de VENDIDO sobre el total, ya calculado. */
  tasaCierre: number;
}

/**
 * `GET /lead/conversion?limite=20` — por producto, no global.
 *
 * Trae numerador y denominador además del ratio, así que se puede mostrar
 * "12 de 340" junto al porcentaje.
 */
export interface ConversionSalida {
  productos: {
    id: number;
    nombre: string;
    slug: string;
    vistas: number;
    leads: number;
    /** % con un decimal, ya calculado. */
    conversion: number;
  }[];
}

/** Rellena los estados ausentes con 0 para un embudo de columnas fijas. */
export const embudoCompleto = (
  porEstado: EmbudoLeadSalida["porEstado"],
): EmbudoLeadSalida["porEstado"] =>
  ESTADOS_LEAD.map(
    (estado) =>
      porEstado.find((e) => e.estado === estado) ?? {
        estado,
        leads: 0,
        porcentaje: 0,
      },
  );

/* -------------------------------------------------------------- cupones */

export interface CuponAdmin {
  id: number;
  codigo: string;
  /** Excluyente con `montoFijo`. */
  porcentaje: number | null;
  montoFijo: number | null;
  /** String ISO, no Date. */
  iniciaEn: ISODateString | null;
  terminaEn: ISODateString | null;
  usoMaximo: number | null;
  usos: number;
  activo: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CuponBody {
  codigo: string;
  porcentaje?: number | null;
  montoFijo?: number | null;
  iniciaEn?: ISODateString | null;
  terminaEn?: ISODateString | null;
  usoMaximo?: number | null;
  activo?: boolean;
}

/* --------------------------------------------------------- configuración */

/**
 * `GET /admin/configuracion` — array de entradas.
 *
 * `descripcion` documenta las variables disponibles en las plantillas
 * (`{{producto}}`, `{{items}}`…), así que el formulario se genera desde aquí
 * en vez de hardcodear los campos.
 */
export interface ConfiguracionEntrada {
  clave: string;
  valor: string;
  descripcion: string | null;
  updatedAt: ISODateString;
}

/**
 * Cuerpo de `PATCH /admin/configuracion`: objeto parcial `{clave: valor}`.
 * Una clave fuera de la whitelist de 13 responde 400 en vez de crearse.
 */
export type ActualizarConfiguracionBody = Record<string, string>;

/* ------------------------------------------------------------- auditoría */

export type AccionAuditoria = string;

/** `GET /auditoria` */
export interface AuditoriaSalida {
  id: number;
  usuario_id: number | null;
  /** Nombre en el momento del cambio: sobrevive al borrado del usuario. */
  usuarioNombre: string | null;
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  /** JSON **sin parsear** (columna Text): `{ campo: { antes, despues } }`. */
  cambios: string | null;
  ip: string | null;
  createdAt: ISODateString;
}

export interface CambioAuditoria {
  antes: unknown;
  despues: unknown;
}

/**
 * Parsea `cambios` a una tabla de diferencias. Devuelve `null` si no es JSON
 * válido o no tiene la forma esperada, para caer al texto crudo en vez de
 * romper la fila.
 */
export const parsearCambios = (
  cambios: string | null,
): Record<string, CambioAuditoria> | null => {
  if (!cambios) return null;

  try {
    const parsed: unknown = JSON.parse(cambios);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const entradas = Object.entries(parsed).filter(
      (entrada): entrada is [string, CambioAuditoria] => {
        const valor = entrada[1];
        return (
          typeof valor === "object" &&
          valor !== null &&
          ("antes" in valor || "despues" in valor)
        );
      },
    );

    return entradas.length > 0 ? Object.fromEntries(entradas) : null;
  } catch {
    return null;
  }
};

/* ---------------------------------------------------------- mantenimiento */

/**
 * `GET /mantenimiento/huerfanas`
 *
 * Sólo cuenta las no modificadas recientemente, para no borrar una subida en
 * curso: el listado puede ser menor que "todo lo no referenciado".
 */
export interface HuerfanasSalida {
  objetosEnBucket: number;
  referenciadas: number;
  huerfanas: number;
  espacioRecuperableMB: number;
  /**
   * Rutas del objeto en MinIO (`productos/7/uuid.webp`). Hoy es la lista
   * completa, pero la UI no lo da por hecho: si alguien le pusiera un tope,
   * asumirlo haría que el usuario borrara más de lo que vio.
   */
  ejemplos: string[];
  /** Cuántas borró la última ejecución; `0` en el análisis. */
  borradas: number;
}

/* --------------------------------------------------------- notificaciones */

/** `GET /admin/notificacion/destinatarios` — no envía nada. */
export interface DestinatariosSalida {
  destinatarios: number;
}

/* ------------------------------------------------------- carritos admin */

/** `GET /admin/carrito` — sólo carritos con contenido. */
export interface CarritoAdminSalida {
  id: number;
  cliente: { id: number; nombre: string; email: string } | null;
  anonimo: boolean;
  items: CarritoItemSalida[];
  cantidad: number;
  total: number;
  moneda: string;
  simbolo: string;
  /** Calculado en el servidor: un solo criterio de "abandonado". */
  diasInactivo: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
