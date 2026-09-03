"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useActualizarConfiguracion,
  useConfiguracionAdmin,
} from "@/hooks/admin/useAdmin";
import type { ConfiguracionEntrada } from "@/types/admin";

/**
 * Las claves de plantilla llevan texto largo con variables; el resto son
 * valores de una línea.
 */
const esPlantilla = (clave: string) => clave.includes("plantilla");

/** Agrupa por el prefijo de la clave (`whatsapp.numero` -> `whatsapp`). */
const grupoDe = (clave: string) => clave.split(".")[0] ?? "otros";

const TITULOS: Record<string, string> = {
  whatsapp: "WhatsApp",
  tienda: "Tienda",
  redes: "Redes sociales",
  envio: "Envíos",
};

/** `whatsapp.moneda_simbolo` -> `Moneda simbolo`. */
const etiquetaDe = (clave: string) => {
  const sufijo = clave.slice(clave.indexOf(".") + 1).replace(/_/g, " ");
  return sufijo.charAt(0).toUpperCase() + sufijo.slice(1);
};

export default function ConfiguracionPage() {
  const { data, isLoading, isError } = useConfiguracionAdmin();
  const guardar = useActualizarConfiguracion();

  // Sólo se mandan las claves tocadas: el PATCH acepta un objeto parcial.
  const [cambios, setCambios] = useState<Record<string, string>>({});

  const entradas = data?.data ?? [];
  const hayCambios = Object.keys(cambios).length > 0;

  const valorDe = (entrada: ConfiguracionEntrada) =>
    cambios[entrada.clave] ?? entrada.valor;

  const alGuardar = () => {
    if (!hayCambios) return;
    guardar.mutate(cambios, { onSuccess: () => setCambios({}) });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-sm text-red-700">
          No se pudo cargar la configuración. Revisa que tengas sesión de
          administrador.
        </CardContent>
      </Card>
    );
  }

  // Se agrupa por prefijo, conservando el orden en que las manda el servidor.
  const grupos = entradas.reduce<Record<string, ConfiguracionEntrada[]>>(
    (acc, entrada) => {
      const grupo = grupoDe(entrada.clave);
      (acc[grupo] ??= []).push(entrada);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Configuración de la tienda</h1>
          <p className="mt-1 text-sm text-neutral-600">
            El número de WhatsApp, las redes y el texto de los mensajes. Los
            cambios se aplican de inmediato en la tienda.
          </p>
        </div>

        <Button onClick={alGuardar} disabled={!hayCambios || guardar.isPending}>
          {guardar.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar
              {hayCambios ? ` (${Object.keys(cambios).length})` : ""}
            </>
          )}
        </Button>
      </div>

      {guardar.isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700" role="alert">
            No se pudo guardar. {guardar.error.message}
          </CardContent>
        </Card>
      ) : null}

      {guardar.isSuccess && !hayCambios ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6 text-sm text-emerald-800">
            Configuración guardada.
          </CardContent>
        </Card>
      ) : null}

      {Object.entries(grupos).map(([grupo, items]) => (
        <Card key={grupo}>
          <CardHeader>
            <CardTitle>{TITULOS[grupo] ?? grupo}</CardTitle>
            {grupo === "whatsapp" ? (
              <CardDescription>
                Sin número de WhatsApp, el botón de pedido no se muestra en la
                tienda.
              </CardDescription>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-5">
            {items.map((entrada) => (
              <div key={entrada.clave}>
                <Label htmlFor={entrada.clave}>{etiquetaDe(entrada.clave)}</Label>

                {esPlantilla(entrada.clave) ? (
                  <Textarea
                    id={entrada.clave}
                    rows={4}
                    value={valorDe(entrada)}
                    onChange={(e) =>
                      setCambios((c) => ({
                        ...c,
                        [entrada.clave]: e.target.value,
                      }))
                    }
                    className="mt-1.5 font-mono text-xs"
                  />
                ) : (
                  <Input
                    id={entrada.clave}
                    value={valorDe(entrada)}
                    onChange={(e) =>
                      setCambios((c) => ({
                        ...c,
                        [entrada.clave]: e.target.value,
                      }))
                    }
                    className="mt-1.5"
                  />
                )}

                {/* La descripción del back documenta las variables
                    disponibles en las plantillas. */}
                {entrada.descripcion ? (
                  <p className="mt-1.5 text-xs text-neutral-500">
                    {entrada.descripcion}
                  </p>
                ) : null}

                <p className="mt-1 font-mono text-[10px] text-neutral-400">
                  {entrada.clave}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
