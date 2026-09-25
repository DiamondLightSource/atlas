import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Api } from "@atlas/blueapi";
import { AuthContextProvider, type AuthProvider } from "@atlas/auth";
import type { PropsWithChildren } from "react";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./context/supergraph/RelayEnvironment";
import { BlueapiProvider } from "@atlas/blueapi-query";

interface Props extends PropsWithChildren {
  authProvider: AuthProvider;
  queryClient: QueryClient;
  blueapi: Api;
}

export const AppProviders = ({
  authProvider,
  queryClient,
  blueapi,
  children,
}: Props) => {
  return (
    <ThemeProvider theme={DiamondDSTheme} defaultMode="system">
      <AuthContextProvider provider={authProvider}>
        <InstrumentSessionProvider>
          <RelayEnvironmentProvider environment={RelayEnvironment}>
            <QueryClientProvider client={queryClient}>
              <BlueapiProvider api={blueapi}>{children}</BlueapiProvider>
            </QueryClientProvider>
          </RelayEnvironmentProvider>
        </InstrumentSessionProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
