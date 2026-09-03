"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Search, ShoppingBag } from "lucide-react";

import ClienteMenu from "@/components/cliente-menu";
import { useCarrito } from "@/hooks/carrito/useCarrito";
import { useCarritoDrawer } from "@/store/carrito-drawer-store";
import { useConfiguracion, useFavoritos } from "@/hooks/tienda/useTienda";

function SocialIconButton({
  src,
  alt,
  ariaLabel,
  href,
  iconClassName = "h-7 w-7 sm:h-6 sm:w-6",
}: {
  src: string;
  alt: string;
  ariaLabel: string;
  href: string;
  iconClassName?: string;
}) {
  // Una red sin configurar llega como cadena vacía: no se pinta el icono en
  // vez de dejar un enlace muerto.
  if (!href) return null;

  return (
    <a
      href={href}
      className="inline-flex rounded p-2 hover:bg-black/5"
      aria-label={ariaLabel}
      target="_blank"
      rel="noreferrer"
    >
      <span className={`relative ${iconClassName}`}>
        <Image src={src} alt={alt} fill className="object-contain" />
      </span>
    </a>
  );
}

/** Contador sobre un icono; se oculta en 0. */
function Contador({ valor }: { valor: number }) {
  if (valor <= 0) return null;

  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold tabular-nums text-pink-600">
      {valor > 99 ? "99+" : valor}
    </span>
  );
}

/**
 * Formulario de búsqueda. Vive aparte porque `useSearchParams` obliga a
 * Suspense: si estuviera en `SiteHeader`, cada página que use el header
 * tendría que envolverlo, y basta olvidarlo en una para romper el build.
 */
function BuscadorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [termino, setTermino] = useState(searchParams.get("q") ?? "");

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const q = termino.trim();
    // La búsqueda pública va por `?q=` (índice FULLTEXT del back), no por los
    // filtros del panel.
    router.push(q ? `/producto?q=${encodeURIComponent(q)}` : "/producto");
  };

  return (
    <form
      onSubmit={buscar}
      role="search"
      className="flex w-full max-w-md items-center gap-2 rounded-full bg-white px-4 py-2"
    >
      <label htmlFor="buscar" className="sr-only">
        Buscar productos
      </label>
      <Search className="h-4 w-4 shrink-0 text-muted" />
      <input
        id="buscar"
        type="search"
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
        placeholder="Buscar..."
      />
    </form>
  );
}

export default function SiteHeader() {
  const abrirCarrito = useCarritoDrawer((s) => s.abrir);
  const { data: configuracion } = useConfiguracion();
  const { data: carrito } = useCarrito();
  const { data: favoritos } = useFavoritos();

  const config = configuracion?.data;

  return (
    <header className="border-b border-neutral-200 bg-bg">
      {/* Top: logo + redes */}
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Ir al inicio"
          >
            <div className="relative h-10 w-28">
              <Image
                src="/img/logo.svg"
                alt={config?.["tienda.nombre"] || "OZZY"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <SocialIconButton
              src="/img/instagram.svg"
              alt="Instagram"
              ariaLabel="Instagram"
              href={config?.["redes.instagram"] ?? ""}
            />
            <SocialIconButton
              src="/img/tiktok.svg"
              alt="TikTok"
              ariaLabel="TikTok"
              href={config?.["redes.tiktok"] ?? ""}
            />
            <SocialIconButton
              src="/img/facebook.svg"
              alt="Facebook"
              ariaLabel="Facebook"
              href={config?.["redes.facebook"] ?? ""}
            />
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
          <nav className="flex items-center gap-5 text-sm font-semibold text-white">
            <Link className="hover:underline" href="/">
              Inicio
            </Link>
            <Link className="hover:underline" href="/producto?tipo=categorias">
              Categorías
            </Link>
            <Link className="hover:underline" href="/producto?tipo=colecciones">
              Colecciones
            </Link>
            <Link className="hover:underline" href="/#tiendas">
              Tiendas
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:ml-auto">
            <Suspense
              fallback={
                <div className="h-10 w-full max-w-md rounded-full bg-white/60" />
              }
            >
              <BuscadorForm />
            </Suspense>

            <Link
              href="/favoritos"
              aria-label="Ver favoritos"
              className="relative inline-flex shrink-0 rounded-full p-2 text-white hover:bg-white/15"
            >
              <Heart className="h-5 w-5" />
              <Contador valor={favoritos?.data.total ?? 0} />
            </Link>

            {/* Abre el drawer en vez de navegar: el cliente revisa el
                carrito sin perder la página en la que estaba. */}
            <button
              type="button"
              onClick={abrirCarrito}
              aria-label="Ver carrito"
              className="relative inline-flex shrink-0 rounded-full p-2 text-white transition-colors hover:bg-white/15"
            >
              <ShoppingBag className="h-5 w-5" />
              <Contador valor={carrito?.data.cantidad ?? 0} />
            </button>

            <ClienteMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
