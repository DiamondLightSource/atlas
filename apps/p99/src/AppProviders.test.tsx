import { render, screen } from "@atlas/vitest-conf";
import { AppProviders } from "./AppProviders";
import { authProvider } from "./auth";
import { api } from "./main";
import { QueryClient } from "@tanstack/react-query";

// exercising the app providers with real values
describe("AppProviders", () => {
  it("renders app children", () => {
    render(
      <AppProviders
        authProvider={authProvider}
        blueapi={api}
        queryClient={new QueryClient()}
      >
        <div data-testid="app" />
      </AppProviders>,
    );

    expect(screen.getByTestId("app")).toBeInTheDocument();
  });
});
