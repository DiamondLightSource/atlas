import { createMockAuthProvider, createOAuth2ProxyProvider } from "@atlas/auth";

export const authProvider = import.meta.env.DEV
  ? createMockAuthProvider()
  : createOAuth2ProxyProvider();
