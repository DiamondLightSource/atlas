import type { Api } from "@atlas/blueapi";
import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { InstrumentSessionProvider } from "@atlas/app-shell";

export const AppProviders = ({
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
        <InstrumentSessionProvider>
          <QueryClientProvider client={queryClient}>
            <BlueapiProvider api={api}>{children}</BlueapiProvider>
          </QueryClientProvider>
        </InstrumentSessionProvider>
      </RelayEnvironmentProvider>
    </ThemeProvider>
  );
};
