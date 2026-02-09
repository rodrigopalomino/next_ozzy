"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Usuario } from "@/types/Usuario";

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
        const user = await api.get("auth/me").json<Usuario>();

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
