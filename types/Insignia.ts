import { ISODateString } from "./helpers-enums";
import { ProductoInsignia } from "./ProductoInsignia";

export type Insignia = {
  id: number;
  nombre: string; // "HOT", "TOP", ...
  slug: string;
  color?: string | null;
  activo: boolean;

  productos?: ProductoInsignia[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
