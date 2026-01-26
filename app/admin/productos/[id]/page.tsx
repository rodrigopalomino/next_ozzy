/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/productos/[id]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useProducto } from "@/hooks/productoo/useProducto";
import { useCategorias } from "@/hooks/categoria/useCategorias";
import { useColecciones } from "@/hooks/coleccion/useColecciones";
import { useInsignias } from "@/hooks/insignia/useInsignias";
import { useTallas } from "@/hooks/talla/useTallas";
import { useColores } from "@/hooks/color/useColores";

import {
  useUpsertProductoPrecio,
  type UpsertProductoPrecioBody,
} from "@/hooks/productoo/useUpsertProductoPrecio";
import { useDeleteProductoPrecio } from "@/hooks/productoo/useDeleteProductoPrecio";
import { ProductosHeader } from "@/components/producto/edit/ProductosHeader";
import { GeneralTab } from "@/components/producto/edit/GeneralTab";
import { PrecioTab } from "@/components/producto/edit/PrecioTab";
import { ImagenesTab } from "@/components/producto/edit/ImagenesTab";
import { VideosTab } from "@/components/producto/edit/VideosTab";
import { VariantesTab } from "@/components/producto/edit/VariantesTab";
import { RelacionesTab } from "@/components/producto/edit/RelacionesTab";

type EstadoProducto = "ACTIVO" | "OCULTO" | "ARCHIVADO";
type PlataformaVideo = "INSTAGRAM" | "TIKTOK";

export type GeneralForm = {
  nombre: string;
  slug: string;
  descripcion: string;
  estado: EstadoProducto;
  precioBase: string;
};

export type PrecioForm = {
  precioOriginal: string;
  porcentajeDescuento: string;
  precioOferta: string;
  iniciaEn: string;
  terminaEn: string;
  activo: boolean;
  msg: { type: "ok" | "err"; text: string } | null;
};

export type RelacionesForm = {
  selectedCatIds: string[];
  selectedColIds: string[];
  selectedBadgeIds: string[];
};

export type VideosForm = {
  plataforma: PlataformaVideo;
  url: string;
  etiqueta: string;
  orden: string;
};

export type VariantesForm = {
  tallaId: string;
  colorId: string;
  sku: string;
  precio: string;
  stock: string;
  activo: boolean;
};

function toNumberOrThrow(label: string, raw: string) {
  const v = Number(
    String(raw ?? "")
      .replace(",", ".")
      .trim(),
  );
  if (!Number.isFinite(v)) throw new Error(`${label} inválido`);
  return v;
}
function toNumberOrUndefined(raw: string) {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  const v = Number(s.replace(",", "."));
  return Number.isFinite(v) ? v : undefined;
}
function toNumberOrNull(raw: string) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const v = Number(s.replace(",", "."));
  return Number.isFinite(v) ? v : null;
}
function toStringOrNull(raw: string) {
  const s = String(raw ?? "").trim();
  return s ? s : null;
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: producto, isLoading, isError } = useProducto(id);

  const { data: cats = [] } = useCategorias();
  const { data: cols = [] } = useColecciones();
  const { data: badges = [] } = useInsignias();
  const { data: tallas = [] } = useTallas();
  const { data: colores = [] } = useColores();

  // hooks precio/oferta
  const { mutateAsync: upsertPrecioAsync, isPending: isSavingPrecio } =
    useUpsertProductoPrecio(id);
  const { mutateAsync: deletePrecioAsync, isPending: isDeletingPrecio } =
    useDeleteProductoPrecio(id);

  // =======================
  // Forms (objetos, no 20 props)
  // =======================
  const [general, setGeneral] = React.useState<GeneralForm>({
    nombre: "",
    slug: "",
    descripcion: "",
    estado: "ACTIVO",
    precioBase: "",
  });

  const [precio, setPrecio] = React.useState<PrecioForm>({
    precioOriginal: "",
    porcentajeDescuento: "0",
    precioOferta: "",
    iniciaEn: "",
    terminaEn: "",
    activo: false,
    msg: null,
  });

  const [relaciones, setRelaciones] = React.useState<RelacionesForm>({
    selectedCatIds: [],
    selectedColIds: [],
    selectedBadgeIds: [],
  });

  const [videosForm, setVideosForm] = React.useState<VideosForm>({
    plataforma: "INSTAGRAM",
    url: "",
    etiqueta: "",
    orden: "0",
  });

  const [variantesForm, setVariantesForm] = React.useState<VariantesForm>({
    tallaId: "",
    colorId: "",
    sku: "",
    precio: "",
    stock: "",
    activo: true,
  });

  // =======================
  // Hydrate (producto -> forms)
  // =======================
  React.useEffect(() => {
    if (!producto) return;

    setGeneral({
      nombre: producto.nombre ?? "",
      slug: producto.slug ?? "",
      descripcion: producto.descripcion ?? "",
      estado: (producto.estado as EstadoProducto) ?? "ACTIVO",
      precioBase:
        producto.precioBase == null ? "" : String(producto.precioBase),
    });

    if (producto.precio) {
      setPrecio((p) => ({
        ...p,
        precioOriginal: String(producto.precio?.precioOriginal ?? ""),
        porcentajeDescuento: String(producto.precio?.porcentajeDescuento ?? 0),
        precioOferta:
          producto.precio?.precioOferta == null
            ? ""
            : String(producto.precio?.precioOferta),
        iniciaEn: producto.precio?.iniciaEn ?? "",
        terminaEn: producto.precio?.terminaEn ?? "",
        activo: Boolean(producto.precio?.activo),
        msg: null,
      }));
    } else {
      setPrecio((p) => ({
        ...p,
        precioOriginal: "",
        porcentajeDescuento: "0",
        precioOferta: "",
        iniciaEn: "",
        terminaEn: "",
        activo: false,
        msg: null,
      }));
    }

    setRelaciones({
      selectedCatIds: (producto.categorias ?? []).map((x) => x.categoria!.id),
      selectedColIds: (producto.colecciones ?? []).map((x) => x.coleccion!.id),
      selectedBadgeIds: (producto.insignias ?? []).map((x) => x.insignia!.id),
    });
  }, [producto]);

  // =======================
  // Precio actions (hooks)
  // =======================
  async function guardarOferta() {
    try {
      setPrecio((p) => ({ ...p, msg: null }));

      const body: UpsertProductoPrecioBody = {
        precioOriginal: toNumberOrThrow(
          "Precio original",
          precio.precioOriginal,
        ),
        porcentajeDescuento:
          toNumberOrUndefined(precio.porcentajeDescuento) ?? 0,
        precioOferta: toNumberOrNull(precio.precioOferta),
        iniciaEn: toStringOrNull(precio.iniciaEn),
        terminaEn: toStringOrNull(precio.terminaEn),
        activo: Boolean(precio.activo),
      };

      if (body.porcentajeDescuento! < 0 || body.porcentajeDescuento! > 100) {
        throw new Error("% Descuento debe estar entre 0 y 100");
      }
      if (body.precioOferta != null && body.precioOferta < 0) {
        throw new Error("Precio oferta no puede ser negativo");
      }

      await upsertPrecioAsync(body);

      setPrecio((p) => ({
        ...p,
        msg: { type: "ok", text: "Oferta guardada correctamente." },
      }));
    } catch (e: any) {
      setPrecio((p) => ({
        ...p,
        msg: { type: "err", text: e?.message || "Error guardando oferta." },
      }));
    }
  }

  async function eliminarPrecioOferta() {
    try {
      setPrecio((p) => ({ ...p, msg: null }));
      await deletePrecioAsync();

      setPrecio((p) => ({
        ...p,
        precioOriginal: "",
        porcentajeDescuento: "0",
        precioOferta: "",
        iniciaEn: "",
        terminaEn: "",
        activo: false,
        msg: { type: "ok", text: "Precio/oferta eliminada." },
      }));
    } catch (e: any) {
      setPrecio((p) => ({
        ...p,
        msg: {
          type: "err",
          text: e?.message || "Error eliminando precio/oferta.",
        },
      }));
    }
  }

  // =======================
  // Guards
  // =======================
  if (isLoading)
    return <div className="mx-auto w-full max-w-5xl p-6">Cargando...</div>;
  if (isError || !producto)
    return (
      <div className="mx-auto w-full max-w-5xl p-6">Producto no encontrado</div>
    );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <ProductosHeader producto={producto} />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="price">Precio / Oferta</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="relations">Relaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralTab state={{ form: general, setForm: setGeneral }} />
        </TabsContent>

        <TabsContent value="price" className="space-y-4">
          <PrecioTab
            state={{ form: precio, setForm: setPrecio }}
            actions={{
              hasPrecio: Boolean(producto.precio),
              saving: isSavingPrecio,
              deleting: isDeletingPrecio,
              onSave: guardarOferta,
              onDelete: eliminarPrecioOferta,
            }}
          />
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <ImagenesTab
            productoId={id}
            initial={(producto.imagenes ?? []).map((img) => ({
              id: img.id,
              previewUrl: img.url,
              alt: img.alt ?? "",
              tipo: (img.tipo === "principal" ? "principal" : "galeria") as
                | "principal"
                | "galeria",
              orden: img.orden ?? 0,
            }))}
          />
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          {/* <VideosTab
            state={{ form: videosForm, setForm: setVideosForm }}
            videos={producto.videos ?? []}
          /> */}
          <VideosTab
            productoId={id}
            state={{ form: videosForm, setForm: setVideosForm }}
            videos={producto.videos ?? []}
          />
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <VariantesTab
            productoId={id}
            state={{ form: variantesForm, setForm: setVariantesForm }}
            catalog={{ tallas, colores }}
            variantes={(producto.variantes ?? []).map((v) => ({
              ...v,
              precio:
                v.precio == null
                  ? null
                  : typeof v.precio === "number"
                    ? v.precio
                    : Number(String(v.precio).replace(",", ".")),
            }))}
          />
        </TabsContent>

        <TabsContent value="relations" className="space-y-4">
          <RelacionesTab
            productoId={id}
            state={{ form: relaciones, setForm: setRelaciones }}
            catalog={{ cats, cols, badges }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
