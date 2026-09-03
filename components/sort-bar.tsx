"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * Orden de la grilla. Vive en la URL (no en estado local) para que sea
 * compartible y sobreviva al back del navegador.
 *
 * `sortBy`/`order` van tal cual al catálogo público, así que las claves de
 * aquí tienen que ser campos que el servidor acepte ordenar.
 */
const OPCIONES = [
  { etiqueta: "Relevancia", sortBy: "", order: "" },
  { etiqueta: "Precio: menor a mayor", sortBy: "precio", order: "asc" },
  { etiqueta: "Precio: mayor a menor", sortBy: "precio", order: "desc" },
  { etiqueta: "Nombre: A-Z", sortBy: "nombre", order: "asc" },
  { etiqueta: "Nombre: Z-A", sortBy: "nombre", order: "desc" },
] as const;

export default function SortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const actual = `${searchParams.get("sortBy") ?? ""}:${searchParams.get("order") ?? ""}`;

  const cambiar = (valor: string) => {
    const [sortBy, order] = valor.split(":");
    const params = new URLSearchParams(searchParams.toString());

    if (sortBy) params.set("sortBy", sortBy);
    else params.delete("sortBy");

    if (order) params.set("order", order);
    else params.delete("order");

    // Cambiar el orden invalida la página en la que estabas.
    params.delete("page");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="orden"
        className="text-sm font-medium text-neutral-800"
      >
        Ordenar por
      </label>
      <select
        id="orden"
        value={actual}
        onChange={(e) => cambiar(e.target.value)}
        className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-pink-500"
      >
        {OPCIONES.map((o) => (
          <option key={o.etiqueta} value={`${o.sortBy}:${o.order}`}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}
