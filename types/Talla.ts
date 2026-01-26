import { ID, ISODateString } from "./helpers-enums";
import { VarianteProducto } from "./VarianteProducto";

export type Talla = {
  id: ID;
  etiqueta: string; // "S" | "M" | "L" (según data)
  orden: number;
  activo: boolean;

  variantes?: VarianteProducto[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
