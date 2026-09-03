"use client";

import { create } from "zustand";

/**
 * Apertura del drawer del carrito.
 *
 * Vive en un store y no en el componente porque lo abren sitios que no son su
 * padre: el icono del header, el botón «Agregar al carrito» de la ficha y las
 * tarjetas de la grilla. Sólo guarda si está abierto — el contenido lo trae
 * react-query.
 */
interface CarritoDrawerState {
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  alternar: () => void;
}

export const useCarritoDrawer = create<CarritoDrawerState>((set) => ({
  abierto: false,
  abrir: () => set({ abierto: true }),
  cerrar: () => set({ abierto: false }),
  alternar: () => set((s) => ({ abierto: !s.abierto })),
}));
