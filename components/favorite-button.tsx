"use client";

import { Heart } from "lucide-react";

import { useFavoritos, useFavoritosAcciones } from "@/hooks/tienda/useTienda";
import { cn } from "@/lib/utils";

/**
 * Alterna un producto en favoritos.
 *
 * Sin cuenta también persiste: el back guarda contra el `dispositivo` y los
 * adopta al entrar con Google, así que no hace falta un espejo en
 * localStorage.
 */
export default function FavoriteButton({
  producto_id,
  className,
}: {
  producto_id: number;
  className?: string;
}) {
  const { data } = useFavoritos();
  const { agregar, quitar } = useFavoritosAcciones();

  const esFavorito = Boolean(
    data?.data.productos.some((p) => p.id === producto_id),
  );
  const enCurso = agregar.isPending || quitar.isPending;

  const alternar = () => {
    if (enCurso) return;
    if (esFavorito) quitar.mutate(producto_id);
    else agregar.mutate(producto_id);
  };

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={enCurso}
      aria-pressed={esFavorito}
      aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-white",
        esFavorito && "text-pink-600",
        className,
      )}
    >
      <Heart
        className={cn("h-4 w-4", esFavorito && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
