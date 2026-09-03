import CarritoDrawer from "@/components/carrito-drawer";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import "./globals.css";
import { Inter, Sora } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable}`}>
      <body className="antialiased">
        <ReactQueryProvider>
          {children}
          {/* Montado una vez: lo abren el header, la ficha y las tarjetas. */}
          <CarritoDrawer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
