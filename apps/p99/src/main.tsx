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
import { RelayEnvironment } from "./RelayEnvironment.ts";
import Plans from "./routes/Plans.tsx";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "plans",
        element: <Plans />,
      },
    ],
  },
]);

const queryClient = new QueryClient();
export const api = createApi("/api/blueapi");
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider theme={DiamondDSTheme} defaultMode="system">
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <QueryClientProvider client={queryClient}>
            <BlueapiProvider api={api}>
              <RouterProvider router={router} />
            </BlueapiProvider>
          </QueryClientProvider>
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </StrictMode>,
  );
});
