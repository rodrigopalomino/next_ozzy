import { ISODateString, OrigenLead } from "./helpers-enums";
import { Producto } from "./Producto";
import { VarianteProducto } from "./VarianteProducto";

export type LeadWhatsApp = {
  id: number;

  productoId: number;
  varianteId?: number | null;

  telefono?: string | null;
  mensaje: string;
  origen: OrigenLead;

  createdAt: ISODateString;

  producto?: Producto;
  variante?: VarianteProducto | null;
};
