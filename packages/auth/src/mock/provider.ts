import type { AuthProvider, User } from "../types";

const MOCK_USER_KEY = "atlas-auth:mock-user";

const defaultMockUser: User = {
  id: "jbi14214",
  name: "Joe Bloggs",
  email: "joe.bloggs@diamond.ac.uk",
  preferred_username: "Joe",
};

function setMockUser(user: Partial<User> = {}): User {
  const merged: User = { ...defaultMockUser, ...user };
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(merged));
  return merged;
}

function clearMockUser(): void {
  localStorage.removeItem(MOCK_USER_KEY);
}

function getMockUser(): User | null {
  const raw = localStorage.getItem(MOCK_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * Fully in-browser AuthProvider for local dev.
 */
export function createMockAuthProvider(): AuthProvider {
  return {
    async getUser() {
      return getMockUser();
    },
    login(returnTo) {
      setMockUser();
      window.location.assign(
        returnTo ?? window.location.pathname + window.location.search,
      );
    },
    logout(returnTo) {
      clearMockUser();
      window.location.assign(
        returnTo ?? window.location.pathname + window.location.search,
      );
    },
  };
}
