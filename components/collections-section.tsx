import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    title: "Primavera 2025",
    subtitle: "Ligero, urbano, femenino",
    href: "/colecciones/primavera-2025",
    image: "/img/catalogo_banner.jpg",
  },
  {
    title: "Invierno",
    subtitle: "Capas y actitud",
    href: "/colecciones/invierno",
    image: "/img/catalogo_banner.jpg",
  },
  {
    title: "Colección 2025",
    subtitle: "Esenciales de temporada",
    href: "/colecciones/2025",
    image: "/img/catalogo_banner.jpg",
  },
];

export default function CollectionsSection() {
  return (
    <section>
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">Colecciones</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Pensadas como drops: explora por temporada.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {collections.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] bg-neutral-100">
              <Image
                src={c.image}
                alt={c.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>

            <div className="p-5">
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="mt-1 text-sm text-neutral-600">{c.subtitle}</div>

              <div className="mt-4 inline-flex rounded bg-pink-500 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-600">
                Ver colección
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
