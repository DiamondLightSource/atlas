import { render, screen } from "@atlas/vitest-conf";
import type { RouterProps } from "./Router";
import { Layout } from "./Layout";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

describe("Layout", () => {
  it("shows title, nav section titles, and main content", () => {
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
    render(<RouterProvider router={router} />);

    // title
    expect(screen.getByText(props.title)).toBeInTheDocument();

    // each route name
    props.navigation[0].sections.forEach((route) => {
      expect(screen.getByText(route.name)).toBeInTheDocument();
    });

    // default content
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
  });
});
