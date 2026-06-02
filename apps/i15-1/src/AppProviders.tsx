import type { Api } from "@atlas/blueapi";
import { ThemeProvider } from "@diamondlightsource/sci-react-ui";
import type { Theme } from "@mui/material";
import type { ReactNode } from "react";
import { InstrumentSessionProvider } from "./context/instrumentSession/InstrumentSessionProvider";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlueapiProvider } from "@atlas/blueapi-query";
import { store } from "@diamondlightsource/cs-web-lib";
import { useLoadPvwsConfig } from "@atlas/pvws-config";

type Props = {
  api: Api;
  theme: Theme;
  children: ReactNode;
};

export function AppProviders({ api, theme, children }: Props) {
  const config = useLoadPvwsConfig();
  return (
    <ThemeProvider theme={theme}>
      <InstrumentSessionProvider>
        <Provider store={store(config)}>
          <QueryClientProvider client={new QueryClient()}>
            <BlueapiProvider api={api}>{children}</BlueapiProvider>
          </QueryClientProvider>
        </Provider>
      </InstrumentSessionProvider>
    </ThemeProvider>
  );
}
