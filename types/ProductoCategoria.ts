import { Categoria } from "./Categoria";
import { ISODateString } from "./helpers-enums";
import { Producto } from "./Producto";

export type ProductoCategoria = {
  producto_id: number;
  categoria_id: number;

  asignadoEn: ISODateString;

  // si tu API hace include, puede venir esto:
  producto?: Producto;
  categoria?: Categoria;
};
