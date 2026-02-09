import { ISODateString } from "./helpers-enums";

export type ImagenProducto = {
  id: number;
  productoId: number;

  url: string;
  alt?: string | null;
  orden: number;
  tipo?: string | null; // "principal" | "hover" | "galeria" (tu convención)

  createdAt: ISODateString;
};
