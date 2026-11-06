import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import { AuthContextProvider } from "@atlas/auth";
import { authProvider } from "./auth";
import type { Api } from "@atlas/blueapi";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";

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
        <BlueapiProvider api={blueapi}>
          <QueryClientProvider client={queryClient}>
            <InstrumentSessionProvider
              sessionsList={[
                "cm44196-1",
                "cm44196-2",
                "cm44196-3",
                "cm44196-4",
                "cm44196-5",
              ]}
            >
              {children}
            </InstrumentSessionProvider>
          </QueryClientProvider>
        </BlueapiProvider>
      </ThemeProvider>
    </AuthContextProvider>
  );
}
