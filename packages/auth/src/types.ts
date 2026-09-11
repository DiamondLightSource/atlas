/**
 * Shape of the authenticated user. Just the fields the app actually
 * uses — everything else from the underlying claims is passed through
 * as extra properties so no need to touch this type every time a new claim becomes useful.
 */
export interface User {
  id: string;
  name?: string;
  email?: string;
  [claim: string]: unknown;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthProvider {
  /** Resolve the current user, or null if there isn't one. */
  getUser(): Promise<User | null>;

  /** Kick off the login flow (may redirect the browser). */
  login(returnTo?: string): void;

  /** Kick off the logout flow (may redirect the browser). */
  logout(returnTo?: string): void;
}
