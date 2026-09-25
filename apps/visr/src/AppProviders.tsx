import type { Api } from "@atlas/blueapi";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment";
import { InstrumentSessionProvider } from "./context/instrumentSession/InstrumentSessionProvider";
import { BlueapiProvider } from "@atlas/blueapi-query";

interface Props extends PropsWithChildren {
  queryClient: QueryClient;
  blueapi: Api;
}

export const AppProviders = ({ queryClient, blueapi, children }: Props) => {
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
