import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="site-shell py-20 text-center">
      <h1 className="text-3xl font-bold">Producto no encontrado</h1>
      <p className="mt-3 text-muted-foreground">
        El producto que buscas no existe o fue eliminado.
      </p>
      <Button asChild className="mt-6">
        <Link href="/products">Ver todos los productos</Link>
      </Button>
    </div>
  );
}
