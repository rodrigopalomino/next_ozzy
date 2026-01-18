import { BadgeCheck, MessageCircle, Truck, RefreshCw } from "lucide-react";

const benefits = [
  {
    icon: MessageCircle,
    title: "Pedido por WhatsApp",
    desc: "Atención rápida y personalizada",
  },
  {
    icon: Truck,
    title: "Envíos",
    desc: "Lima y provincias",
  },
  {
    icon: RefreshCw,
    title: "Cambios fáciles",
    desc: "Rápido y sin drama",
  },
  {
    icon: BadgeCheck,
    title: "Calidad OZZY",
    desc: "Diseños y acabados top",
  },
];

export default function BenefitsBar() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.title} className="flex gap-3">
            <div className="mt-0.5 rounded-xl bg-pink-500/10 p-2">
              <b.icon className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="text-sm font-semibold">{b.title}</div>
              <div className="mt-1 text-xs text-neutral-600">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
