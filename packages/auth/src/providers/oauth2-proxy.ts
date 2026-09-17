import type { AuthProvider, User } from "../types";

const USERINFO_ENDPOINT = "/oauth2/userinfo";
const HEADERS_CHECK_ENDPOINT = "/auth/me";
const LOGIN_ENDPOINT = "/oauth2/start";
const LOGOUT_ENDPOINT = "/oauth2/sign_out";

const IDENTITY_HEADER = "identity";

/**
 * Decodes the base64url-encoded id_token that oauth2-proxy injects via:
 *
 *   injectResponseHeaders:
 *     - name: Identity
 *       values:
 *         - claim: id_token
 *
 * We don't verify the signature here — oauth2-proxy already did that
 * before it let the request through. This is just for reading claims
 * (name, email, etc.) on the client.
 */
function decodeJwtPayload(headerValue: string): User | null {
  try {
    const payload = headerValue.split(".")[1];
    if (!payload) return null;

    // JWTs are base64url, not plain base64 — normalize before atob().
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (err) {
    console.error("[@atlas/auth] failed to decode JWT header", err);
    return null;
  }
}

function normalizeClaims(claims: Record<string, unknown>): User {
  return {
    ...claims,
    id: (claims.sub as string) ?? (claims.email as string) ?? "unknown",
    name:
      (claims.name as string) ??
      (claims.preferred_username as string) ??
      undefined,
    email: claims.email as string | undefined,
  };
}

export function createOAuth2ProxyProvider(): AuthProvider {
  async function fetchUserInfo() {
    const res = await fetch(USERINFO_ENDPOINT, { credentials: "include" });

    if (res.status === 401) {
      return { res, authenticated: false as const };
    }
    if (!res.ok) {
      throw new Error(
        `Unexpected response from ${USERINFO_ENDPOINT}: ${res.status}`,
      );
    }
    return { res, authenticated: true as const };
  }

  return {
    async getUser() {
      const { res, authenticated } = await fetchUserInfo();

      if (!authenticated) return null;

      const idHeaderRes = await fetch(HEADERS_CHECK_ENDPOINT, {
        credentials: "include",
      });

      // Preferred: the injected Identity header (full id_token claims).
      // fetch() header lookups are case-insensitive, so "identity" is fine.
      const identityHeader = idHeaderRes.headers.get(IDENTITY_HEADER);
      if (identityHeader) {
        const claims = decodeJwtPayload(identityHeader);
        if (claims) return normalizeClaims(claims);
      }

      // Fallback: oauth2-proxy's own /oauth2/userinfo JSON body, in case
      // the header isn't present (e.g. proxy config changes, local dev
      // without the header injection set up).
      const body = await res.json().catch(() => null);
      return body ? normalizeClaims(body) : null;
    },

    login(returnTo) {
      const rd = returnTo ?? window.location.pathname + window.location.search;
      window.location.href = `${LOGIN_ENDPOINT}?rd=${encodeURIComponent(rd)}`;
    },

    logout(returnTo) {
      const rd = returnTo ?? window.location.pathname + window.location.search;
      window.location.href = `${LOGOUT_ENDPOINT}?rd=${encodeURIComponent(rd)}`;
    },
  };
}
