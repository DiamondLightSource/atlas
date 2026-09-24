import { render, screen } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import type { RouterProps } from "./Router";
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
  it("shows title, nav section titles, and main content", async () => {
    const props: RouterProps = {
      title: "Test app",
      navigation: [
        {
          sections: [
            {
              name: "Dashboard",
              icon: <div />,
              pages: [],
            },
          ],
        },
      ],
    };

    const router = createMemoryRouter([
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
    render(
      <ThemeProvider theme={DiamondDSTheme} defaultMode="light">
        <AuthContextProvider provider={testAuthProvider}>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </ThemeProvider>,
    );

    // title
    expect(await screen.findByText(props.title)).toBeInTheDocument();

    // each route name
    props.navigation[0].sections.forEach(async (route) => {
      expect(await screen.findByText(route.name)).toBeInTheDocument();
    });

    // default content
    expect(await screen.findByText("Outlet content")).toBeInTheDocument();
  });
});
