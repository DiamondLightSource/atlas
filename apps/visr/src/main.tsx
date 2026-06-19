import { DiamondTheme, ThemeProvider } from "@diamondlightsource/sci-react-ui";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Dashboard from "./routes/Dashboard.tsx";
import { InstrumentSessionProvider } from "./context/instrumentSession/InstrumentSessionProvider.tsx";
import JsonFormsPlans from "./routes/Plans.tsx";
import { Layout } from "./routes/Layout.tsx";
import Spectroscopy from "./routes/Spectroscopy.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

declare global {
  interface Window {
    global?: typeof globalThis;
  }
}

window.global ||= window;
import Workflows from "./routes/Workflows.tsx";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment.ts";
import { createApi } from "@atlas/blueapi";
import { BlueapiProvider } from "@atlas/blueapi-query";
import Tomography from "./routes/Tomography.tsx";

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
        path: "spectroscopy",
        element: <Spectroscopy />,
      },
      {
        path: "tomography",
        element: <Tomography />,
      },
      {
        path: "plans",
        element: <JsonFormsPlans />,
      },
      {
        path: "/workflows",
        element: <Workflows />,
      },
    ],
  },
]);

const api = createApi("/api/blueapi");
const queryClient = new QueryClient();

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <InstrumentSessionProvider>
        <StrictMode>
          <ThemeProvider theme={DiamondTheme} defaultMode="light">
            <QueryClientProvider client={queryClient}>
              <BlueapiProvider api={api}>
                <RouterProvider router={router} />
              </BlueapiProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </StrictMode>
      </InstrumentSessionProvider>
    </RelayEnvironmentProvider>,
  );
});
