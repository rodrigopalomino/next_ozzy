import { DecimalLike, ISODateString } from "./helpers-enums";
import { Producto } from "./Producto";

export type PrecioProducto = {
  productoId: number;

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
