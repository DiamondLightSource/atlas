import { useMemo } from "react";
import { useAuth } from "./AuthContext";

export type LoginFn = (returnTo?: string) => void;

/**
 * Wraps login() so it fires at most once,
 * no matter how many requests 401 around the same time
 * i.e. a page that fires off three API calls in parallel
 * when the session has expired shouldn't try to navigate
 * away three times - the first 401 wins, the rest are
 * no-ops.
 */
function guardLoginOnce(login: LoginFn): () => void {
  let fired = false;
  return () => {
    if (fired) return;
    fired = true;
    login(window.location.pathname + window.location.search);
  };
}

/**
 * Wraps a fetch so a 401 response triggers a real navigation to login.
 */
export function createFetchLoginRedirect(
  login: LoginFn,
  fetchImpl: typeof fetch = fetch,
) {
  const triggerRedirect = guardLoginOnce(login);

  return async function fetchWithLoginRedirect(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const res = await fetchImpl(input, init);
    if (res.status === 401) {
      triggerRedirect();
    }
    return res;
  };
}

/** Same as createFetchWithLoginRedirect, wired to the current AuthContext */
export function useFetchWithLoginRedirect() {
  const { login } = useAuth();
  return useMemo(() => createFetchLoginRedirect(login), [login]);
}

export { guardLoginOnce };
