import { ID, ISODateString } from "./helpers-enums";
import { Insignia } from "./Insignia";
import { Producto } from "./Producto";

export type ProductoInsignia = {
  productoId: ID;
  insigniaId: ID;

  asignadoEn: ISODateString;

  producto?: Producto;
  insignia?: Insignia;
};
