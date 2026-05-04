import type { AuthenticatedUserDto, AuthenticationResultDto } from "@/lib/api";



type StoredSession = {

  accessToken: string;

  expiresAtUtc: string;

  user: AuthenticatedUserDto;

};



const SESSION_KEY = "vetra.auth.session";



function isBrowser() {

  return typeof window !== "undefined";

}



export function saveSession(result: AuthenticationResultDto): void {

  if (!isBrowser()) return;

  try {

    const { accessToken, expiresAtUtc } = result.tokens;

    if (typeof accessToken !== "string" || typeof expiresAtUtc !== "string" || expiresAtUtc.length === 0) {

      return;

    }

    const session: StoredSession = {

      accessToken,

      expiresAtUtc,

      user: result.user,

    };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  } catch {

    // Ignore storage failures (quota/privacy mode)

  }

}



export function getSession(): StoredSession | null {

  if (!isBrowser()) return null;

  try {

    const raw = window.localStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSession>;

    if (

      typeof parsed.accessToken !== "string" ||

      typeof parsed.expiresAtUtc !== "string" ||

      parsed.expiresAtUtc.length === 0 ||

      !parsed.user

    ) {

      return null;

    }

    return {

      accessToken: parsed.accessToken,

      expiresAtUtc: parsed.expiresAtUtc,

      user: parsed.user,

    };

  } catch {

    return null;

  }

}



export function clearSession(): void {

  if (!isBrowser()) return;

  try {

    window.localStorage.removeItem(SESSION_KEY);

  } catch {

    // Ignore storage failures

  }

}



export function isAuthenticated(): boolean {

  const session = getSession();

  if (!session) return false;

  const expiresAtMs = Date.parse(session.expiresAtUtc);

  if (!Number.isFinite(expiresAtMs)) return false;

  return expiresAtMs > Date.now();

}

