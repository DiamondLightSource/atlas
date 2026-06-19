import { DiamondTheme } from "@diamondlightsource/sci-react-ui";
import { RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { router } from "./router.tsx";

import { createApi } from "@atlas/blueapi";
import { AppProviders } from "./AppProviders.tsx";

const QUEUE_MODE = import.meta.env.VITE_QUEUE_MODE;

async function enableMocking() {
  if (import.meta.env.DEV && QUEUE_MODE != "local") {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

const api = createApi("/api/blueapi");

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders api={api} theme={DiamondTheme}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
