import { ISODateString } from "./helpers-enums";
import { ProductoColeccion } from "./ProductoColeccion";

export type Coleccion = {
  id: number;
  nombre: string;
  slug: string;

  descripcion?: string | null;
  imagenPortada?: string | null;
  iniciaEn?: ISODateString | null;
  terminaEn?: ISODateString | null;

  activo: boolean;

  productos?: ProductoColeccion[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
