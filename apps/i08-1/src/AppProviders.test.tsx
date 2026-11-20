import { render, screen } from "@atlas/vitest-conf";
import { AppProviders } from "./AppProviders";
import { QueryClient } from "@tanstack/react-query";
import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";
import { createApi } from "@atlas/blueapi";
import { authProvider } from "./auth";

// exercising the app providers with real values
describe("AppProviders", () => {
  it("renders app children", () => {
    const queryClient = new QueryClient();
    const blueapi = createApi("/api/test", authProvider.login);

    const App = () => <div data-testid="my-app" />;
    render(
      <AppProviders
        theme={DiamondDSTheme}
        beamline="test"
        blueapi={blueapi}
        queryClient={queryClient}
      >
        <App />
      </AppProviders>,
    );

    expect(screen.getByTestId("my-app")).toBeInTheDocument();
  });
});
