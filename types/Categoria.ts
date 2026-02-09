import { ISODateString } from "./helpers-enums";
import { ProductoCategoria } from "./ProductoCategoria";

export type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  orden: number;
  activo: boolean;

  productos?: ProductoCategoria[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
