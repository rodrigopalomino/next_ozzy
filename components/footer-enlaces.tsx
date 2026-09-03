"use client";

import { useConfiguracion } from "@/hooks/tienda/useTienda";

/**
 * Enlaces de contacto del footer, tomados de `GET /configuracion`.
 *
 * Una clave sin configurar llega como cadena vacía: en ese caso el enlace no
 * se pinta, en vez de dejar un `wa.me/` sin número o un perfil inexistente.
 */
export default function FooterEnlaces() {
  const { data } = useConfiguracion();
  const config = data?.data;

  const numero = (config?.["whatsapp.numero"] ?? "").replace(/\D/g, "");

  const enlaces = [
    numero ? { etiqueta: "Pedir por WhatsApp", href: `https://wa.me/${numero}` } : null,
    config?.["redes.instagram"]
      ? { etiqueta: "Instagram", href: config["redes.instagram"] }
      : null,
    config?.["redes.tiktok"]
      ? { etiqueta: "TikTok", href: config["redes.tiktok"] }
      : null,
    config?.["redes.facebook"]
      ? { etiqueta: "Facebook", href: config["redes.facebook"] }
      : null,
  ].filter((e): e is { etiqueta: string; href: string } => e !== null);

  if (enlaces.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {enlaces.map((enlace) => (
        <a
          key={enlace.etiqueta}
          href={enlace.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/20"
        >
          {enlace.etiqueta}
        </a>
      ))}
    </div>
  );
}
