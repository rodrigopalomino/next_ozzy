import ProductCard from "./product-card";

import type { ProductoTarjetaSalida } from "@/types/catalogo";

export default function ProductGrid({
  productos,
}: {
  productos: ProductoTarjetaSalida[];
}) {
  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
        <p className="text-sm font-semibold text-neutral-900">
          No encontramos productos
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Prueba quitando algún filtro o buscando otra cosa.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {productos.map((producto, idx) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          // Las primeras filas entran en el viewport: sin lazy no hay salto.
          priority={idx < 4}
        />
      ))}
    </div>
  );
}
