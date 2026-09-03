import Link from "next/link";

import FooterEnlaces from "@/components/footer-enlaces";

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

          <FooterEnlaces />
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs opacity-95">
        © {new Date().getFullYear()} OZZY — Todos los derechos reservados.
      </div>
    </footer>
  );
}
