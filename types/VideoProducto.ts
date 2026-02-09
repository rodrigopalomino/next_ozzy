import { ISODateString, PlataformaVideo } from "./helpers-enums";

export type VideoProducto = {
  id: number;
  productoId: number;

  plataforma: PlataformaVideo;
  url: string;
  etiqueta?: string | null;
  orden: number;

  createdAt: ISODateString;
};
