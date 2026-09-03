"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";

import LeadEstado from "@/components/admin/lead-estado";
import PaginationBar from "@/components/pagination-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useConversion,
  useEmbudoLead,
  useLeads,
  useMetricasLead,
} from "@/hooks/admin/useLeads";
import { formatearPrecio } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import { embudoCompleto, type EstadoLead } from "@/types/admin";

const COLOR_ETAPA: Record<EstadoLead, string> = {
  NUEVO: "bg-sky-500",
  CONTACTADO: "bg-amber-500",
  VENDIDO: "bg-emerald-600",
  PERDIDO: "bg-neutral-400",
};

const ETIQUETA_ETAPA: Record<EstadoLead, string> = {
  NUEVO: "Nuevos",
  CONTACTADO: "Contactados",
  VENDIDO: "Vendidos",
  PERDIDO: "Perdidos",
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function Metrica({ titulo, valor, pie }: { titulo: string; valor: string; pie?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium text-neutral-600">{titulo}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
        {pie ? <p className="mt-0.5 text-xs text-neutral-500">{pie}</p> : null}
      </CardContent>
    </Card>
  );
}

const DIAS_VENTANA = 30;

function LeadsContenido() {
  const searchParams = useSearchParams();
  // La página vive en la URL, igual que en la vitrina: así `PaginationBar`
  // navega de verdad y el estado es compartible.
  const page = Number(searchParams.get("page") ?? 1) || 1;
  const dias = DIAS_VENTANA;

  const metricas = useMetricasLead(dias);
  const embudo = useEmbudoLead(dias);
  const conversion = useConversion(10);
  const listado = useLeads({ page, limit: 20 });

  const m = metricas.data?.data;
  const e = embudo.data?.data;
  const leads = listado.data?.data ?? [];
  const meta = listado.data?.meta;

  // El servidor sólo manda los estados que tienen leads: para un embudo de
  // cuatro columnas fijas hay que rellenar los ausentes con 0.
  const etapas = e ? embudoCompleto(e.porEstado) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads de WhatsApp</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Cada clic en «Pedir por WhatsApp» queda registrado aquí. Últimos{" "}
          {dias} días.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : (
          <>
            <Metrica
              titulo="Total histórico"
              valor={String(m?.total ?? 0)}
            />
            <Metrica
              titulo={`Últimos ${dias} días`}
              valor={String(m?.enVentana ?? 0)}
            />
            <Metrica
              titulo="Tasa de cierre"
              valor={`${e?.tasaCierre ?? 0}%`}
              pie="Vendidos sobre el total"
            />
            <Metrica
              titulo="En el embudo"
              valor={String(e?.total ?? 0)}
            />
          </>
        )}
      </div>

      {/* Embudo */}
      <Card>
        <CardHeader>
          <CardTitle>Embudo</CardTitle>
          <CardDescription>
            En qué etapa está cada lead. Los porcentajes los calcula el
            servidor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {embudo.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <div className="space-y-3">
              {etapas.map((etapa) => (
                <div key={etapa.estado}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">
                      {ETIQUETA_ETAPA[etapa.estado]}
                    </span>
                    <span className="tabular-nums text-neutral-600">
                      {etapa.leads} · {etapa.porcentaje}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={cn("h-full rounded-full", COLOR_ETAPA[etapa.estado])}
                      style={{ width: `${etapa.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Origen */}
        <Card>
          <CardHeader>
            <CardTitle>Por origen</CardTitle>
            <CardDescription>Desde dónde llegó el clic.</CardDescription>
          </CardHeader>
          <CardContent>
            {m?.porOrigen.length ? (
              <ul className="space-y-2 text-sm">
                {m.porOrigen.map((o) => (
                  <li key={o.origen} className="flex justify-between">
                    <span className="text-neutral-700">{o.origen}</span>
                    <span className="font-semibold tabular-nums">{o.leads}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Sin datos todavía.</p>
            )}
          </CardContent>
        </Card>

        {/* Conversión por producto */}
        <Card>
          <CardHeader>
            <CardTitle>Conversión por producto</CardTitle>
            <CardDescription>
              Cuántas visitas acabaron en un clic de WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversion.data?.data.productos.length ? (
              <ul className="space-y-2 text-sm">
                {conversion.data.data.productos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="truncate text-neutral-700">{p.nombre}</span>
                    <span className="shrink-0 tabular-nums text-neutral-600">
                      {/* Numerador y denominador junto al ratio: un 3.5%
                          sobre 340 visitas dice más que el ratio solo. */}
                      {p.leads} de {p.vistas}
                      <span className="ml-2 font-semibold text-neutral-900">
                        {p.conversion}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">
                Sin visitas registradas todavía.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listado */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los leads</CardTitle>
          <CardDescription>
            {meta ? `${meta.total} en total` : "Cargando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listado.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : listado.isError ? (
            <p className="text-sm text-red-700">
              No se pudieron cargar los leads. Revisa que tengas sesión de
              administrador.
            </p>
          ) : leads.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Todavía no hay leads. Aparecerán cuando alguien pida por
              WhatsApp.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Precio visto</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="whitespace-nowrap text-xs text-neutral-600">
                        {fecha(lead.createdAt)}
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/producto/${lead.producto.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-medium hover:underline"
                        >
                          {lead.producto.nombre}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      </TableCell>

                      <TableCell className="text-xs text-neutral-600">
                        {lead.variante
                          ? `${lead.variante.color.nombre} · ${lead.variante.talla.etiqueta}`
                          : "—"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-xs tabular-nums">
                        {/* Precio en el momento del clic, no el actual. */}
                        {lead.precioMostrado !== null
                          ? formatearPrecio(Number(lead.precioMostrado))
                          : "—"}
                      </TableCell>

                      <TableCell className="text-xs text-neutral-600">
                        {lead.origen}
                      </TableCell>

                      <TableCell>
                        <LeadEstado lead={lead} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {meta && meta.totalPages > 1 ? (
            <div className="mt-6 flex justify-center">
              <PaginationBar current={meta.page} totalPages={meta.totalPages} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={<Skeleton className="h-96 w-full" />}
    >
      <LeadsContenido />
    </Suspense>
  );
}
