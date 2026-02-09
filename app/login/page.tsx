"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const u = username.trim();
    const p = password;

    if (!u) return setMsg("Ingresa tu username.");
    if (!p) return setMsg("Ingresa tu contraseña.");

    try {
      setLoading(true);

      await api.post("auth/login", {
        json: { username: u, password: p },
        credentials: "include", // 🔑 importante para cookies
      });

      // 🚀 el store se hidrata SOLO al entrar a /admin
      router.replace("/admin");
    } catch (err: any) {
      setMsg(err?.message ?? "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-50 px-4 text-black">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Ingresa tu usuario y contraseña.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">
              Username
            </label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {msg && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
