import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";
import "@diamondlightsource/sci-react-ui/font-styles.css";
import { RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { QueryClient } from "@tanstack/react-query";

import { router } from "./router";
import { authProvider } from "./auth";
import { AppProviders } from "./AppProviders";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders
      authProvider={authProvider}
      queryClient={queryClient}
      theme={DiamondDSTheme}
    >
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
