"use client";

import { UsuarioSesion } from "@/types/Usuario";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // `UsuarioSesion` y no `Usuario`: lo que llega de `/auth/me` es el payload
  // del JWT (id, username, rol, activo), sin las fechas de la fila.
  user: UsuarioSesion | null;
  loading: boolean; // solo para saber si /auth/me está en curso
  hydrated: boolean; // 🔥 indica si ya intentamos sincronizar la sesión
  error: unknown;

  // acciones
  setUser: (user: UsuarioSesion | null) => void;
  setLoading: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  setError: (err: unknown) => void;

  login: (user: UsuarioSesion) => void;
  logout: () => void;
  reset: () => void; // 🔥 limpia todo al detectar 401
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      hydrated: false,
      error: null,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setHydrated: (hydrated) => set({ hydrated }),
      setError: (error) => set({ error }),

      login: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          error: null,
          loading: false,
          hydrated: true,
        }),

      reset: () =>
        set({
          user: null,
          error: null,
          loading: false,
          hydrated: true,
        }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user }), // solo guardar user
    },
  ),
);
