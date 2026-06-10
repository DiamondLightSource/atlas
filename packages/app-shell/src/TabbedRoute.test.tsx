import { render, screen, userEvent } from "@atlas/vitest-conf";
import { TabbedPanel, type TabbedPanelProps } from "./TabbedRoute";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

describe("TabbedRoute", () => {
  const props: TabbedPanelProps = {
    tabs: [
      { label: "Diffraction", path: "diff" },
      { label: "Imaging", path: "img" },
    ],
    basePath: "/experiment",
  };

  const testRouter = createMemoryRouter(
    [
      {
        path: "/experiment",
        element: <TabbedPanel {...props} />,
        children: [
          {
            path: "diff",
            element: <div>Diffraction Panel</div>,
          },
          {
            path: "img",
            element: <div>Imaging Panel</div>,
          },
        ],
      },
    ],
    {
      initialEntries: ["/experiment/img"],
    },
  );

  /**
   * Renders our component under test within a RouterProvider,
   * with Imaging as initial route */
  beforeEach(() => render(<RouterProvider router={testRouter} />));

  it("renders a tab element for each tab in props", () => {
    props.tabs.forEach((tab) => {
      const element = screen.getByRole("tab", { name: tab.label });
      expect(element).toBeVisible();
    });
  });

  it("selects tab based on URL", () => {
    expect(screen.getByRole("tab", { name: "Diffraction" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tab", { name: "Imaging" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("navigates when tab is clicked", async () => {
    const diffractionTab = screen.getByRole("tab", { name: "Diffraction" });
    const user = userEvent.setup();
    await user.click(diffractionTab);

    expect(diffractionTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Diffraction Panel")).toBeVisible();
  });
});
