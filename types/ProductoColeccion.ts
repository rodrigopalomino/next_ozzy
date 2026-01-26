import { Coleccion } from "./Coleccion";
import { ID, ISODateString } from "./helpers-enums";
import { Producto } from "./Producto";

export type ProductoColeccion = {
  productoId: ID;
  coleccionId: ID;

  asignadoEn: ISODateString;

  producto?: Producto;
  coleccion?: Coleccion;
};
