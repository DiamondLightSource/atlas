import { createAuthenticatedFetch } from "@atlas/auth";
import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from "relay-runtime";
import { authProvider } from "./auth";

const HTTP_ENDPOINT = "/api/supergraph";
const authenticatedFetch = createAuthenticatedFetch(
  authProvider.getAccessToken,
);
const fetchFn: FetchFunction = async (request, variables) => {
  const resp = await authenticatedFetch(HTTP_ENDPOINT, {
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

  return await resp.json();
};

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
