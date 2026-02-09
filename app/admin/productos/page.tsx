import { Suspense } from "react";
import PageProductos from "@/components/aca";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <PageProductos />
    </Suspense>
  );
}
