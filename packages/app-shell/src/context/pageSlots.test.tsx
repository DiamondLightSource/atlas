import { render, screen } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "@atlas/auth";
import { Layout } from "../Layout";
import { TabbedPanel } from "../TabbedRoute";
import { testAuthProvider } from "../TestUtils";
import { PageSidePanel, TabBarActions } from "./pageSlots";

// mock instrument session view which is out of scope of this test
vi.mock("./instrumentSession/InstrumentSessionView", () => ({
  InstrumentSessionView: () => <button>cm12345-1</button>,
}));

function Page() {
  return (
    <>
      <div>Page content</div>
      <TabBarActions>
        <button>Page action</button>
      </TabBarActions>
      <PageSidePanel>
        <div>Side panel</div>
      </PageSidePanel>
    </>
  );
}

function renderApp(statusBar?: React.ReactNode) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <Layout title="Test app" navigation={[]} statusBar={statusBar} />
        ),
        children: [
          {
            path: "section",
            element: (
              <TabbedPanel
                basePath="/section"
                tabs={[{ label: "Page", path: "page" }]}
              />
            ),
            children: [{ path: "page", element: <Page /> }],
          },
        ],
      },
    ],
    { initialEntries: ["/section/page"] },
  );
  render(
    <ThemeProvider theme={DiamondDSTheme} defaultMode="light">
      <AuthContextProvider provider={testAuthProvider}>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </ThemeProvider>,
  );
}

describe("page slots", () => {
  beforeEach(() => {
    vi.mocked(testAuthProvider.getUser).mockResolvedValue({ id: "1" });
  });

  it("puts a page's tab bar actions in the tab bar", async () => {
    renderApp();
    // by text: at the test's width the nav is a modal, hiding the rest from
    // role queries
    const action = await screen.findByText("Page action");
    const tabBar = screen
      .getByRole("tablist", { hidden: true })
      .closest(".MuiPaper-root");
    expect(tabBar).toContainElement(action);
  });

  it("puts a page's side panel beside the page, not inside it", async () => {
    renderApp();
    const side = await screen.findByText("Side panel");
    const page = screen.getByText("Page content").parentElement;
    expect(side).toBeVisible();
    expect(page).not.toContainElement(side);
  });

  it("renders the status bar when given one", async () => {
    renderApp(<div>Status bar</div>);
    expect(await screen.findByText("Status bar")).toBeInTheDocument();
  });

  it("renders slot contents nowhere outside the layout", () => {
    render(
      <TabBarActions>
        <button>Orphan action</button>
      </TabBarActions>,
    );
    expect(screen.queryByText("Orphan action")).not.toBeInTheDocument();
  });
});
