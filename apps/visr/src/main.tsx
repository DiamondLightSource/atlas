import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { RouterProvider } from "react-router-dom";

import Spectroscopy from "./routes/Spectroscopy.tsx";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Workflows from "./routes/Workflows.tsx";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment.ts";
import { createApi, type Api } from "@atlas/blueapi";
import { BlueapiProvider } from "@atlas/blueapi-query";
import Tomography from "./routes/Tomography.tsx";
import type { Theme } from "@mui/material";
import {
  createRouter,
  InstrumentSessionProvider,
  type SectionGroup,
} from "@atlas/app-shell";
import { PlanBrowser } from "@atlas/blueapi-ui";
import { useInstrumentSessions } from "./components/InstrumentSessionSelection/InstrumentSession.tsx";
import { ChartNoAxesCombined, ScanQrCode } from "lucide-react";

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

const InstrumentSessionLoader = ({ children }: { children: ReactNode }) => {
  const sessions = useInstrumentSessions().filter(
    (session): session is string => session !== undefined,
  );
  if (sessions.length === 0) {
    sessions.push("0-0");
  }
  return (
    <InstrumentSessionProvider sessionsList={sessions}>
      {children}
    </InstrumentSessionProvider>
  );
};

const AppProviders = ({
  api,
  queryClient,
  theme,
  children,
}: {
  api: Api;
  queryClient: QueryClient;
  theme: Theme;
  children: ReactNode;
}) => {
  return (
    <ThemeProvider theme={theme}>
      <RelayEnvironmentProvider environment={RelayEnvironment}>
        <InstrumentSessionLoader>
          <QueryClientProvider client={queryClient}>
            <BlueapiProvider api={api}>{children}</BlueapiProvider>
          </QueryClientProvider>
        </InstrumentSessionLoader>
      </RelayEnvironmentProvider>
    </ThemeProvider>
  );
};

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders api={api} queryClient={queryClient} theme={DiamondDSTheme}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
