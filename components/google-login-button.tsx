"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

import { useLoginGoogle } from "@/hooks/cliente/useSesionCliente";

/**
 * Botón de Google Identity Services.
 *
 * El `idToken` que devuelve Google se manda al back, que lo verifica y setea
 * la cookie httpOnly de cliente. El front nunca guarda el token.
 */

interface CredencialGoogle {
  credential?: string;
}

interface IdentidadGoogle {
  accounts: {
    id: {
      initialize: (opciones: {
        client_id: string;
        callback: (respuesta: CredencialGoogle) => void;
      }) => void;
      renderButton: (
        contenedor: HTMLElement,
        opciones: Record<string, unknown>,
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: IdentidadGoogle;
  }
}

export default function GoogleLoginButton({
  onLogin,
}: {
  onLogin?: () => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const contenedor = useRef<HTMLDivElement>(null);
  const [sdkListo, setSdkListo] = useState(false);
  const login = useLoginGoogle();

  const alRecibirCredencial = useCallback(
    (respuesta: CredencialGoogle) => {
      if (!respuesta.credential) return;

      login.mutate(respuesta.credential, {
        onSuccess: () => onLogin?.(),
      });
    },
    [login, onLogin],
  );

  useEffect(() => {
    if (!sdkListo || !clientId || !contenedor.current) return;

    const google = window.google;
    if (!google) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: alRecibirCredencial,
    });

    google.accounts.id.renderButton(contenedor.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      locale: "es",
      width: 280,
    });
  }, [sdkListo, clientId, alRecibirCredencial]);

  // Sin client id no se puede iniciar el flujo: se dice, en vez de pintar un
  // botón que no va a funcionar.
  if (!clientId) {
    return (
      <p className="text-xs text-neutral-500">
        El inicio de sesión con Google no está configurado.
      </p>
    );
  }

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => setSdkListo(true)}
      />

      <div ref={contenedor} />

      {login.isPending ? (
        <p className="mt-2 text-xs text-neutral-500">Iniciando sesión...</p>
      ) : null}

      {login.isError ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          No se pudo iniciar sesión. Intenta de nuevo.
        </p>
      ) : null}
    </div>
  );
}
