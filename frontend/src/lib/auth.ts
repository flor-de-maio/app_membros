// Auth helpers for the member area (login/registro/ranking/reading-rats/perfil/admin).
// Uses localStorage (not sessionStorage) so member sessions persist across
// browser restarts.

const TOKEN_KEY = "fdm_user_token";

export function getUserToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setUserToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearUserToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// Distinguishes "the token is actually invalid" (401 - safe to log out) from
// network hiccups / server errors (NOT safe to log out).
export class AuthError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export async function authFetch(path: string, options: RequestInit = {}) {
  // FormData bodies (e.g. check-ins with a photo) must NOT get an explicit
  // Content-Type - fetch needs to set its own multipart boundary.
  const isFormData = options.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${getUserToken()}`,
        ...options.headers,
      },
    });
  } catch {
    // Network failure (offline, DNS, cold-start) - not a token problem.
    throw new AuthError("Erro de conexão");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new AuthError(data.error ?? "Erro", res.status);
  }
  // 200s with an empty body (e.g. some POST endpoints) shouldn't blow up on .json().
  return res.json().catch(() => ({}));
}

export { TOKEN_KEY };
