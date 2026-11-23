import { createRelayEnvironment } from "@atlas/supergraph";
import { authProvider } from "./auth";

export const relayEnvironment = createRelayEnvironment(authProvider)