import ProductCard from "./product-card";

import type { ProductoTarjetaSalida } from "@/types/catalogo";

export default function BestSellersGrid({
  productos,
}: {
  productos: ProductoTarjetaSalida[];
}) {
  if (productos.length === 0) return null;

  return (
    <section>
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">Más vendidos</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Lo que más sale por WhatsApp.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ))}
      </div>
    </section>
  );
}
