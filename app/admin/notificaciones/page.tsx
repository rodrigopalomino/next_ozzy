"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Play, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDestinatarios,
  useNotificacionAcciones,
  useNotificaciones,
} from "@/hooks/admin/useAdmin";

const texto = (valor: unknown) =>
  valor === null || valor === undefined ? "—" : String(valor);

export default function NotificacionesPage() {
  const cola = useNotificaciones({ limit: 50 });
  const destinatarios = useDestinatarios();
  const { difundir, reintentar, procesar } = useNotificacionAcciones();

  const [confirmando, setConfirmando] = useState(false);

  const items = cola.data?.data ?? [];
  const cuantos = destinatarios.data?.data.destinatarios ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notificaciones</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Cola de correos y envío de novedades.
        </p>
      </div>

      {/* Difundir: envía correo real */}
      <Card className="border-amber-300">
        <CardHeader>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <CardTitle>Enviar novedades</CardTitle>
              <CardDescription>
                Manda un correo a los clientes que aceptaron recibir novedades.
                Una vez enviado no se puede deshacer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-3">
          {destinatarios.isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={() => setConfirmando(true)}
                disabled={cuantos === 0}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar a {cuantos}{" "}
                {cuantos === 1 ? "cliente" : "clientes"}
              </Button>

              {cuantos === 0 ? (
                <span className="text-sm text-neutral-500">
                  Ningún cliente aceptó recibir novedades todavía.
                </span>
              ) : null}
            </>
          )}

          {difundir.isSuccess ? (
            <span className="text-sm text-emerald-700">Correos encolados.</span>
          ) : null}
          {difundir.isError ? (
            <span className="text-sm text-red-700" role="alert">
              {difundir.error.message}
            </span>
          ) : null}
        </CardContent>
      </Card>

      {/* Cola */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Cola de envío</CardTitle>
            <CardDescription>
              Normalmente la procesa una tarea programada; aquí se puede forzar.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => procesar.mutate()}
            disabled={procesar.isPending}
          >
            {procesar.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Procesar ahora
          </Button>
        </CardHeader>

        <CardContent>
          {cola.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : cola.isError ? (
            <p className="text-sm text-red-700">
              No se pudo cargar la cola. Revisa que tengas sesión de
              administrador.
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-neutral-500">La cola está vacía.</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {items.map((item, idx) => {
                const id = Number(item.id ?? idx);
                const estado = texto(item.estado);
                const fallido = estado.toUpperCase().includes("FALL");

                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {texto(item.asunto ?? item.tipo)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-600">
                        {texto(item.destinatario ?? item.email)} · {estado}
                      </p>
                    </div>

                    {fallido ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reintentar.mutate(id)}
                        disabled={reintentar.isPending}
                      >
                        Reintentar
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar novedades</DialogTitle>
            <DialogDescription>
              Se enviará un correo a <strong>{cuantos}</strong>{" "}
              {cuantos === 1 ? "cliente" : "clientes"} que aceptaron recibir
              novedades. Los correos enviados no se pueden retirar.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={difundir.isPending}
              onClick={() =>
                difundir.mutate(undefined, {
                  onSuccess: () => setConfirmando(false),
                })
              }
            >
              {difundir.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                `Sí, enviar a ${cuantos}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
