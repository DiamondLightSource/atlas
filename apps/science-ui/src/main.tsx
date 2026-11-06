import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";
import "@diamondlightsource/sci-react-ui/font-styles.css";
import { RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { router } from "./router";

import { AppProviders } from "./AppProviders";
import { createApi } from "@atlas/blueapi";
import { authProvider } from "./auth";
import { QueryClient } from "@tanstack/react-query";

const blueapi = createApi("/api/blueapi", authProvider.login);
const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders
        theme={DiamondDSTheme}
        blueapi={blueapi}
        queryClient={queryClient}
      >
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
