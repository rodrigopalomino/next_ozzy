import { ID, ISODateString } from "./helpers-enums";
import { VarianteProducto } from "./VarianteProducto";

export type Color = {
  id: ID;
  nombre: string; // "Negro", "Blanco", ...
  hex?: string | null;

  orden: number;
  activo: boolean;

  variantes?: VarianteProducto[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
