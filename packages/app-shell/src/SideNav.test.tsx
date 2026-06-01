import { render, screen, userEvent } from "@atlas/vitest-conf";
import { SideNav } from "./SideNav";
import type { Section, SectionGroup } from "./Router";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

describe("SideNav", () => {
  const groups: SectionGroup[] = [
    {
      sections: [
        {
          name: "Setup",
          icon: <div data-testid="navicon1" />,
          pages: [],
        },
        {
          name: "Acquisition",
          icon: <div data-testid="navicon2" />,
          pages: [],
        },
        {
          name: "Analysis",
          icon: <div data-testid="navicon3" />,
          pages: [],
        },
      ],
    },
  ];

  function renderSidenav(open: boolean) {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <SideNav navigation={groups} open={open} />,
      },
    ]);
    render(<RouterProvider router={router} />);
  }

  it("Shows icon and name when open", () => {
    renderSidenav(true);

    const routes = groups[0].sections;

    routes.forEach((route) => {
      const button = screen.getByRole("button", { name: route.name });
      expect(button).toBeVisible();
      const label = screen.getByText(route.name);
      expect(label).toBeVisible();
    });
    ["navicon1", "navicon2", "navicon3"].forEach((id) =>
      expect(screen.getByTestId(id)).toBeVisible(),
    );
  });

  it("Shows icon only when closed", () => {
    renderSidenav(false);
    const routes = groups[0].sections;
    routes.forEach((route) => {
      const button = screen.getByRole("button", { name: route.name });
      expect(button).toBeVisible(); // a11y-wise still visible
      const label = screen.getByText(route.name);
      expect(label).toBeInTheDocument(); // label exists but
      expect(label).not.toBeVisible(); // not visible
    });
    ["navicon1", "navicon2", "navicon3"].forEach((id) =>
      expect(screen.getByTestId(id)).toBeVisible(),
    );
  });

  it("shows tooltip on buttons when closed", async () => {
    renderSidenav(false);

    const icon = screen.getByTestId("navicon2");
    const user = userEvent.setup();
    await user.hover(icon);

    // notice we await because the tooltip appears after some time
    const tooltip = await screen.findByRole("tooltip", { name: "Acquisition" });
    expect(tooltip).toBeVisible();
  });

  it("shows no tooltip on buttons when open", async () => {
    renderSidenav(true);

    const icon = screen.getByTestId("navicon2");
    const user = userEvent.setup();
    await user.hover(icon);

    const tooltip = screen.queryByRole("tooltip", {
      name: "Acquisition",
    });
    expect(tooltip).not.toBeInTheDocument();
  });
});
