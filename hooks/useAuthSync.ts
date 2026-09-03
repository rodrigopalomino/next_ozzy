"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { ApiItemResponse } from "@/types/ApiResponse";
import { UsuarioSesion } from "@/types/Usuario";

export function useAuthSync() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setError = useAuthStore((s) => s.setError);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    let active = true;

    async function sync() {
      setLoading(true);

      try {
        // `/auth/me` devuelve el payload del JWT (cuatro campos, sin fechas)
        // envuelto en el contrato estándar: el usuario está en `data`, no en
        // la raíz. Sin desenvolverlo, el store guardaba `{status, message,
        // data}` en vez del usuario.
        const respuesta = await api
          .get("auth/me")
          .json<ApiItemResponse<UsuarioSesion>>();
        const user = respuesta.data;

        if (!active) return;

        console.log("🟢 Sesión válida:", user);
        setUser(user);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!active) return;

        console.log("🔴 No hay sesión o expiró:", err.message);

        reset();
        setError(err);

        router.replace("/login");
      } finally {
        if (active) {
          setLoading(false);
          setHydrated(true);
        }
      }
    }

    sync();

    return () => {
      active = false;
    };
  }, [router, setUser, setLoading, setHydrated, reset, setError]);
}
