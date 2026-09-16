import type { Api } from "@atlas/blueapi";
import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/app-shell";
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

const queryClient = new QueryClient();
export function AppProviders({ authProvider, api, theme, children }: Props) {
  const config = useLoadPvwsConfig();
  return (
    <ThemeProvider theme={theme}>
      <AuthContextProvider provider={authProvider}>
        <InstrumentSessionProvider sessionsList={["cm44163-3", "cm44163-4"]}>
          <ReduxProvider store={store(config)}>
            <QueryClientProvider client={queryClient}>
              <BlueapiProvider api={api}>
                <ApolloProvider client={client}>{children}</ApolloProvider>
              </BlueapiProvider>
            </QueryClientProvider>
          </ReduxProvider>
        </InstrumentSessionProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}
