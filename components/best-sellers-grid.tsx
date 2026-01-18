import ProductCard from "./product-card";

type Item = {
  id: string;
  name: string;
  price: number;
  discountPercent?: number;
  image: string;
  badge?: string;
};

export default function BestSellersGrid({ items }: { items: Item[] }) {
  return (
    <section>
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">Más vendidos</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Lo que más sale por WhatsApp.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            price={p.price}
            discountPercent={p.discountPercent}
            image={p.image}
            hoverImage="/img/polo_2.jpg"
            badge={p.badge}
            href={`/producto/${encodeURIComponent(p.name.toLowerCase().replace(/\s+/g, "-"))}`}
          />
        ))}
      </div>
    </section>
  );
}
