"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import PaginationBar from "@/components/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditoria } from "@/hooks/admin/useAdmin";
import { parsearCambios, type AuditoriaSalida } from "@/types/admin";

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const comoTexto = (valor: unknown) => {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
};

/**
 * Fila de auditoría con el detalle plegado.
 *
 * `cambios` llega como string JSON sin parsear. Si tiene la forma
 * `{ campo: { antes, despues } }` se pinta como tabla de diferencias; si no,
 * se muestra el texto crudo en vez de romper la fila.
 */
function Fila({ registro }: { registro: AuditoriaSalida }) {
  const [abierto, setAbierto] = useState(false);
  const diferencias = parsearCambios(registro.cambios);
  const tieneDetalle = Boolean(registro.cambios);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          disabled={!tieneDetalle}
          aria-expanded={abierto}
          className="mt-0.5 shrink-0 text-neutral-500 disabled:opacity-30"
          aria-label={abierto ? "Ocultar detalle" : "Ver detalle"}
        >
          {abierto ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{registro.accion}</Badge>
            <span className="text-sm font-medium">
              {registro.entidad}
              <span className="ml-1 font-mono text-xs text-neutral-500">
                #{registro.entidadId}
              </span>
            </span>
          </div>

          <p className="mt-1 text-xs text-neutral-600">
            {/* `usuarioNombre` es el nombre en el momento del cambio: sigue
                sirviendo aunque el usuario se haya borrado. */}
            {registro.usuarioNombre ?? "Sistema"}
            {registro.ip ? ` · ${registro.ip}` : ""}
          </p>
        </div>

        <span className="shrink-0 whitespace-nowrap text-xs text-neutral-500">
          {fecha(registro.createdAt)}
        </span>
      </div>

      {abierto && tieneDetalle ? (
        <div className="mt-3 ml-7 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          {diferencias ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-neutral-600">
                  <th className="pb-1.5 pr-4 font-semibold">Campo</th>
                  <th className="pb-1.5 pr-4 font-semibold">Antes</th>
                  <th className="pb-1.5 font-semibold">Después</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {Object.entries(diferencias).map(([campo, cambio]) => (
                  <tr key={campo}>
                    <td className="py-1.5 pr-4 font-mono">{campo}</td>
                    <td className="py-1.5 pr-4 text-red-700">
                      {comoTexto(cambio.antes)}
                    </td>
                    <td className="py-1.5 text-emerald-700">
                      {comoTexto(cambio.despues)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-neutral-700">
              {registro.cambios}
            </pre>
          )}
        </div>
      ) : null}
    </li>
  );
}

function AuditoriaContenido() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const { data, isLoading, isError } = useAuditoria({ page, limit: 30 });
  const registros = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Quién cambió qué y cuándo.{" "}
          {meta ? `${meta.total} registros.` : ""}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : isError ? (
            <p className="text-sm text-red-700">
              No se pudo cargar la auditoría. Revisa que tengas sesión de
              administrador.
            </p>
          ) : registros.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Todavía no hay registros.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {registros.map((registro) => (
                <Fila key={registro.id} registro={registro} />
              ))}
            </ul>
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

export default function AuditoriaPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AuditoriaContenido />
    </Suspense>
  );
}
