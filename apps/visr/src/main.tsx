import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Dashboard from "./routes/Dashboard.tsx";
import JsonFormsPlans from "./routes/Plans.tsx";
import { Layout } from "./routes/Layout.tsx";
import Spectroscopy from "./routes/Spectroscopy.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";

declare global {
  interface Window {
    global?: typeof globalThis;
  }
}

window.global ||= window;
import Workflows from "./routes/Workflows.tsx";
import { createApi } from "@atlas/blueapi";
import Tomography from "./routes/Tomography.tsx";
import { authProvider } from "./auth.ts";
import { AppProviders } from "./AppProviders.tsx";

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

const api = createApi("/api/blueapi", authProvider.login);
const queryClient = new QueryClient();

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders queryClient={queryClient} blueapi={api}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
