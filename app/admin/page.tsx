// app/admin/dashboard/page.tsx
"use client";

import * as React from "react";

type KPI = {
  label: string;
  value: string;
  sub?: string;
};

type TrendPoint = { label: string; value: number };

type RowItem = {
  id: number;
  nombre: string;
  vistas: number;
  compras: number;
  leadsWhatsapp: number;
  conversionPct: number; // 0..100
  ingresos: number; // S/
};

type AlertItem = {
  type: "warn" | "info";
  text: string;
};

function formatMoney(n: number) {
  return `S/ ${n.toFixed(2)}`;
}
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function MiniBars({ data, max = 0 }: { data: TrendPoint[]; max?: number }) {
  const maxVal =
    max > 0 ? max : Math.max(1, ...data.map((d) => Number(d.value) || 0));

  return (
    <div className="grid grid-cols-7 gap-2">
      {data.map((d) => {
        const h = clamp01((Number(d.value) || 0) / maxVal);
        return (
          <div key={d.label} className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-3 rounded-full bg-neutral-100">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-pink-500"
                style={{ height: `${Math.round(h * 100)}%` }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <div className="text-[11px] text-neutral-500">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  // =========================
  // DATA ESTÁTICA (por ahora)
  // =========================
  const kpis: KPI[] = [
    { label: "Ventas hoy", value: "S/ 1,240.00", sub: "18 pedidos" },
    { label: "Leads WhatsApp", value: "57", sub: "hoy" },
    { label: "Visitas", value: "1,980", sub: "hoy" },
    { label: "Conversión", value: "2.4%", sub: "visita → compra" },
  ];

  const visitasPorDia: TrendPoint[] = [
    { label: "L", value: 1200 },
    { label: "M", value: 1450 },
    { label: "M", value: 1320 },
    { label: "J", value: 1700 },
    { label: "V", value: 1980 },
    { label: "S", value: 1560 },
    { label: "D", value: 1100 },
  ];

  const ventasPorDia: TrendPoint[] = [
    { label: "L", value: 620 },
    { label: "M", value: 880 },
    { label: "M", value: 790 },
    { label: "J", value: 1020 },
    { label: "V", value: 1240 },
    { label: "S", value: 950 },
    { label: "D", value: 510 },
  ];

  const topProductos: RowItem[] = [
    {
      id: 4,
      nombre: "Producto oferta 1",
      vistas: 980,
      compras: 22,
      leadsWhatsapp: 31,
      conversionPct: 2.2,
      ingresos: 2200,
    },
    {
      id: 1,
      nombre: "Rodrigo",
      vistas: 860,
      compras: 18,
      leadsWhatsapp: 19,
      conversionPct: 2.1,
      ingresos: 1080,
    },
    {
      id: 3,
      nombre: "Producto 1",
      vistas: 720,
      compras: 11,
      leadsWhatsapp: 16,
      conversionPct: 1.5,
      ingresos: 1474,
    },
    {
      id: 2,
      nombre: "Dasdasdasdasd",
      vistas: 520,
      compras: 7,
      leadsWhatsapp: 9,
      conversionPct: 1.3,
      ingresos: 560,
    },
  ];

  const productosSinVentas: RowItem[] = [
    {
      id: 12,
      nombre: "Camiseta Black Basic",
      vistas: 210,
      compras: 0,
      leadsWhatsapp: 3,
      conversionPct: 0,
      ingresos: 0,
    },
    {
      id: 14,
      nombre: "Hoodie Street 2026",
      vistas: 190,
      compras: 0,
      leadsWhatsapp: 1,
      conversionPct: 0,
      ingresos: 0,
    },
    {
      id: 20,
      nombre: "Casaca Windbreaker",
      vistas: 130,
      compras: 0,
      leadsWhatsapp: 0,
      conversionPct: 0,
      ingresos: 0,
    },
  ];

  const alerts: AlertItem[] = [
    { type: "warn", text: "5 productos sin imagen principal." },
    { type: "warn", text: "3 variantes con stock bajo (≤ 3)." },
    {
      type: "info",
      text: "Producto X tiene muchas vistas pero pocas compras.",
    },
    { type: "warn", text: "2 productos con precio oferta inválido." },
  ];

  // Derivados (estáticos por ahora)
  const productoMasVisto = topProductos
    .slice()
    .sort((a, b) => b.vistas - a.vistas)[0];
  const productoMasComprado = topProductos
    .slice()
    .sort((a, b) => b.compras - a.compras)[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Resumen del negocio (data estática por ahora).
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs font-medium text-neutral-500">
              {k.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-neutral-900">
              {k.value}
            </div>
            {k.sub ? (
              <div className="mt-1 text-xs text-neutral-600">{k.sub}</div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Highlights */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Producto más visto</div>
          <div className="mt-2 text-sm text-neutral-700">
            <span className="font-medium text-neutral-900">
              {productoMasVisto?.nombre ?? "—"}
            </span>{" "}
            • {productoMasVisto?.vistas ?? 0} vistas •{" "}
            {productoMasVisto?.leadsWhatsapp ?? 0} leads
          </div>
          <div className="mt-3 text-xs text-neutral-600">
            Tip: si tiene muchas vistas y pocas compras, revisa fotos/price/CTA.
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Producto más comprado</div>
          <div className="mt-2 text-sm text-neutral-700">
            <span className="font-medium text-neutral-900">
              {productoMasComprado?.nombre ?? "—"}
            </span>{" "}
            • {productoMasComprado?.compras ?? 0} compras •{" "}
            {formatMoney(productoMasComprado?.ingresos ?? 0)} ingresos
          </div>
          <div className="mt-3 text-xs text-neutral-600">
            Tip: úsalo como “Más vendido” en home para subir conversión.
          </div>
        </div>
      </div>

      {/* Gráficos mini */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">
                Usuarios / visitas por día
              </div>
              <div className="text-xs text-neutral-600">Últimos 7 días</div>
            </div>
            <div className="text-xs text-neutral-500">escala automática</div>
          </div>
          <div className="mt-4">
            <MiniBars data={visitasPorDia} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Ventas por día</div>
              <div className="text-xs text-neutral-600">Últimos 7 días</div>
            </div>
            <div className="text-xs text-neutral-500">S/ por día</div>
          </div>
          <div className="mt-4">
            <MiniBars data={ventasPorDia} />
          </div>
        </div>
      </div>

      {/* Tablas */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">
            Top productos (vistas/ventas)
          </div>
          <div className="mt-4 space-y-3">
            {topProductos.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-900">
                    {p.nombre}
                  </div>
                  <div className="text-xs text-neutral-600">
                    ID: <span className="font-mono">{p.id}</span> • Conversión:{" "}
                    <span className="font-medium">
                      {p.conversionPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <div className="rounded-md border px-2 py-1 text-xs">
                    <span className="text-neutral-500">Vistas: </span>
                    <span className="font-medium">{p.vistas}</span>
                  </div>
                  <div className="rounded-md border px-2 py-1 text-xs">
                    <span className="text-neutral-500">Compras: </span>
                    <span className="font-medium">{p.compras}</span>
                  </div>
                  <div className="rounded-md border px-2 py-1 text-xs">
                    <span className="text-neutral-500">Leads: </span>
                    <span className="font-medium">{p.leadsWhatsapp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Productos sin ventas</div>
          <div className="mt-1 text-xs text-neutral-600">
            Buenos para revisar fotos, precio, stock o posición en home.
          </div>

          <div className="mt-4 space-y-3">
            {productosSinVentas.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-900">
                    {p.nombre}
                  </div>
                  <div className="text-xs text-neutral-600">
                    ID: <span className="font-mono">{p.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <div className="rounded-md border px-2 py-1 text-xs">
                    <span className="text-neutral-500">Vistas: </span>
                    <span className="font-medium">{p.vistas}</span>
                  </div>
                  <div className="rounded-md border px-2 py-1 text-xs">
                    <span className="text-neutral-500">Leads: </span>
                    <span className="font-medium">{p.leadsWhatsapp}</span>
                  </div>
                  <div className="rounded-md border px-2 py-1 text-xs">
                    <span className="text-neutral-500">Compras: </span>
                    <span className="font-semibold text-red-600">
                      {p.compras}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold">Alertas</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {alerts.map((a, idx) => (
            <div
              key={idx}
              className={[
                "rounded-lg border p-3 text-sm",
                a.type === "warn"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-blue-200 bg-blue-50 text-blue-900",
              ].join(" ")}
            >
              {a.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
