import { ID, ISODateString } from "./helpers-enums";
import { ProductoCategoria } from "./ProductoCategoria";

export type Categoria = {
  id: ID;
  nombre: string;
  slug: string;
  orden: number;
  activo: boolean;

  productos?: ProductoCategoria[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
