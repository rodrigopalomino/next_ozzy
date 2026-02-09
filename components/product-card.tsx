import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  price: number;
  discountPercent?: number;
  image: string; // principal
  hoverImage?: string; // opcional (si no viene, NO hay fade)
  badge?: string;
  href?: string;
};

function calcDiscountedPrice(price: number, discountPercent: number) {
  const p = Math.max(0, Math.min(100, discountPercent));
  const discounted = price * (1 - p / 100);
  return Math.round(discounted * 100) / 100;
}

function isValidHover(main: string, hover?: string) {
  const h = (hover ?? "").trim();
  if (!h) return false;
  // si por error te pasan la misma url, no lo consideres hover
  return h !== main;
}

export default function ProductCard({
  name,
  price,
  discountPercent,
  image,
  hoverImage,
  badge,
  href = "#",
}: Props) {
  const hasDiscount =
    typeof discountPercent === "number" && discountPercent > 0;

  const finalPrice = hasDiscount
    ? calcDiscountedPrice(price, discountPercent!)
    : price;

  const hasHover = isValidHover(image, hoverImage);

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {badge ? (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white">
            {badge}
          </div>
        ) : null}

        <Link href={href} className="block">
          <div className="relative aspect-[3/4] w-full bg-neutral-100">
            {/* Imagen principal */}
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={[
                "object-cover",
                "transition-all duration-700 ease-out",
                "md:group-hover:scale-[1.02]",
                // ✅ si existe hover, hacemos fade out
                hasHover ? "md:group-hover:opacity-0" : "opacity-100",
              ].join(" ")}
            />

            {/* Imagen hover (solo si existe) */}
            {hasHover ? (
              <Image
                src={hoverImage!}
                alt={`${name} - vista 2`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={[
                  "object-cover opacity-0",
                  "transition-all duration-700 ease-out",
                  "md:group-hover:opacity-100",
                  "md:group-hover:scale-[1.02]",
                ].join(" ")}
              />
            ) : null}
          </div>

          {/* Info */}
          <div className="p-4 text-center">
            <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
              {name}
            </div>

            <div className="mt-1">
              {hasDiscount ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-neutral-500 line-through">
                    S/ {price.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-pink-600">
                    S/ {finalPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-sm font-semibold text-pink-600">
                  S/ {price.toFixed(2)}
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-neutral-600">
              <span className="rounded border border-neutral-200 px-2 py-1">
                S
              </span>
              <span className="rounded border border-neutral-200 px-2 py-1">
                M
              </span>
              <span className="rounded border border-neutral-200 px-2 py-1">
                L
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
