import { render, screen, userEvent, waitFor } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import type { RouterProps } from "./Router";
import { DRAWER_STATE_KEY } from "./usePersistentDrawerState";
import { Layout } from "./Layout";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "@atlas/auth";
import { testAuthProvider } from "./TestUtils";

// mock instrument session view which is out of scope of this test
export function InstrumentSessionView() {
  return <button>cm12345-1</button>;
}
vi.mock("./context/instrumentSession/InstrumentSessionView", () => ({
  InstrumentSessionView: InstrumentSessionView,
}));

describe("Layout", () => {
  const props: RouterProps = {
    title: "Test app",
    navigation: [
      {
        sections: [
          {
            name: "Dashboard",
            icon: <div data-testid="dashboard-icon" />,
            pages: [],
          },
          {
            name: "Experiment",
            isProtected: true,
            icon: <div data-testid="experiment-icon" />,
            pages: [],
          },
        ],
      },
    ],
  };

  const createTestRouter = (props: RouterProps) => {
    return createMemoryRouter([
      {
        path: "/",
        element: <Layout {...props} />,
        children: [
          {
            index: true,
            element: <div>Outlet content</div>,
          },
        ],
      },
    ]);
  };

  const renderLayout = (
    router: ReturnType<typeof createTestRouter> = createTestRouter(props),
  ) => {
    render(
      <ThemeProvider theme={DiamondDSTheme} defaultMode="light">
        <AuthContextProvider provider={testAuthProvider}>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </ThemeProvider>,
    );
  };

  it("shows title, nav section titles, and main content", async () => {
    // we are authenticated
    vi.mocked(testAuthProvider.getUser).mockResolvedValue({ id: "1234" });

    renderLayout();

    // title
    expect(await screen.findByText(props.title)).toBeInTheDocument();

    // each route name
    props.navigation[0].sections.forEach(async (route) => {
      expect(await screen.findByText(route.name)).toBeInTheDocument();
    });

    // default content
    expect(await screen.findByText("Outlet content")).toBeInTheDocument();
  });

  it("hides protected sections when unauthenticated", async () => {
    // unauthenticated
    vi.mocked(testAuthProvider.getUser).mockResolvedValue(null);

    renderLayout();

    // public section link rendered
    expect(await screen.findByTestId("dashboard-icon")).toBeInTheDocument();

    // but not protected one
    expect(screen.queryByTestId("experiment-icon")).not.toBeInTheDocument();
  });

  describe("global panel", () => {
    beforeEach(() => {
      // an open sidebar renders as a modal drawer at jsdom's viewport width,
      // which aria-hides the rest of the app from role queries
      localStorage.setItem(DRAWER_STATE_KEY, "false");
    });

    const panelToggle = { name: /open\/close panel/i };

    it("opens and closes the panel from the status bar and the panel's close button", async () => {
      const user = userEvent.setup();
      renderLayout(
        createTestRouter({
          ...props,
          panelComponents: {
            components: [{ label: "Logs", content: <div>Panel content</div> }],
          },
        }),
      );

      // panel starts collapsed
      const toggle = await screen.findByRole("button", panelToggle);
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();

      // status bar toggle opens it
      await user.click(toggle);
      expect(await screen.findByRole("tabpanel")).toHaveTextContent(
        "Panel content",
      );

      // status bar toggle closes it
      await user.click(toggle);
      await waitFor(() =>
        expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument(),
      );

      // the panel's own close button closes it too
      await user.click(toggle);
      await screen.findByRole("tabpanel");
      await user.click(screen.getByRole("button", { name: "Close panel" }));
      await waitFor(() =>
        expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument(),
      );
    });

    it("does not render the panel or its toggle when panelComponents not given", async () => {
      renderLayout();

      // wait for the layout to finish loading auth state
      await screen.findByText("Outlet content");

      expect(screen.queryByRole("button", panelToggle)).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    });
  });
});
