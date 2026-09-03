"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCupones, useCuponAcciones } from "@/hooks/admin/useAdmin";
import { formatearPrecio } from "@/lib/catalogo";
import type { CuponAdmin, CuponBody } from "@/types/admin";

/** `2026-09-03T00:00:00Z` -> `2026-09-03`, para un `<input type="date">`. */
const aFecha = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

/** El back espera string ISO, no `Date`. */
const aIso = (fecha: string) =>
  fecha ? new Date(`${fecha}T00:00:00`).toISOString() : null;

const VACIO: CuponBody = {
  codigo: "",
  porcentaje: null,
  montoFijo: null,
  iniciaEn: null,
  terminaEn: null,
  usoMaximo: null,
  activo: true,
};

export default function CuponesPage() {
  const { data, isLoading, isError } = useCupones({ limit: 100 });
  const { crear, actualizar, eliminar } = useCuponAcciones();

  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<CuponAdmin | null>(null);
  const [form, setForm] = useState<CuponBody>(VACIO);
  // `porcentaje` y `montoFijo` son excluyentes en el back.
  const [tipo, setTipo] = useState<"porcentaje" | "montoFijo">("porcentaje");
  const [porBorrar, setPorBorrar] = useState<CuponAdmin | null>(null);

  const cupones = data?.data ?? [];
  const guardando = crear.isPending || actualizar.isPending;
  const error = crear.error ?? actualizar.error;

  const abrirNuevo = () => {
    setEditando(null);
    setForm(VACIO);
    setTipo("porcentaje");
    setAbierto(true);
  };

  const abrirEdicion = (cupon: CuponAdmin) => {
    setEditando(cupon);
    setForm({
      codigo: cupon.codigo,
      porcentaje: cupon.porcentaje,
      montoFijo: cupon.montoFijo,
      iniciaEn: cupon.iniciaEn,
      terminaEn: cupon.terminaEn,
      usoMaximo: cupon.usoMaximo,
      activo: cupon.activo,
    });
    setTipo(cupon.montoFijo !== null ? "montoFijo" : "porcentaje");
    setAbierto(true);
  };

  const guardar = () => {
    // Se manda sólo el tipo elegido y el otro en null, porque son excluyentes.
    const body: CuponBody = {
      ...form,
      codigo: form.codigo.trim().toUpperCase(),
      porcentaje: tipo === "porcentaje" ? form.porcentaje : null,
      montoFijo: tipo === "montoFijo" ? form.montoFijo : null,
    };

    const alTerminar = { onSuccess: () => setAbierto(false) };

    if (editando) actualizar.mutate({ id: editando.id, body }, alTerminar);
    else crear.mutate(body, alTerminar);
  };

  const vigencia = (cupon: CuponAdmin) => {
    const desde = cupon.iniciaEn ? aFecha(cupon.iniciaEn) : null;
    const hasta = cupon.terminaEn ? aFecha(cupon.terminaEn) : null;
    if (!desde && !hasta) return "Sin límite";
    return `${desde ?? "—"} → ${hasta ?? "—"}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cupones</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Descuentos por código. Se consumen cuando un lead se marca como
            vendido.
          </p>
        </div>

        <Button onClick={abrirNuevo}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cupón
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : isError ? (
            <p className="text-sm text-red-700">
              No se pudieron cargar los cupones. Revisa que tengas sesión de
              administrador.
            </p>
          ) : cupones.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Todavía no hay cupones. Crea el primero con el botón de arriba.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cupones.map((cupon) => (
                    <TableRow key={cupon.id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => abrirEdicion(cupon)}
                          className="font-mono font-semibold hover:underline"
                        >
                          {cupon.codigo}
                        </button>
                      </TableCell>

                      <TableCell className="tabular-nums">
                        {cupon.porcentaje !== null
                          ? `${cupon.porcentaje}%`
                          : cupon.montoFijo !== null
                            ? formatearPrecio(cupon.montoFijo)
                            : "—"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-xs text-neutral-600">
                        {vigencia(cupon)}
                      </TableCell>

                      <TableCell className="tabular-nums text-xs">
                        {cupon.usos}
                        {cupon.usoMaximo !== null ? ` / ${cupon.usoMaximo}` : ""}
                      </TableCell>

                      <TableCell>
                        {cupon.activo ? (
                          <Badge>Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPorBorrar(cupon)}
                          aria-label={`Eliminar cupón ${cupon.codigo}`}
                        >
                          <Trash2 className="h-4 w-4 text-neutral-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alta y edición */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? `Editar ${editando.codigo}` : "Nuevo cupón"}
            </DialogTitle>
            <DialogDescription>
              El descuento es por porcentaje o por monto fijo, no ambos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                placeholder="VERANO20"
                className="mt-1.5 font-mono uppercase"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipo === "porcentaje" ? "default" : "outline"}
                size="sm"
                onClick={() => setTipo("porcentaje")}
              >
                Porcentaje
              </Button>
              <Button
                type="button"
                variant={tipo === "montoFijo" ? "default" : "outline"}
                size="sm"
                onClick={() => setTipo("montoFijo")}
              >
                Monto fijo
              </Button>
            </div>

            {tipo === "porcentaje" ? (
              <div>
                <Label htmlFor="porcentaje">Porcentaje de descuento</Label>
                <Input
                  id="porcentaje"
                  type="number"
                  min={1}
                  max={100}
                  value={form.porcentaje ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      porcentaje: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="montoFijo">Monto fijo (S/)</Label>
                <Input
                  id="montoFijo"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.montoFijo ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      montoFijo: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="iniciaEn">Desde</Label>
                <Input
                  id="iniciaEn"
                  type="date"
                  value={aFecha(form.iniciaEn ?? null)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, iniciaEn: aIso(e.target.value) }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="terminaEn">Hasta</Label>
                <Input
                  id="terminaEn"
                  type="date"
                  value={aFecha(form.terminaEn ?? null)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, terminaEn: aIso(e.target.value) }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usoMaximo">Usos máximos (vacío = sin límite)</Label>
              <Input
                id="usoMaximo"
                type="number"
                min={1}
                value={form.usoMaximo ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    usoMaximo: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="activo"
                checked={form.activo ?? true}
                onCheckedChange={(activo) => setForm((f) => ({ ...f, activo }))}
              />
              <Label htmlFor="activo">Activo</Label>
            </div>

            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={guardando || !form.codigo.trim()}>
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de borrado */}
      <Dialog
        open={porBorrar !== null}
        onOpenChange={(a) => !a && setPorBorrar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cupón</DialogTitle>
            <DialogDescription>
              Se eliminará <strong>{porBorrar?.codigo}</strong>
              {porBorrar && porBorrar.usos > 0
                ? `, que ya se usó ${porBorrar.usos} ${porBorrar.usos === 1 ? "vez" : "veces"}`
                : ""}
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPorBorrar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={eliminar.isPending}
              onClick={() => {
                if (!porBorrar) return;
                eliminar.mutate(porBorrar.id, {
                  onSuccess: () => setPorBorrar(null),
                });
              }}
            >
              {eliminar.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
