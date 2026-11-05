import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/app-shell";
import { AuthContextProvider } from "@atlas/auth";
import { authProvider } from "./auth";

type Props = {
  theme: Theme;
  children: ReactNode;
};

export function AppProviders({ theme, children }: Props) {
  return (
    <AuthContextProvider provider={authProvider}>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </AuthContextProvider>
  );
}
