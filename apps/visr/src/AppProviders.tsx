import type { Api } from "@atlas/blueapi";
import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { AuthContextProvider, type AuthProvider } from "@atlas/auth";
import { InstrumentSessionLoader } from "./components/InstrumentSessionSelection/InstrumentSessionLoader";

export const AppProviders = ({
  authProvider,
  api,
  queryClient,
  theme,
  children,
}: {
  authProvider: AuthProvider;
  api: Api;
  queryClient: QueryClient;
  theme: Theme;
  children: ReactNode;
}) => {
  return (
    <ThemeProvider theme={theme}>
      <AuthContextProvider provider={authProvider}>
        <RelayEnvironmentProvider environment={RelayEnvironment}>
          <InstrumentSessionLoader>
            <QueryClientProvider client={queryClient}>
              <BlueapiProvider api={api}>{children}</BlueapiProvider>
            </QueryClientProvider>
          </InstrumentSessionLoader>
        </RelayEnvironmentProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
};
