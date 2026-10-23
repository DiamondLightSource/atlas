import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "@atlas/app-shell";

type Props = {
  theme: Theme;
  children: ReactNode;
};

export function AppProviders({ theme, children }: Props) {
  return (
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
  );
}
