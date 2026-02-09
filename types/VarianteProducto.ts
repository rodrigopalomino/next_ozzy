import { Color } from "./Color";
import { DecimalLike, ISODateString } from "./helpers-enums";
import { LeadWhatsApp } from "./LeadWhatsApp";
import { Producto } from "./Producto";
import { Talla } from "./Talla";

export type VarianteProducto = {
  id: number;
  productoId: number;

  tallaId: number;
  colorId: number;

  sku?: string | null;

  precio?: DecimalLike | null;
  stock?: number | null;

  activo: boolean;

  leadsWhatsApp?: LeadWhatsApp[];

  createdAt: ISODateString;
  updatedAt: ISODateString;

  // si tu API hace include
  producto?: Producto;
  talla?: Talla;
  color?: Color;
};
