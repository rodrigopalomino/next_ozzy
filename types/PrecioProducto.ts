import { DecimalLike, ID, ISODateString } from "./helpers-enums";
import { Producto } from "./producto";

export type PrecioProducto = {
  productoId: ID;

  precioOriginal: DecimalLike;
  porcentajeDescuento: number; // 0..100
  precioOferta?: DecimalLike | null;

  iniciaEn?: ISODateString | null;
  terminaEn?: ISODateString | null;

  activo: boolean;

  createdAt: ISODateString;
  updatedAt: ISODateString;

  producto?: Producto;
};
