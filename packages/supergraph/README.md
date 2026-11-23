# `@atlas/supergraph`

Shared Relay client configuration for accessing the Diamond Light Source federated GraphQL supergraph from React applications.

`@atlas/supergraph` provides:

- A shared Relay environment configured to communicate with the supergraph.
- The canonical supergraph GraphQL schema used by the Relay compiler.
- Common HTTP configuration for communicating with the supergraph.

Applications define their own GraphQL queries and fragments and compile them locally using Relay Compiler. Generated Relay artifacts remain application-specific.

## Installation

Install the Relay runtime and React bindings in your application (called `@atlas/myApp` in this example):

```bash
pnpm add -F @atlas/myApp react-relay relay-runtime
```

Then add `@atlas/supergraph` to the application from the monorepo workspace:

```bash
pnpm add @atlas/supergraph -F myApp --workspace
```

Relay Compiler is a development dependency of the application, since each application compiles its own GraphQL operations:

```bash
pnpm add -D relay-compiler -F @atlas/myApp
```

## Relay Compiler configuration

Create `relay.config.json` in your application root:

```json
{
  "src": "./src",
  "language": "typescript",
  "schema": "../../packages/supergraph/supergraph.graphql",
  "exclude": ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
  "eagerEsModules": true
}
```

Add a Relay compiler script to your application's `package.json`:

```json
{
  "scripts": {
    "relay": "relay-compiler"
  }
}
```

You can then compile the application's GraphQL operations with:

```bash
pnpm relay
```

## Using the Relay environment

`@atlas/supergraph` exports a `createRelayEnvironment` factory function. Each application should create its own Relay environment, optionally passing an [`AuthProvider`](../auth/README.md) to enable authentication and automatic login redirects on 401 responses.:

```tsx
import { RelayEnvironmentProvider } from "react-relay";
import { createRelayEnvironment } from "@atlas/supergraph";
import { authProvider } from "./auth";

const relayEnvironment = createRelayEnvironment(authProvider);

export function App() {
  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      {/* Application */}
    </RelayEnvironmentProvider>
  );
}
```
The authentication provider is optional. If omitted, requests use the standard `fetch` implementation without automatic login redirects.

The environment is configured to communicate with the supergraph at `/api/supergraph`.

## Writing and using a query

### 1. Write the query

Define a GraphQL query using the `graphql` tag from `react-relay`. The query is validated against the shared supergraph schema when the Relay compiler runs.

For example:

```tsx
import { graphql } from "react-relay";

const instrumentSessionQuery = graphql`
  query InstrumentSessionQuery($instrumentKey: String!) {
    instrumentByKey(key: $instrumentKey) {
      instrumentSessions(filterBy: { state: { eq: IN_PROGRESS } }) {
        edges {
          node {
            instrumentSessionReference
          }
        }
      }
    }
  }
`;
```

The query can be placed wherever it is used by the application. Relay Compiler will find GraphQL operations in the application's configured src directory.

### 2. Compile the query

Run Relay Compiler:

```bash
pnpm -F @atlas/myApp relay
```

The compiler:

- validates the query against the shared supergraph schema;
- generates TypeScript types for the query variables and response data;
- generates the Relay artifact required by the Relay runtime.

For the example above, this produces:

```
./ # wherever the above query exists
└── __generated__/
    └── InstrumentSessionQuery.graphql.ts
```

The generated files should not be edited manually.

### 3. Use the generated types with the query

Import the generated query type and use it with `useLazyLoadQuery`:

```tsx
import { useLazyLoadQuery } from "react-relay";
import type {
  InstrumentSessionQuery,
  InstrumentSessionQuery$data as InstrumentSessionQueryData,
} from "./__generated__/InstrumentSessionQuery.graphql";

const data: InstrumentSessionQueryData =
  useLazyLoadQuery<InstrumentSessionQuery>(instrumentSessionQuery, {
    instrumentKey: "I14",
  });
```

`InstrumentSessionQuery` is the generated type describing the query and its variables, while `InstrumentSessionQuery$data` describes the shape of the data returned by the query.

The `instrumentSessionQuery` value itself is the original `graphql` expression. Relay uses the compiler-generated artifact associated with that expression when executing the query.
