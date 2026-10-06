import { AuthContextProvider } from "@atlas/auth";
import type { ReactNode } from "react";
import { testAuthProvider } from "./TestUtils";
import { AuthGuard } from "./AuthGuard";
import { render, screen } from "@atlas/vitest-conf";
import { MemoryRouter, Route, Routes } from "react-router-dom";

describe("AuthGuard", () => {
  const guardedElement = <div data-testid="guarded-element" />;

  const renderAuthGuard = (element: ReactNode) => {
    return render(
      <AuthContextProvider provider={testAuthProvider}>
        <AuthGuard element={element} />
      </AuthContextProvider>,
    );
  };

  /**
   * Renders the given element within a MemoryRouter
   * which includes an index element with data-testid="home"
   * to verify redirect observable behaviour
   */
  const renderWithRouter = (element: ReactNode) => {
    const Home = () => <div data-testid="home" />;

    return render(
      <AuthContextProvider provider={testAuthProvider}>
        <MemoryRouter initialEntries={["/test"]}>
          <Routes>
            <Route path="/test" element={<AuthGuard element={element} />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </MemoryRouter>
      </AuthContextProvider>,
    );
  };

  it("returns null when auth is loading", () => {
    // auth status begins as 'loading',
    // and in this test we do not await anything.
    const { container } = renderAuthGuard(guardedElement);
    expect(container).toBeEmptyDOMElement();
  });

  it("returns the guarded element when authenticated", async () => {
    vi.mocked(testAuthProvider.getUser).mockResolvedValue({
      id: "0",
    });

    renderAuthGuard(guardedElement);

    expect(await screen.findByTestId("guarded-element")).toBeInTheDocument();
  });

  it("redirects to index when unauthenticated", async () => {
    vi.mocked(testAuthProvider.getUser).mockResolvedValue(null);

    renderWithRouter(guardedElement);
    expect(await screen.findByTestId("home")).toBeInTheDocument();
    expect(screen.queryByTestId("guarded-element")).not.toBeInTheDocument();
  });
});
