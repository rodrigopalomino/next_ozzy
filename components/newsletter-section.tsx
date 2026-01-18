export default function NewsletterSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-pink-200 bg-white">
      <div className="bg-pink-500 px-6 py-5 text-center text-xl font-semibold text-white">
        Drops y ofertas
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-10">
        <div>
          <h3 className="text-lg font-semibold">Recibe lo nuevo primero</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Déjanos tu correo y te avisamos cuando salga una colección o
            promoción. (Catálogo OZZY — venta por WhatsApp).
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Tu correo"
            className="h-11 w-full rounded border border-neutral-300 px-4 text-sm outline-none focus:border-pink-400"
          />
          <button
            type="button"
            className="h-11 rounded bg-pink-500 px-5 text-sm font-semibold text-white hover:bg-pink-600"
          >
            Suscribirme
          </button>
        </form>
      </div>
    </section>
  );
}
