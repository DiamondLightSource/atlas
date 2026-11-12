import { createFetchLoginRedirect, type AuthProvider } from "@atlas/auth";
import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from "relay-runtime";

const HTTP_DEFAULT_ENDPOINT = "/api/supergraph";

function createFetchFunction(authProvider?: AuthProvider): FetchFunction {
  
  const fetchImpl = authProvider
    ? createFetchLoginRedirect(authProvider.login)
    : fetch;

  return async (request, variables) => {
    const resp = await fetchImpl(HTTP_DEFAULT_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept:
          "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: request.text,
        variables,
      }),
    });

    if (!resp.ok) {
      throw new Error(
        `Supergraph request failed: ${resp.status} ${resp.statusText}`,
      );
    }

    return resp.json();
  };
}

/**
 * Creates a Relay environment.
 * If an auth provider is supplied, requests will redirect to login on 401.
 */
export function createRelayEnvironment(authProvider?: AuthProvider) {
  return new Environment({
    network: Network.create(createFetchFunction(authProvider)),
    store: new Store(new RecordSource()),
  });
}