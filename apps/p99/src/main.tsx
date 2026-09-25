import { RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient } from "@tanstack/react-query";
import { createApi } from "@atlas/blueapi";
import { router } from "./router.tsx";
import { authProvider } from "./auth.ts";
import { AppProviders } from "./AppProviders.tsx";

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
      <AppProviders
        authProvider={authProvider}
        blueapi={api}
        queryClient={queryClient}
      >
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
