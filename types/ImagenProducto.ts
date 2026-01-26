import { ID, ISODateString } from "./helpers-enums";

export type ImagenProducto = {
  id: ID;
  productoId: ID;

  url: string;
  alt?: string | null;
  orden: number;
  tipo?: string | null; // "principal" | "hover" | "galeria" (tu convención)

  createdAt: ISODateString;
};
