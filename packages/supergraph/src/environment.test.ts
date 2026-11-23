import { Environment } from "relay-runtime";
import { createRelayEnvironment } from "./environment";
import type { AuthProvider } from "@atlas/auth";

describe("createRelayEnvironment", () => {
    it("creates a relay environment", () => {
        const environment = createRelayEnvironment();
        expect(environment).toBeInstanceOf(Environment);
    });

    it("creates an environment without an auth provider", () => {
        const environment = createRelayEnvironment();
        expect(environment).toBeDefined();
    });

    it("create an environment with an auth provider", () => {
        const testAuthProvider: AuthProvider = {
          getUser: vi.fn(),
          login: vi.fn(),
          logout: vi.fn(),
        };
        const environment = createRelayEnvironment(testAuthProvider);
        expect(environment).toBeDefined();
    })
});