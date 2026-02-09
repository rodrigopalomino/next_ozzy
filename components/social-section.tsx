import Image from "next/image";

const ig = ["/img/image.png"];

export default function SocialSection() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Comunidad</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Síguenos en Instagram y TikTok para ver looks reales.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="#"
            className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-black/5"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="#"
            className="rounded bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ig.map((src) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
          >
            <Image src={src} alt="Social" fill className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
