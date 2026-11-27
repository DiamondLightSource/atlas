# @atlas/instrument-session

Tracks which instrument session (visit) an Atlas application is working under.

`@atlas/instrument-session` provides:

- An `InstrumentSessionProvider` that makes the available sessions and the chosen one available to the component tree.
- A `useInstrumentSession()` hook to read and change the chosen session.

The list of available sessions can come from either of two sources:

- **Discovered** — queried from the supergraph through Relay, as the logged-in user's in-progress sessions on the instrument.
- **Fixed** — passed in directly, for applications without a Relay environment or with a known set of sessions.

The chosen session is remembered per instrument in `localStorage`, so it survives page reloads.

## Installation

Add the package to your application (called `@atlas/myApp` in this example) from the monorepo workspace:

```bash
pnpm add @atlas/instrument-session -F @atlas/myApp --workspace
```

`react-relay` and `relay-runtime` are peer dependencies and must be installed in the application, even if it only uses a fixed list of sessions:

```bash
pnpm add -F @atlas/myApp react-relay relay-runtime
```

The package ships its compiled Relay query, so your application does **not** need to run `relay-compiler` or use `babel-plugin-relay` for it.

## Usage

### Discovering sessions with Relay

Without a `sessions` prop, the provider queries the supergraph for the user's in-progress sessions on `instrument`. This requires, above the provider:

- A `RelayEnvironmentProvider`, typically using the environment from [`@atlas/supergraph`](../supergraph/README.md).
- An `AuthContextProvider` from [`@atlas/auth`](../auth/README.md). The query is only sent once the user is authenticated, and is re-sent if they log in again.

```tsx
import { AuthContextProvider } from "@atlas/auth";
import { InstrumentSessionProvider } from "@atlas/instrument-session";
import { createRelayEnvironment } from "@atlas/supergraph";
import { RelayEnvironmentProvider } from "react-relay";
import { authProvider } from "./auth";

const relayEnvironment = createRelayEnvironment(authProvider);

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AuthContextProvider provider={authProvider}>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <InstrumentSessionProvider instrument="I08-1">
          {children}
        </InstrumentSessionProvider>
      </RelayEnvironmentProvider>
    </AuthContextProvider>
  );
}
```

`instrument` is the instrument key as known to the supergraph, e.g. `"I08-1"`. Discovered session references are lower-cased, e.g. `"cm12345-1"`.

The provider does not suspend; while the query is in flight, `loading` is `true` and `instrumentSessionList` is `null`. If the query fails, the failure is exposed as `error` rather than thrown.

### Passing in known sessions

Pass a `sessions` list to use those sessions instead of querying. No Relay environment or auth provider is needed for this:

```tsx
import { InstrumentSessionProvider } from "@atlas/instrument-session";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <InstrumentSessionProvider
      instrument="P48"
      sessions={["cm44196-1", "cm44196-2"]}
    >
      {children}
    </InstrumentSessionProvider>
  );
}
```

`instrument` is still required, as it keys the remembered choice in `localStorage`.

### Reading and choosing the session

Within the provider tree, use `useInstrumentSession()`:

```tsx
import { useInstrumentSession } from "@atlas/instrument-session";

export function SessionPicker() {
  const {
    instrumentSession,
    setInstrumentSession,
    instrumentSessionList,
    loading,
    error,
  } = useInstrumentSession();

  if (loading) return <p>Loading sessions…</p>;
  if (error) return <p>Could not load sessions: {error.message}</p>;
  if (!instrumentSessionList?.length) return <p>No sessions available</p>;

  return (
    <select
      value={instrumentSession ?? ""}
      onChange={(event) => setInstrumentSession(event.target.value)}
    >
      <option value="" disabled>
        Choose a session
      </option>
      {instrumentSessionList.map((session) => (
        <option key={session} value={session}>
          {session}
        </option>
      ))}
    </select>
  );
}
```

| Field                   | Type                        | Description                                                          |
| ----------------------- | --------------------------- | -------------------------------------------------------------------- |
| `instrumentSession`     | `string \| null`            | Session to run under, or `null` if none is available or chosen.      |
| `setInstrumentSession`  | `(session: string) => void` | Choose a session and remember it for this instrument.                |
| `instrumentSessionList` | `string[] \| null`          | Sessions available to the user, or `null` if not (yet) known.        |
| `loading`               | `boolean`                   | `true` while sessions are being discovered. Always `false` if fixed. |
| `error`                 | `Error \| null`             | Why discovering sessions failed, if it did.                          |

`useInstrumentSession()` throws if called outside an `InstrumentSessionProvider`.

### Which session is chosen

`instrumentSession` is resolved from the available sessions as follows:

1. The session last chosen on this instrument, if it is still available.
2. Otherwise, the only available session, if there is exactly one.
3. Otherwise `null` — the user needs to pick one with `setInstrumentSession`.
