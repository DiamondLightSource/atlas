import { DiamondTheme, ThemeProvider } from "@diamondlightsource/sci-react-ui";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Dashboard from "./routes/Dashboard.tsx";
import { InstrumentSessionProvider } from "./context/instrumentSession/InstrumentSessionProvider.tsx";
import JsonFormsPlans from "./routes/Plans.tsx";
import { Layout } from "./routes/Layout.tsx";
import Spectroscopy from "./routes/Spectroscopy.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Workflows from "./routes/Workflows.tsx";
import { RelayEnvironmentProvider } from "react-relay";
import { getRelayEnvironment } from "./RelayEnvironment.ts";

declare global {
  interface Window {
    global?: typeof globalThis;
  }
}
window.global ||= window;

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

(async function start() {
  await enableMocking();

  const environment = await getRelayEnvironment();

  createRoot(document.getElementById("root")!).render(
    <RelayEnvironmentProvider environment={environment}>
      <InstrumentSessionProvider>
        <StrictMode>
          <ThemeProvider theme={DiamondTheme} defaultMode="light">
            <RouterProvider router={router} />
          </ThemeProvider>
        </StrictMode>
      </InstrumentSessionProvider>
    </RelayEnvironmentProvider>,
  );
})();
