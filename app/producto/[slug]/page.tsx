import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductGallery from "@/components/product-gallery";
import SizePicker from "@/components/size-picker";
import ColorPicker from "@/components/color-picker";
import QuantityPicker from "@/components/quantity-picker";
import WhatsAppButton from "@/components/whatsapp-button";
import Link from "next/link";
import {
  Instagram,
  Music2,
  Play,
  Flame,
  Sparkles,
  TrendingUp,
  Tag,
} from "lucide-react";

const PRODUCT = {
  name: "Polo Ray",
  slug: "polo-ray",
  currency: "S/",
  price: 149, // precio original
  discountPercent: 50, // ✅ oferta
  badges: ["HOT", "TOP", "OFERTA"] as Array<
    "HOT" | "TOP" | "OFERTA" | "TENDENCIA" | "NUEVO"
  >,
  description:
    "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis nulla iste doloremque rerum asperiores dolorum nostrum explicabo labore minus, praesentium quis voluptate totam, sunt laborum atque esse! Omnis, molestias porro.",
  images: ["/img/polo.png", "/img/polo.png", "/img/polo.png", "/img/polo.png"],
  sizes: ["S", "M", "L"],
  colors: ["Negro", "Blanco", "Rosado"],

  // ✅ Links a videos del producto
  videos: {
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
  },
};

function calcDiscountedPrice(price: number, discountPercent: number) {
  const p = Math.max(0, Math.min(100, discountPercent));
  const discounted = price * (1 - p / 100);
  return Math.round(discounted * 100) / 100;
}

function BadgePill({ label }: { label: string }) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    OFERTA: {
      icon: <Tag className="h-3.5 w-3.5" />,
      className: "bg-brand text-white",
    },
    HOT: {
      icon: <Flame className="h-3.5 w-3.5" />,
      className: "bg-black text-white",
    },
    TOP: {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      className: "bg-amber-400 text-black",
    },
    TENDENCIA: {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      className: "bg-emerald-500 text-white",
    },
    NUEVO: {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      className: "bg-sky-500 text-white",
    },
  };

  const conf = map[label] ?? {
    icon: null,
    className: "bg-neutral-900 text-white",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        conf.className,
      ].join(" ")}
    >
      {conf.icon}
      {label}
    </span>
  );
}

function VideoCTA({ igUrl, ttUrl }: { igUrl?: string; ttUrl?: string }) {
  const hasAny = Boolean(igUrl || ttUrl);
  if (!hasAny) return null;

  return (
    <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Play className="h-4 w-4" />
            Mira el video del producto
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Míralo en Instagram o TikTok antes de pedir.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {igUrl ? (
          <a
            href={igUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90"
            aria-label="Ver video del producto en Instagram"
          >
            <Instagram className="h-4 w-4" />
            Ver video (Instagram)
          </a>
        ) : null}

        {ttUrl ? (
          <a
            href={ttUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            aria-label="Ver video del producto en TikTok"
          >
            <Music2 className="h-4 w-4" />
            Ver video (TikTok)
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = decodeURIComponent(params.slug);
  void slug;

  const hasDiscount =
    typeof PRODUCT.discountPercent === "number" && PRODUCT.discountPercent > 0;

  const finalPrice = hasDiscount
    ? calcDiscountedPrice(PRODUCT.price, PRODUCT.discountPercent!)
    : PRODUCT.price;

  const showBadges = PRODUCT.badges?.length ? PRODUCT.badges : [];

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Producto", href: "/producto?tipo=categorias" },
            { label: PRODUCT.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Galería */}
          <ProductGallery images={PRODUCT.images} />

          {/* Info */}
          <section>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {showBadges.map((b) => (
                <BadgePill key={b} label={b} />
              ))}
              {hasDiscount ? (
                <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  -{PRODUCT.discountPercent}% OFF
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-2xl font-semibold">{PRODUCT.name}</h1>

            {/* Precio (con oferta) */}
            <div className="mt-3">
              {hasDiscount ? (
                <div className="flex items-end gap-3">
                  <span className="text-xl font-semibold text-brand">
                    {PRODUCT.currency} {finalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-neutral-500 line-through">
                    {PRODUCT.currency} {PRODUCT.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-semibold">
                  {PRODUCT.currency} {PRODUCT.price.toFixed(2)}
                </div>
              )}
            </div>

            {/* ✅ CTA de video claro (no parece “red social”) */}
            <VideoCTA
              igUrl={PRODUCT.videos.instagram}
              ttUrl={PRODUCT.videos.tiktok}
            />

            <div className="mt-6 space-y-5">
              <SizePicker label="Talla:" sizes={PRODUCT.sizes} />
              <ColorPicker label="Color:" colors={PRODUCT.colors} />
              <QuantityPicker label="Cantidad:" />

              <WhatsAppButton
                phone="+51904634045"
                message={`Hola, quiero pedir: ${PRODUCT.name}. Precio: ${PRODUCT.currency} ${finalPrice.toFixed(
                  2,
                )}${hasDiscount ? ` (Antes ${PRODUCT.currency} ${PRODUCT.price.toFixed(2)} / ${PRODUCT.discountPercent}% OFF)` : ""}.`}
              />
            </div>

            <div className="mt-8">
              <h3 className="mb-2 text-sm font-semibold">Descripción:</h3>
              <p className="text-sm leading-6 text-neutral-700">
                {PRODUCT.description}
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/producto?tipo=categorias"
                className="text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
              >
                Volver al catálogo
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
