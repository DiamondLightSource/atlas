import type { Api } from "@atlas/blueapi";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import type { Theme } from "@mui/material";

interface Props extends PropsWithChildren {
  queryClient: QueryClient;
  api: Api;
  theme: Theme;
}

export const AppProviders = ({
  queryClient,
  api: blueapi,
  children,
}: Props) => {
  return (
    <ThemeProvider theme={DiamondDSTheme} defaultMode="system">
      <RelayEnvironmentProvider environment={RelayEnvironment}>
        <InstrumentSessionProvider>
          <QueryClientProvider client={queryClient}>
            <BlueapiProvider api={blueapi}>{children}</BlueapiProvider>
          </QueryClientProvider>
        </InstrumentSessionProvider>
      </RelayEnvironmentProvider>
    </ThemeProvider>
  );
};
