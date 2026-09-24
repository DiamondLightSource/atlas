import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";
import "@diamondlightsource/sci-react-ui/font-styles.css";
import { RouterProvider } from "react-router-dom";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { createApi } from "@atlas/blueapi";
import { createRouter, type SectionGroup } from "@atlas/app-shell";
import { PlanBrowser } from "@atlas/blueapi-ui";
import { ChartNoAxesCombined, ScanQrCode } from "lucide-react";
import { AppProviders } from "./AppProviders.tsx";
import TomographyView from "./components/tomography/TomographyView.tsx";
import SpectroscopyView from "./components/spectroscopy/SpectroscopyView.tsx";
import Workflows from "./components/workflows/Workflows.tsx";
import { authProvider } from "./auth.ts";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

const navigation: SectionGroup[] = [
  {
    sections: [
      {
        name: "Acquisition",
        icon: <ScanQrCode />,
        path: "acquisition",
        pages: [
          { name: "Spectroscopy", element: <SpectroscopyView /> },
          { name: "Tomography", element: <TomographyView /> },
          { name: "Plans", element: <PlanBrowser /> },
        ],
      },
      {
        name: "Analysis",
        icon: <ChartNoAxesCombined />,
        path: "analysis",
        pages: [{ name: "Workflows", element: <Workflows /> }],
      },
    ],
  },
];

const router = createRouter({
  title: "ViSR",
  navigation,
});

const api = createApi("/api/blueapi", authProvider.login);
const queryClient = new QueryClient();

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders api={api} queryClient={queryClient} theme={DiamondDSTheme}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
