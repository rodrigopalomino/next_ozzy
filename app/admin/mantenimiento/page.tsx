"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";

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
  useBorrarHuerfanas,
  useHuerfanas,
  useRecalcularPrecios,
} from "@/hooks/admin/useAdmin";

/**
 * Mantenimiento. Las dos acciones destructivas van separadas de las normales
 * y ninguna se ejecuta sin listar antes qué se va a tocar.
 */
export default function MantenimientoPage() {
  // El listado no se pide al entrar: es una operación sobre el bucket y sólo
  // tiene sentido cuando el usuario la pide.
  const [analizar, setAnalizar] = useState(false);
  const huerfanas = useHuerfanas(analizar);
  const borrar = useBorrarHuerfanas();
  const recalcular = useRecalcularPrecios();

  const [confirmando, setConfirmando] = useState(false);
  const datos = huerfanas.data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mantenimiento</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Tareas de limpieza. Revisa siempre el detalle antes de ejecutar.
        </p>
      </div>

      {/* Recalcular precios: no destructiva */}
      <Card>
        <CardHeader>
          <CardTitle>Recalcular precios</CardTitle>
          <CardDescription>
            Recalcula el precio «desde» de cada producto a partir de sus
            variantes. Útil si algún precio no cuadra con la ficha.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => recalcular.mutate()}
            disabled={recalcular.isPending}
          >
            {recalcular.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recalculando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalcular
              </>
            )}
          </Button>

          {recalcular.isSuccess ? (
            <span className="text-sm text-emerald-700">
              Precios recalculados.
            </span>
          ) : null}
          {recalcular.isError ? (
            <span className="text-sm text-red-700" role="alert">
              {recalcular.error.message}
            </span>
          ) : null}
        </CardContent>
      </Card>

      {/* Imágenes huérfanas: destructiva */}
      <Card className="border-amber-300">
        <CardHeader>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <CardTitle>Imágenes huérfanas</CardTitle>
              <CardDescription>
                Archivos en el almacenamiento que ya no pertenecen a ningún
                producto. Borrarlos elimina los archivos de forma permanente.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={() => {
              setAnalizar(true);
              void huerfanas.refetch();
            }}
            disabled={huerfanas.isFetching}
          >
            {huerfanas.isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analizar almacenamiento
              </>
            )}
          </Button>

          {huerfanas.isFetching ? <Skeleton className="h-32 w-full" /> : null}

          {huerfanas.isError ? (
            <p className="text-sm text-red-700" role="alert">
              No se pudo analizar. Revisa que tengas sesión de administrador.
            </p>
          ) : null}

          {datos && !huerfanas.isFetching ? (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { etiqueta: "En el bucket", valor: datos.objetosEnBucket },
                  { etiqueta: "En uso", valor: datos.referenciadas },
                  { etiqueta: "Huérfanas", valor: datos.huerfanas },
                  {
                    etiqueta: "Recuperable",
                    valor: `${datos.espacioRecuperableMB} MB`,
                  },
                ].map((dato) => (
                  <div
                    key={dato.etiqueta}
                    className="rounded-lg border border-neutral-200 p-3"
                  >
                    <p className="text-xs text-neutral-600">{dato.etiqueta}</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums">
                      {dato.valor}
                    </p>
                  </div>
                ))}
              </div>

              {datos.huerfanas > 0 ? (
                <>
                  {/* Se listan las rutas: la confirmación tiene que mostrar
                      qué se borra, no sólo cuántas. `ejemplos` puede ser una
                      muestra, así que se dice cuántas se están viendo. */}
                  {datos.ejemplos.length > 0 ? (
                    <div className="max-h-48 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                      <ul className="space-y-1 font-mono text-xs text-neutral-700">
                        {datos.ejemplos.map((clave) => (
                          <li key={clave} className="truncate">
                            {clave}
                          </li>
                        ))}
                      </ul>
                      {datos.ejemplos.length < datos.huerfanas ? (
                        <p className="mt-2 font-sans text-xs text-neutral-500">
                          Mostrando {datos.ejemplos.length} de{" "}
                          {datos.huerfanas}.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <p className="text-xs text-neutral-500">
                    Sólo se consideran huérfanas las que no se han modificado
                    hace poco, para no borrar una subida en curso.
                  </p>

                  <Button
                    variant="destructive"
                    onClick={() => setConfirmando(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Borrar {datos.huerfanas}{" "}
                    {datos.huerfanas === 1 ? "archivo" : "archivos"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-emerald-700">
                  No hay imágenes huérfanas: nada que limpiar.
                </p>
              )}
            </>
          ) : null}

          {borrar.isSuccess ? (
            <p className="text-sm text-emerald-700">Archivos eliminados.</p>
          ) : null}
          {borrar.isError ? (
            <p className="text-sm text-red-700" role="alert">
              {borrar.error.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrar imágenes huérfanas</DialogTitle>
            <DialogDescription>
              Se eliminarán <strong>{datos?.huerfanas ?? 0}</strong> archivos
              del almacenamiento, liberando{" "}
              {datos?.espacioRecuperableMB ?? 0} MB. Los archivos se borran de
              forma permanente y no se pueden recuperar.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={borrar.isPending}
              onClick={() =>
                borrar.mutate(undefined, {
                  onSuccess: () => setConfirmando(false),
                })
              }
            >
              {borrar.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Borrando...
                </>
              ) : (
                "Sí, borrar permanentemente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
