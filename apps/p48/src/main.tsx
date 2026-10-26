import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";
import "@diamondlightsource/sci-react-ui/font-styles.css";
import { RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { router } from "./router";

import { AppProviders } from "./AppProviders";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders theme={DiamondDSTheme}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
