import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
  type SubscribeFunction,
  type GraphQLResponse,
  Observable,
} from "relay-runtime";
import { createClient } from "graphql-ws";

const HTTP_ENDPOINT = "/api/graphql";
const WS_ENDPOINT = "/api/graphql/ws";

const fetchFn: FetchFunction = async (request, variables) => {
  const resp = await fetch(HTTP_ENDPOINT, {
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

  return (await resp.json()) as GraphQLResponse;
};

export const wsClient = createClient({
  url: WS_ENDPOINT,
  shouldRetry: () => true,
  connectionParams: undefined,
  webSocketImpl: WebSocket,
});

const subscribeFn: SubscribeFunction = (operation, variables) => {
  return Observable.create(sink => {
    const cleanup = wsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text ?? "",
        variables,
      },
      {
        next: response => {
          const data = response.data;

          if (data) {
            sink.next({ data } as GraphQLResponse);
          } else if (data == null) {
            console.warn("Data is null:", response);
          } else {
            console.error("Subscription error response:", response);
            sink.error(new Error("Subscription response missing data"));
          }
        },
        error: sink.error.bind(sink),
        complete: sink.complete.bind(sink),
      },
    );

    return cleanup;
  });
};

let RelayEnvironment: Environment | null = null;

export async function getRelayEnvironment(): Promise<Environment> {
  if (!RelayEnvironment) {
    RelayEnvironment = new Environment({
      network: Network.create(fetchFn, subscribeFn),
      store: new Store(new RecordSource()),
    });
  }
  return RelayEnvironment;
}
