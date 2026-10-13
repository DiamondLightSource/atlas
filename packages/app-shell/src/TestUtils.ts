import type { AuthProvider } from "@atlas/auth";

/**
 * An auth provider resolving into an authenticated user.
 * However, context always starts with a "loading" status,
 * so RTL assertions will need to be async with screen.find...
 */
export const testAuthProvider: AuthProvider = {
  getUser: vi.fn().mockResolvedValue({ id: "1", name: "Bob" }),
  login: vi.fn(),
  logout: vi.fn(),
};
