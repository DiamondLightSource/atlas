# i15-1 App

The initial aim of this app to provide a science facing UI for the waffle project. As more features are added that have generic use they should be pulled into more common areas.

## Running Locally

To run this locally:

1.  Start the devcontainer in VSCode
1.  To make sure you have the most up-to-date environment either run `pnpm install` in the container or rebuild the container (via the Ctrl+Shift+P menu in VSCode)
1.  In a terminal in this devcontainer run either:
    - `VITE_QUEUE_MODE=local turbo dev --filter @atlas/i15-1` if running a local queue server on http://127.0.0.1:8001, **OR**
    - `turbo dev --filter @atlas/i15-1` to use mocked backends
1.  Navigate to http://localhost:5173/

## Updating Supergraph Schema Types

1. Navigate to app containing folder (i.e. `.../atlas/apps/i15-1`)
1. Update the `supergraph.graphql` schema from most recent `supergraph.graphql` schema from https://github.com/DiamondLightSource/graph-federation/releases
1. Generate types by running `pnpm run generate:graphql`

The available types are generated based on queries detected in the documents (`[./src/**/*.ts*]`), so if a new query is added you will need to generate the types again. Type names will be automatically generated based on your query name. To use, follow the example below:

1. Add a new query

```ts
import { gql } from "@apollo/client";

export const myNewQuery = gql`
  query GetSessionPlaylist($proposal: Int!, $session: Int!) {
    instrumentSession(
      proposalNumber: $proposal
      instrumentSessionNumber: $session
    ) {
      state
    }
  }
`;
```

2. Generate types by running `pnpm run generate:graphql`. This will generate a new `.generated.ts` file with the types.
3. Use query and types in your component.

```ts
import { useQuery } from "@apollo/client/react";
import type { TypedDocumentNode } from "@apollo/client";

import { myNewQuery } from "../graphql/myNewQuery";
import type {
  myNewQueryVariables,
  myNewQuery,
} from "../graphql/getSessionPlaylistQuery.generated";

const GET_EXPERIMENTS: TypedDocumentNode<
  myNewQuery,
  myNewQueryVariables
> = myNewQuery;

export function QueryData() {
  const { data, loading, error } = useQuery(GET_EXPERIMENTS, {
    variables: {
      proposal: 44163,
      session: 3,
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return data?.instrumentSession?.state || [];
}
```
