import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from "relay-runtime";

const HTTP_DEFAULT_ENDPOINT = "/api/supergraph";

const fetchFunction: FetchFunction = async (request, variables) => {
  const resp = await fetch(HTTP_DEFAULT_ENDPOINT, {
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

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFunction),
    store: new Store(new RecordSource()),
  });
}

export const relayEnvironment = createRelayEnvironment();
