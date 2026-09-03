"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useFacetas } from "@/hooks/tienda/useTienda";
import { formatearPrecio } from "@/lib/catalogo";
import { cn } from "@/lib/utils";

/**
 * Panel de filtros del catálogo.
 *
 * Todo el estado vive en la URL, así que un filtro aplicado es compartible y
 * el botón atrás funciona. Se alimenta de `GET /catalogo/facetas`, cuyos
 * conteos son globales y están cacheados 5 min en el servidor: se piden una
 * vez y no se repiten en cada cambio.
 *
 * Los conteos NO reflejan los filtros ya aplicados, así que no se deshabilita
 * ninguna opción: un «Negro (14)» sigue diciendo 14 aunque ya se haya
 * filtrado por hoodies.
 */

/** Grupos multiselección: cada uno acumula varios valores en la URL. */
const GRUPOS = [
  { clave: "categoria", param: "categorias", titulo: "Categorías" },
  { clave: "coleccion", param: "colecciones", titulo: "Colecciones" },
  { clave: "insignia", param: "insignias", titulo: "Etiquetas" },
  { clave: "color", param: "colores", titulo: "Colores" },
  { clave: "talla", param: "tallas", titulo: "Tallas" },
] as const;

type ClaveGrupo = (typeof GRUPOS)[number]["clave"];

/**
 * Los valores múltiples se guardan repitiendo el parámetro
 * (`?color=Negro&color=Blanco`), no separados por coma: así un valor que
 * contenga una coma —un color «Negro, Mate»— sigue siendo un único valor.
 */
const leerValores = (params: URLSearchParams, clave: string): string[] =>
  params.getAll(clave).filter(Boolean);

/** Reemplaza todos los valores de una clave, repitiendo el parámetro. */
const escribirValores = (
  params: URLSearchParams,
  clave: string,
  valores: string[],
) => {
  params.delete(clave);
  valores.filter(Boolean).forEach((v) => params.append(clave, v));
};

function Opcion({
  etiqueta,
  conteo,
  activa,
  hex,
  onClick,
}: {
  etiqueta: string;
  conteo?: number;
  activa: boolean;
  hex?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        activa
          ? "bg-pink-50 font-semibold text-pink-700"
          : "text-neutral-700 hover:bg-neutral-100",
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
          activa ? "border-pink-500 bg-pink-500" : "border-neutral-300",
        )}
        aria-hidden="true"
      >
        {activa ? <Check className="h-3 w-3 text-white" /> : null}
      </span>

      {hex !== undefined ? (
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-neutral-300"
          style={{ backgroundColor: hex ?? "#e5e5e5" }}
          aria-hidden="true"
        />
      ) : null}

      <span className="flex-1 truncate">{etiqueta}</span>

      {conteo !== undefined ? (
        <span className="shrink-0 text-xs tabular-nums text-neutral-400">
          {conteo}
        </span>
      ) : null}
    </button>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {titulo}
      </h3>
      <div className="mt-1.5 space-y-0.5">{children}</div>
    </div>
  );
}

/** Contenido compartido entre el sidebar de escritorio y el drawer móvil. */
function Contenido({ alNavegar }: { alNavegar?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useFacetas();

  const facetas = data?.data;
  const [rango, setRango] = useState({
    desde: searchParams.get("desde") ?? "",
    hasta: searchParams.get("hasta") ?? "",
  });

  const navegar = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(cambios).forEach(([clave, valor]) => {
      if (valor === null || valor === "") params.delete(clave);
      else params.set(clave, valor);
    });

    // Cualquier cambio de filtro invalida la página en la que estabas.
    params.delete("page");

    router.push(`?${params.toString()}`, { scroll: false });
    alNavegar?.();
  };

  /** Añade o quita un valor del grupo, dejando los demás intactos. */
  const alternar = (clave: ClaveGrupo, valor: string) => {
    const actuales = leerValores(searchParams, clave);
    const siguientes = actuales.includes(valor)
      ? actuales.filter((v) => v !== valor)
      : [...actuales, valor];

    const params = new URLSearchParams(searchParams.toString());
    escribirValores(params, clave, siguientes);
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
    alNavegar?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!facetas) return null;

  /** Una opción de filtro, ya normalizada desde la faceta que la origina. */
  type OpcionFiltro = {
    valor: string;
    etiqueta: string;
    conteo: number;
    hex?: string | null;
  };

  // Las opciones de cada grupo, en el orden en que las manda el servidor.
  const opcionesDe = (clave: ClaveGrupo): OpcionFiltro[] => {
    switch (clave) {
      case "categoria":
        return facetas.categorias.map((c) => ({
          valor: c.slug,
          etiqueta: c.nombre,
          conteo: c.productos,
        }));
      case "coleccion":
        return facetas.colecciones.map((c) => ({
          valor: c.slug,
          etiqueta: c.nombre,
          conteo: c.productos,
        }));
      case "insignia":
        return facetas.insignias.map((i) => ({
          valor: i.slug,
          etiqueta: i.nombre,
          conteo: i.productos,
        }));
      case "color":
        // El filtro compara por nombre, no por slug: así lo espera el back.
        return facetas.colores.map((c) => ({
          valor: c.nombre,
          etiqueta: c.nombre,
          conteo: c.productos,
          hex: c.hex,
        }));
      case "talla":
        return facetas.tallas.map((t) => ({
          valor: t.etiqueta,
          etiqueta: t.etiqueta,
          conteo: t.productos,
        }));
    }
  };

  return (
    <div className="space-y-6">
      {GRUPOS.map((grupo) => {
        const opciones = opcionesDe(grupo.clave);
        if (opciones.length === 0) return null;

        const activos = leerValores(searchParams, grupo.clave);

        return (
          <Seccion key={grupo.clave} titulo={grupo.titulo}>
            {opciones.map((opcion) => (
              <Opcion
                key={opcion.valor}
                etiqueta={opcion.etiqueta}
                conteo={opcion.conteo}
                hex={opcion.hex}
                activa={activos.includes(opcion.valor)}
                onClick={() => alternar(grupo.clave, opcion.valor)}
              />
            ))}
          </Seccion>
        );
      })}

      <Seccion titulo="Precio">
        <div className="px-2.5 pt-1">
          <p className="text-xs text-neutral-500">
            Entre {formatearPrecio(facetas.precio.min)} y{" "}
            {formatearPrecio(facetas.precio.max)}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={facetas.precio.min}
              max={facetas.precio.max}
              value={rango.desde}
              onChange={(e) =>
                setRango((r) => ({ ...r, desde: e.target.value }))
              }
              placeholder="Mín"
              aria-label="Precio mínimo"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500"
            />
            <span className="text-neutral-400">–</span>
            <input
              type="number"
              inputMode="numeric"
              min={facetas.precio.min}
              max={facetas.precio.max}
              value={rango.hasta}
              onChange={(e) =>
                setRango((r) => ({ ...r, hasta: e.target.value }))
              }
              placeholder="Máx"
              aria-label="Precio máximo"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full"
            onClick={() =>
              navegar({
                desde: rango.desde || null,
                hasta: rango.hasta || null,
              })
            }
          >
            Aplicar precio
          </Button>
        </div>
      </Seccion>
    </div>
  );
}

/** Chips de los filtros activos, para quitarlos de uno en uno. */
export function FiltrosActivos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useFacetas();

  const facetas = data?.data;

  /** Nombre legible de un valor; cae al valor crudo si aún no hay facetas. */
  const legible = (clave: ClaveGrupo, valor: string) => {
    if (!facetas) return valor;
    switch (clave) {
      case "categoria":
        return facetas.categorias.find((c) => c.slug === valor)?.nombre ?? valor;
      case "coleccion":
        return (
          facetas.colecciones.find((c) => c.slug === valor)?.nombre ?? valor
        );
      case "insignia":
        return facetas.insignias.find((i) => i.slug === valor)?.nombre ?? valor;
      default:
        return valor;
    }
  };

  const chips: { texto: string; quitar: () => void }[] = [];

  const navegarCon = (params: URLSearchParams) => {
    params.delete("page");
    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  };

  const q = searchParams.get("q");
  if (q) {
    chips.push({
      texto: `“${q}”`,
      quitar: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        navegarCon(params);
      },
    });
  }

  GRUPOS.forEach((grupo) => {
    leerValores(searchParams, grupo.clave).forEach((valor) => {
      chips.push({
        texto: legible(grupo.clave, valor),
        quitar: () => {
          const params = new URLSearchParams(searchParams.toString());
          const resto = leerValores(searchParams, grupo.clave).filter(
            (v) => v !== valor,
          );
          escribirValores(params, grupo.clave, resto);
          navegarCon(params);
        },
      });
    });
  });

  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  if (desde || hasta) {
    chips.push({
      texto:
        desde && hasta
          ? `${formatearPrecio(Number(desde))} – ${formatearPrecio(Number(hasta))}`
          : desde
            ? `Desde ${formatearPrecio(Number(desde))}`
            : `Hasta ${formatearPrecio(Number(hasta))}`,
      quitar: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("desde");
        params.delete("hasta");
        navegarCon(params);
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.texto}
          type="button"
          onClick={chip.quitar}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 py-1 pl-3 pr-2 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-200"
        >
          {chip.texto}
          <X className="h-3 w-3 text-neutral-500" aria-hidden="true" />
          <span className="sr-only">Quitar filtro</span>
        </button>
      ))}

      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() => router.push("?", { scroll: false })}
          className="text-xs font-medium text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          Limpiar todo
        </button>
      ) : null}
    </div>
  );
}

/** Cuántos filtros hay puestos, para el contador del botón en móvil. */
export const contarFiltros = (searchParams: URLSearchParams): number => {
  const deGrupos = GRUPOS.reduce(
    (total, grupo) => total + leerValores(searchParams, grupo.clave).length,
    0,
  );
  const dePrecio = searchParams.get("desde") || searchParams.get("hasta") ? 1 : 0;
  return deGrupos + dePrecio;
};

/** Sidebar en escritorio. */
export function CatalogoFiltros() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <Contenido />
    </div>
  );
}

/**
 * En móvil los filtros van en un drawer: el sidebar empujaba la grilla tan
 * abajo que había que hacer scroll para ver un solo producto.
 */
export function CatalogoFiltrosMovil() {
  const [abierto, setAbierto] = useState(false);
  const searchParams = useSearchParams();
  const activos = contarFiltros(new URLSearchParams(searchParams.toString()));

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
          {activos > 0 ? (
            <span className="ml-2 grid h-5 min-w-5 place-items-center rounded-full bg-pink-500 px-1 text-xs font-semibold tabular-nums text-white">
              {activos}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-8">
          <Contenido alNavegar={() => setAbierto(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
