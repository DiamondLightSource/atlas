import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import { AuthContextProvider, type AuthProvider } from "@atlas/auth";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";

type Props = {
  authProvider: AuthProvider;
  queryClient: QueryClient;
  theme: Theme;
  children: ReactNode;
};

export function AppProviders({
  authProvider,
  queryClient,
  theme,
  children,
}: Props) {
  return (
    <ThemeProvider theme={theme}>
      <AuthContextProvider provider={authProvider}>
        <InstrumentSessionProvider
          sessionsList={[
            "cm44196-1",
            "cm44196-2",
            "cm44196-3",
            "cm44196-4",
            "cm44196-5",
          ]}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </InstrumentSessionProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}
