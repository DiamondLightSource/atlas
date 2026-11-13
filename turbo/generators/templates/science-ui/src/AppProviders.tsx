import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { AuthContextProvider } from "@atlas/auth";
import { authProvider } from "./auth";
import type { Api } from "@atlas/blueapi";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { GetInstrumentSessions } from "./GetInstrumentSessions";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { relayEnvironment } from "./relay";

type Props = {
  beamline: string;
  theme: Theme;
  blueapi: Api;
  queryClient: QueryClient;
  children: ReactNode;
};

export function AppProviders({
  beamline,
  theme,
  blueapi,
  queryClient,
  children,
}: Props) {
  return (
    <AuthContextProvider provider={authProvider}>
      <ThemeProvider theme={theme}>
        <RelayEnvironmentProvider environment={relayEnvironment}>
          <BlueapiProvider api={blueapi}>
            <QueryClientProvider client={queryClient}>
              <GetInstrumentSessions beamline={beamline}>
                {children}
              </GetInstrumentSessions>
            </QueryClientProvider>
          </BlueapiProvider>
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </AuthContextProvider>
  );
}
