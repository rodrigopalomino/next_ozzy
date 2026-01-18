import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-pink-500 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        {/* Ayuda */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">Ayuda</h3>
          <ul className="space-y-2 text-sm opacity-95">
            <li>
              <a href="#" className="hover:underline">
                Delivery
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cambios
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cómo pagar con Yape
              </a>
            </li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">Links</h3>
          <ul className="space-y-2 text-sm opacity-95">
            <li>
              <Link href="/tiendas" className="hover:underline">
                Tiendas
              </Link>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contáctanos
              </a>
            </li>
            <li>
              <Link
                href="/producto?tipo=categorias"
                className="hover:underline"
              >
                Catálogo
              </Link>
            </li>
          </ul>
        </div>

        {/* Marca */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">OZZY</h3>
          <p className="max-w-xs text-sm opacity-95">
            Catálogo de ropa urbana para damas. Elige tu estilo y pide directo
            por WhatsApp.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/20"
            >
              Pedir por WhatsApp
            </a>

            <a
              href="https://www.instagram.com/ozzy.urban.store/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/20"
            >
              Instagram
            </a>

            <a
              href="https://www.tiktok.com/@ozzy.urban.store"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/20"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs opacity-95">
        © 2025 OZZY — Todos los derechos reservados.
      </div>
    </footer>
  );
}
