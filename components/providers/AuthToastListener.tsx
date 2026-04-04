"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const LOGIN_SUCCESS_VALUE = "login-success";

export function AuthToastListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handledSearch = useRef<string | null>(null);

  useEffect(() => {
    const serializedParams = searchParams.toString();

    if (handledSearch.current === serializedParams) {
      return;
    }

    const authState = searchParams.get("auth");

    if (authState !== LOGIN_SUCCESS_VALUE) {
      handledSearch.current = serializedParams;
      return;
    }

    handledSearch.current = serializedParams;
    toast.success("Inicio de sesion exitoso.", {
      description: "Tu cuenta esta activa y lista para continuar.",
    });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("auth");

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}