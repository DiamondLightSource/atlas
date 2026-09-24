import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { createApi } from "@atlas/blueapi";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./context/supergraph/RelayEnvironment.ts";
import { router } from "./router.tsx";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import { authProvider } from "./auth.ts";
import { AuthContextProvider } from "@atlas/auth";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

const queryClient = new QueryClient();
export const api = createApi("/api/blueapi", authProvider.login);
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider theme={DiamondDSTheme} defaultMode="system">
        <AuthContextProvider provider={authProvider}>
          <InstrumentSessionProvider>
            <RelayEnvironmentProvider environment={RelayEnvironment}>
              <QueryClientProvider client={queryClient}>
                <BlueapiProvider api={api}>
                  <RouterProvider router={router} />
                </BlueapiProvider>
              </QueryClientProvider>
            </RelayEnvironmentProvider>
          </InstrumentSessionProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </StrictMode>,
  );
});
