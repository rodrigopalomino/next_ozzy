"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

function SocialIconButton({
  src,
  alt,
  ariaLabel,
  href = "#",
  iconClassName = "h-7 w-7 sm:h-6 sm:w-6",
}: {
  src: string;
  alt: string;
  ariaLabel: string;
  href?: string;
  iconClassName?: string;
}) {
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

export default function SiteHeader() {
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
                alt="OZZY"
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
              href="https://www.instagram.com/ozzy.urban.store/?igsh=Njg4NW1lY2dlZDZu#"
            />
            <SocialIconButton
              src="/img/tiktok.svg"
              alt="TikTok"
              ariaLabel="TikTok"
              href="https://www.tiktok.com/@ozzy.urban.store?_t=8la1ycsjWz7&_r=1"
            />
            <SocialIconButton
              src="/img/facebook.svg"
              alt="Facebook"
              ariaLabel="Facebook"
              href="#"
            />
          </div>
        </div>
      </div>

      {/* Barra de navegación: limpio (Inicio | Categorías | Colecciones | Tiendas) */}
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
            {/* Si no tienes página /tiendas aún, esto puede ser un anchor a tu sección */}
            <Link className="hover:underline" href="/#tiendas">
              Tiendas
            </Link>
          </nav>

          <div className="sm:ml-auto">
            <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-white px-4 py-2">
              <Search className="h-4 w-4 text-muted" />
              <input
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
                placeholder="Buscar..."
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
