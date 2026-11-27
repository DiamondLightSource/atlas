import type { Api } from "@atlas/blueapi";
import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/instrument-session";
import { RelayEnvironmentProvider } from "react-relay";
import { relayEnvironment } from "./relay";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { store } from "@diamondlightsource/cs-web-lib";
import { useLoadPvwsConfig } from "@atlas/pvws-config";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./context/experimentDefinitions/apolloClient";
import { AuthContextProvider, type AuthProvider } from "@atlas/auth";

type Props = {
  authProvider: AuthProvider;
  api: Api;
  theme: Theme;
  children: ReactNode;
};

export function AppProviders({ authProvider, api, theme, children }: Props) {
  const config = useLoadPvwsConfig();
  return (
    <ThemeProvider theme={theme}>
      <AuthContextProvider provider={authProvider}>
        <ReduxProvider store={store(config)}>
          <QueryClientProvider client={new QueryClient()}>
            <BlueapiProvider api={api}>
              <ApolloProvider client={client}>
                <RelayEnvironmentProvider environment={relayEnvironment}>
                  <InstrumentSessionProvider instrument="I15-1">
                    {children}
                  </InstrumentSessionProvider>
                </RelayEnvironmentProvider>
              </ApolloProvider>
            </BlueapiProvider>
          </QueryClientProvider>
        </ReduxProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}
