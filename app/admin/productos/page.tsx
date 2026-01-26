import { Suspense } from "react";
import PageAca from "@/components/aca";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <PageAca />
    </Suspense>
  );
}
