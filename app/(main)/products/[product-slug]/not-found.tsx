import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
      <h1 className="text-3xl font-bold">Product Not Found</h1>
      <p className="mt-3 text-muted-foreground">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/products">Browse All Products</Link>
      </Button>
    </div>
  );
}
