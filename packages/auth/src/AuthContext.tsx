import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthProvider, AuthStatus, User } from "./types";
import { createOAuth2ProxyProvider } from "./providers/oauth2-proxy";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Convenience flag; if `true`, `user` exists */
  isAuthenticated: boolean;
  /** `true` during the initial check; use to avoid a login/logout flash. */
  isLoading: boolean;
  login: (returnTo?: string) => void;
  logout: (returnTo?: string) => void;
  /** Re-run the auth check, e.g. after the tab regains focus. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthContextProviderProps extends PropsWithChildren {
  provider?: AuthProvider;
}

export function AuthContextProvider({
  children,
  provider,
}: AuthContextProviderProps) {
  const impl = useMemo(
    () => provider ?? createOAuth2ProxyProvider(),
    [provider],
  );

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const resolved = await impl.getUser();
      setUser(resolved);
      setStatus(resolved ? "authenticated" : "unauthenticated");
    } catch (err) {
      console.error("[@atlas/auth] failed to resolve current user", err);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [impl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      login: (returnTo) => impl.login(returnTo),
      logout: (returnTo) => impl.logout(returnTo),
      refresh,
    }),
    [status, user, impl, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used within an <AuthContextProvider>");
  }
  return ctx;
}
