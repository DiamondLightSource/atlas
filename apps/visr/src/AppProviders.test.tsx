import { createApi } from "@atlas/blueapi";
import { QueryClient } from "@tanstack/react-query";
import { authProvider } from "./auth";
import { render, screen } from "@atlas/vitest-conf";
import { AppProviders } from "./AppProviders";
import { DiamondDSTheme } from "@diamondlightsource/sci-react-ui";

vi.mock("./components/InstrumentSessionSelection/InstrumentSession", () => ({
  useInstrumentSessions: vi.fn(() => []),
}));
describe("AppProviders", () => {
  it("renders the given children", () => {
    const queryClient = new QueryClient();
    const blueapi = createApi("/api/test", authProvider.login);

    const App = () => <div data-testid="my-app" />;

    render(
      <AppProviders
        authProvider={authProvider}
        queryClient={queryClient}
        api={blueapi}
        theme={DiamondDSTheme}
      >
        <App />
      </AppProviders>,
    );

    expect(screen.getByTestId("my-app")).toBeInTheDocument();
  });
});
