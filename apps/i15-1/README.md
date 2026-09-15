# i15-1 App

The initial aim of this app to provide a science facing UI for the waffle project. As more features are added that have generic use they should be pulled into more common areas.

## Running Locally

To run this locally:

1.  Start the devcontainer in VSCode
1.  To make sure you have the most up-to-date environment either run `pnpm install` in the container or rebuild the container (via the Ctrl+Shift+P menu in VSCode)
1.  In a terminal in this devcontainer run either:
    - If wanting to test against local services (see [here](https://github.com/DiamondLightSource/daq-queuing-service#daq_queuing_service) for spinning up local serives) run using `VITE_USE_LOCAL=true turbo dev --filter @atlas/i15-1`, **OR**
    - If you want to test against mocked behaviour run `turbo dev --filter @atlas/i15-1`
1.  Navigate to http://localhost:5173/

## Updating Queue Types

You can generate types from the queue API automatically using the following command:

`pnpm --filter i15-1 generate:queue`

This will generate from main on GitHub, to target a branch, use:

`npx @hey-api/openapi-ts -i https://raw.githubusercontent.com/DiamondLightSource/daq-queuing-service/{BRANCH_NAME}/docs/reference/rest_api.json -o /workspaces/atlas/apps/i15-1/generated/queue`

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

## Viewing Camera Streams on Firefox

1. Ensure you are on the beamline network
1. Type `about:config` in the address bar and press the return key.
1. Click `Accpt the Risk and Continue` on the warning screen.
1. Search for the following preference `security.mixed_content.upgrade_display_content.image` and change the value to `false`.
