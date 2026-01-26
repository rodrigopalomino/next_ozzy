import { Categoria } from "./Categoria";
import { ID, ISODateString } from "./helpers-enums";
import { Producto } from "./Producto";

export type ProductoCategoria = {
  productoId: ID;
  categoriaId: ID;

  asignadoEn: ISODateString;

  // si tu API hace include, puede venir esto:
  producto?: Producto;
  categoria?: Categoria;
};
