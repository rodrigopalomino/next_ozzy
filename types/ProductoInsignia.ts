import { ISODateString } from "./helpers-enums";
import { Insignia } from "./Insignia";
import { Producto } from "./Producto";

export type ProductoInsignia = {
  producto_id: number;
  insignia_id: number;

  asignadoEn: ISODateString;

  producto?: Producto;
  insignia?: Insignia;
};
