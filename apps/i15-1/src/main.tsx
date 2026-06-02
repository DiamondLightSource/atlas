import { DiamondTheme } from "@diamondlightsource/sci-react-ui";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { Layout } from "./routes/Layout.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import Robot from "./routes/Robot.tsx";

import { createApi } from "@atlas/blueapi";
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
        path: "robot",
        element: <Robot />,
      },
    ],
  },
]);

const api = createApi("/api");

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders api={api} theme={DiamondTheme}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
