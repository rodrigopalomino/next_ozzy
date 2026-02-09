import { Coleccion } from "./Coleccion";
import { ISODateString } from "./helpers-enums";
import { Producto } from "./Producto";

export type ProductoColeccion = {
  producto_id: number;
  coleccion_id: number;

  asignadoEn: ISODateString;

  producto?: Producto;
  coleccion?: Coleccion;
};
