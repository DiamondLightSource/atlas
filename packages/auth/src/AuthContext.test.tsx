import React from "react";
import { renderHook, waitFor } from "@atlas/vitest-conf";
import { AuthContextProvider, useAuth } from "./AuthContext";
import type { AuthProvider, User } from "./types";

function createFakeProvider(
  overrides: Partial<AuthProvider> = {},
): AuthProvider {
  return {
    getUser: vi.fn().mockResolvedValue(null),
    getAccessToken: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

function wrapperFor(provider: AuthProvider) {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthContextProvider provider={provider}>{children}</AuthContextProvider>
  );
}

describe("useAuth", () => {
  it("throws when used outside AuthContextProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthContextProvider/);
  });

  it("resolves to authenticated when getUser() returns a user", async () => {
    const user: User = { id: "1", name: "Steve" };
    const provider = createFakeProvider({
      getUser: vi.fn().mockResolvedValue(user),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapperFor(provider),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  it("resolves to unauthenticated when getUser() returns null", async () => {
    const provider = createFakeProvider({
      getUser: vi.fn().mockResolvedValue(null),
    });
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapperFor(provider),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("resolves to unauthenticated (not stuck loading), when getUser() rejects", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const provider = createFakeProvider({
      getUser: vi.fn().mockRejectedValue(new Error("network down")),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapperFor(provider),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    consoleError.mockRestore();
  });

  it("delegates to the provider with the given returnTo on login()/logout()", async () => {
    const provider = createFakeProvider();
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapperFor(provider),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.login("/next");
    expect(provider.login).toHaveBeenCalledWith("/next");

    result.current.logout("/bye");
    expect(provider.logout).toHaveBeenCalledWith("/bye");
  });

  it("re-runs the check and updates state on refresh()", async () => {
    const getUser = vi.fn().mockResolvedValue(null);
    const provider = createFakeProvider({ getUser });
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapperFor(provider),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);

    getUser.mockResolvedValue({ id: "2", name: "Grace" });
    await result.current.refresh();

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toEqual({ id: "2", name: "Grace" });
  });
});
