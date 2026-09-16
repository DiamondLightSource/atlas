import {
  createMockAuthProvider,
  createOAuth2ProxyProvider,
  type AuthProvider,
} from "@atlas/auth";

export const authProvider: AuthProvider = import.meta.env.DEV
  ? createMockAuthProvider()
  : createOAuth2ProxyProvider();
