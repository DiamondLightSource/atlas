import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import { AuthContextProvider } from "@atlas/auth";
import { authProvider } from "./auth";
import type { Api } from "@atlas/blueapi";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { GetInstrumentSessions } from "./GetInstrumentSessions";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { relayEnvironment } from "./RelayEnvironment";

type Props = {
  theme: Theme;
  blueapi: Api;
  queryClient: QueryClient;
  children: ReactNode;
};

export function AppProviders({ theme, blueapi, queryClient, children }: Props) {
  return (
    <AuthContextProvider provider={authProvider}>
      <ThemeProvider theme={theme}>
        <RelayEnvironmentProvider environment={relayEnvironment}>
          <BlueapiProvider api={blueapi}>
            <QueryClientProvider client={queryClient}>
              <GetInstrumentSessions beamline="p48">
                {children}
              </GetInstrumentSessions>
            </QueryClientProvider>
          </BlueapiProvider>
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </AuthContextProvider>
  );
}
