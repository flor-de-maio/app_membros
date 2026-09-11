"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch, getUserToken, clearUserToken, AuthError } from "@/lib/auth";
import type { Usuario } from "@/lib/types";

/**
 * Client-side auth gate for the member area pages (ranking/reading-rats/perfil/admin
 * and the locked feed/biblioteca/desafios stubs).
 *
 * On mount (client-only, via useEffect - never touches localStorage during
 * server render), redirects to /login if no token is stored. If a token is
 * present, validates it against GET /api/auth/me; on 401 the token is
 * cleared and the user is redirected to /login.
 *
 * The resolved user is cached under the react-query key ["/api/auth/me"],
 * so any component can refresh it after a mutation that changes points via
 * `queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] })`.
 */
export function useAuthGuard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (!getUserToken()) {
      router.replace("/login");
    } else {
      setHasToken(true);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: usuario,
    isLoading,
    isError,
    error,
  } = useQuery<Usuario>({
    queryKey: ["/api/auth/me"],
    queryFn: () => authFetch("/api/auth/me"),
    enabled: hydrated && hasToken,
    // Retry transient failures (network hiccups, cold-start) - only a real
    // 401 means the session is invalid.
    retry: (failureCount, err) => !(err instanceof AuthError && err.status === 401) && failureCount < 3,
  });

  useEffect(() => {
    if (hydrated && hasToken && isError && error instanceof AuthError && error.status === 401) {
      clearUserToken();
      router.replace("/login");
    }
  }, [hydrated, hasToken, isError, error, router]);

  const loading = !hydrated || (hasToken && isLoading);

  return {
    usuario: usuario ?? null,
    loading,
    refetchUsuario: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
  };
}
