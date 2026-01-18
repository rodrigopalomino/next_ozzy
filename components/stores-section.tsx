import Image from "next/image";
import Link from "next/link";

export default function StoresSection() {
  return (
    <section>
      <div className="overflow-hidden rounded-2xl border border-pink-200 bg-white">
        <div className="bg-pink-500 px-6 py-5 text-center text-xl font-semibold text-white">
          Visite Nuestras Tiendas
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-2 md:items-center md:p-10">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Una experiencia, no solo ropa
            </h3>
            <p className="text-sm leading-6 text-neutral-700">
              Conoce nuestros espacios, prueba tu estilo y encuentra el fit
              perfecto. Atención rápida, cambios fáciles y drops que llegan
              primero a tienda.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="#"
                className="rounded bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600"
              >
                Ver tiendas
              </Link>

              <Link
                href="#"
                className="rounded border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-black/5"
              >
                Cómo llegar
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/img/tienda-1.png"
                alt="Tienda OZZY 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/img/tienda-2.png"
                alt="Tienda OZZY 2"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
