# @atlas/auth

A small authentication abstraction for apps in the Atlas monorepo.

`@atlas/auth` provides a common authentication API independent of the underlying auth implementation. Applications interact with a single React context and `useAuth()` hook, while the actual authentication mechanism is supplied through an `AuthProvider`.

Two providers are currently available:

- OAuth2 Proxy — used by Atlas applications in production.
- Mock — intended for local development and development-mode applications.

The package also provides helpers for automatically redirecting users to login when API requests receive a `401 Unauthorized` response.

## Installation

Install the package through the monorepo's normal workspace dependency mechanism:

```bash
pnpm add @atlas/auth --workspace -F @atlas/myapp
```

## Authentication model

The package separates authentication into two layers:

An `AuthProvider` implements the mechanics of resolving, logging in, and logging out a user.

`AuthContextProvider` exposes that implementation to React components through `useAuth()`.

This means application code does not need to know whether authentication is backed by OAuth2 Proxy, the mock provider, or another implementation added in the future.

```
┌──────────────────────────┐
│       React App          │
│                          │
│       useAuth()          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│   AuthContextProvider    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      AuthProvider        │
├────────────┬─────────────┤
│ OAuth2     │    Mock     │
│ Proxy      │   Provider  │
└────────────┴─────────────┘
```

## Quick start

Choose an auth provider when bootstrapping the application:

```ts
import {
  AuthContextProvider,
  createMockAuthProvider,
  createOAuth2ProxyProvider,
} from "@atlas/auth";


const authProvider = import.meta.env.DEV
  ? createMockAuthProvider()
  : createOAuth2ProxyProvider();

<AuthContextProvider provider={authProvider}>
  <App />
</AuthContextProvider>;
```

The rest of the application can use the same API regardless of which provider was selected.

## Using authentication in a component

Within the `AuthContextProvider` tree:

```ts
import { useAuth } from "@atlas/auth";

function UserGreeting() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  return <span>Hello, {user?.name ?? "there"}!</span>;
}
```

isLoading is particularly useful during the initial authentication check. It allows applications to avoid briefly displaying an unauthenticated UI before the current authentication state has been resolved.

## Handling API 401 responses

Authentication state and API authentication failures are related but separate concerns.

`@atlas/auth` provides helpers for automatically initiating the login flow when an API request receives a 401 Unauthorized response.

There are helpers for both the native fetch API and Axios: `createFetchLoginRedirect` and `createAxiosWithLoginRedirect`.

The package also provides React hooks that bind this behaviour to the authentication context: `useFetchWithLoginRedirect` and `useAxiosWithLoginRedirect`.

This allows API clients to automatically redirect an unauthenticated user to login without each API call needing to implement its own 401 handling.
