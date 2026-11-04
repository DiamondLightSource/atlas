import { AuthContextProvider, type AuthProvider } from "@atlas/auth";
import type { ReactNode } from "react";
import { render } from "@atlas/vitest-conf";

const testAuthProvider: AuthProvider = {
  getUser: vi.fn().mockResolvedValue({ id: "1", name: "Bob" }),
  login: vi.fn(),
  logout: vi.fn(),
};

export function renderWithProviders(ui: ReactNode) {
  return render(
    <AuthContextProvider provider={testAuthProvider}>{ui}</AuthContextProvider>,
  );
}
