import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";
import { RouterProvider } from "react-router-dom";

import Spectroscopy from "./routes/Spectroscopy.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import Workflows from "./routes/Workflows.tsx";
import { createApi } from "@atlas/blueapi";
import Tomography from "./routes/Tomography.tsx";
import { createRouter, type SectionGroup } from "@atlas/app-shell";
import { PlanBrowser } from "@atlas/blueapi-ui";
import { ChartNoAxesCombined, ScanQrCode } from "lucide-react";
import { AppProviders } from "./AppProviders.tsx";

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
          { name: "Spectroscopy", element: <Spectroscopy /> },
          { name: "Tomography", element: <Tomography /> },
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

const api = createApi("/api/blueapi");
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
