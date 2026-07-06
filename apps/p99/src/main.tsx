import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Dashboard from "./routes/Dashboard.tsx";
import { Layout } from "./routes/Layout.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { createApi } from "@atlas/blueapi";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./context/workflows/RelayEnvironment.ts";
// import Plans from "./routes/Plans.tsx";
// import Workflows from "./routes/Workflows.tsx";
import { UserAuthProvider } from "./context/userAuth/UserAuthProvider.tsx";
import { router } from "./router.tsx";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

const queryClient = new QueryClient();
export const api = createApi("/api/blueapi");
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider theme={DiamondDSTheme} defaultMode="system">
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <QueryClientProvider client={queryClient}>
            <UserAuthProvider>
              <BlueapiProvider api={api}>
                <RouterProvider router={router} />
              </BlueapiProvider>
            </UserAuthProvider>
          </QueryClientProvider>
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </StrictMode>,
  );
});
