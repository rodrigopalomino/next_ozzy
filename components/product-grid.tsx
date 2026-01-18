import ProductCard from "./product-card";

type Product = {
  id: string;
  name: string;
  price: number;
  discountPercent?: number;
  image: string;
  slug: string; // esto será tu producto_id en la URL
  category?: string;
  collection?: string;
};

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          name={p.name}
          price={p.price}
          discountPercent={p.discountPercent}
          image={p.image}
          href={`/producto/${encodeURIComponent(p.slug)}`}
        />
      ))}
    </div>
  );
}
