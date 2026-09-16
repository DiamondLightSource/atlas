import { useMemo } from "react";
import { useAuth } from "./AuthContext";

export interface RelayFetchFunctionOptions {
  url: string;
}

/** Loosely matching Relay's RequestParameters */
interface RelayRequestParams {
  text?: string | null;
  id?: string | null;
}

export function createRelayFetchFunction(
  getAccessToken: () => Promise<string | null>,
  { url }: RelayFetchFunctionOptions,
) {
  return async function fetchGraphQL(
    params: RelayRequestParams,
    variables: Record<string, unknown>,
  ) {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        query: params.text,
        variables,
        ...(params.id ? { documentId: params.id } : {}),
      }),
    });

    if (!res.ok) {
      throw new Error(`GraphQL request to ${url} failed: ${res.status}`);
    }

    return res.json();
  };
}

/** Same as createRelayFetchFunction, wired to the current AuthContext. */
export function useRelayFetchFunction(options: RelayFetchFunctionOptions) {
  const { getAccessToken } = useAuth();
  // Depend on options.url rather than the whole options object, so an
  // inline `{ url: "/api/supergraph" }` literal doesn't rebuild this every render.
  return useMemo(
    () => createRelayFetchFunction(getAccessToken, options),
    [getAccessToken, options.url],
  );
}
