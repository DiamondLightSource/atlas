import { useMemo } from "react";
import { useAuth } from "./AuthContext";

export type AccessTokenGetter = () => Promise<string | null>;

/** Wraps a fetch so that every call carries a fresh `Authorization: Bearer` header. */
export function createAuthenticatedFetch(getAccessToken: AccessTokenGetter) {
  return async function authenticatedFetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
  ): Promise<Response> {
    const token = await getAccessToken();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  };
}

export function useAuthenticatedFetch() {
  const { getAccessToken } = useAuth();
  return useMemo(
    () => createAuthenticatedFetch(getAccessToken),
    [getAccessToken],
  );
}
