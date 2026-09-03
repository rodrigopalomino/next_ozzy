"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import GoogleLoginButton from "@/components/google-login-button";
import {
  useClienteActual,
  useLogoutCliente,
} from "@/hooks/cliente/useSesionCliente";

/**
 * Acceso de cliente en el header: entrar con Google o ver la cuenta.
 *
 * Es la sesión de la tienda, sin relación con el panel: desde aquí no se llega
 * a `/admin` ni se comparte estado con su store.
 */
export default function ClienteMenu() {
  const { data: cliente, isLoading } = useClienteActual();
  const logout = useLogoutCliente();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const alClicFuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", alClicFuera);
    window.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      window.removeEventListener("keydown", alPulsar);
    };
  }, [abierto]);

  // Mientras se resuelve la sesión no se pinta nada: mostrar "Entrar" y
  // cambiarlo a un avatar medio segundo después da un parpadeo peor que la
  // espera.
  if (isLoading) {
    return <div className="h-9 w-9 shrink-0" aria-hidden="true" />;
  }

  return (
    <div className="relative shrink-0" ref={contenedor}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label={cliente ? "Tu cuenta" : "Entrar"}
        className="inline-flex items-center gap-2 rounded-full p-2 text-white hover:bg-white/15"
      >
        {cliente?.avatar ? (
          <Image
            src={cliente.avatar}
            alt=""
            width={24}
            height={24}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      {abierto ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-lg"
        >
          {cliente ? (
            <>
              <p className="truncate text-sm font-semibold">
                {cliente.nombre ?? "Tu cuenta"}
              </p>
              <p className="mt-0.5 truncate text-xs text-neutral-600">
                {cliente.email}
              </p>

              <div className="mt-3 flex flex-col gap-1 border-t border-neutral-200 pt-3 text-sm">
                <Link
                  href="/favoritos"
                  onClick={() => setAbierto(false)}
                  className="rounded-lg px-2 py-1.5 hover:bg-neutral-100"
                  role="menuitem"
                >
                  Mis favoritos
                </Link>
                <Link
                  href="/carrito"
                  onClick={() => setAbierto(false)}
                  className="rounded-lg px-2 py-1.5 hover:bg-neutral-100"
                  role="menuitem"
                >
                  Mi carrito
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout.mutate();
                    setAbierto(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-neutral-600 hover:bg-neutral-100"
                  role="menuitem"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Entrar a tu cuenta</p>
              <p className="mt-1 text-xs text-neutral-600">
                Guarda tus favoritos y tu carrito para pedir después.
              </p>

              <div className="mt-3">
                <GoogleLoginButton onLogin={() => setAbierto(false)} />
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
