import {
  DecimalLike,
  EstadoProducto,
  ID,
  ISODateString,
} from "./helpers-enums";
import { ImagenProducto } from "./ImagenProducto";
import { LeadWhatsApp } from "./LeadWhatsApp";
import { PrecioProducto } from "./PrecioProducto";
import { ProductoCategoria } from "./ProductoCategoria";
import { ProductoColeccion } from "./ProductoColeccion";
import { ProductoInsignia } from "./ProductoInsignia";
import { VarianteProducto } from "./VarianteProducto";
import { VideoProducto } from "./VideoProducto";

export type Producto = {
  id: ID;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  estado: EstadoProducto;
  precioBase?: DecimalLike | null;

  // relaciones

  imagenes?: ImagenProducto[];
  videos?: VideoProducto[];
  variantes?: VarianteProducto[];
  precio?: PrecioProducto | null;
  insignias?: ProductoInsignia[];
  categorias?: ProductoCategoria[];
  colecciones?: ProductoColeccion[];
  leadsWhatsApp?: LeadWhatsApp[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
