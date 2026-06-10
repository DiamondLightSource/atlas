import * as React from "react";
import { render, screen, within, userEvent } from "@atlas/vitest-conf";
import SearchablePlanList from "./SearchablePlanList";
import type { Plan } from "@atlas/blueapi";

const plans: Plan[] = [
  { name: "Align Beam", description: "", schema: {} },
  { name: "Dark Current", description: "", schema: {} },
  { name: "Flat Field", description: "", schema: {} },
];

function renderList(
  overrides?: Partial<React.ComponentProps<typeof SearchablePlanList>>,
) {
  const updateSelection = vi.fn();
  const props: React.ComponentProps<typeof SearchablePlanList> = {
    plans,
    selectedPlan: null,
    updateSelection,
    ...overrides,
  };
  const utils = render(<SearchablePlanList {...props} />);

  // merge useful things for the test
  return { updateSelection, props, ...utils };
}

describe("SearchablePlanList", () => {
  it("renders search, heading, and all plans initially", () => {
    renderList();

    // search field
    expect(
      screen.getByRole("textbox", { name: /search plans/i }),
    ).toBeInTheDocument();

    // heading
    expect(screen.getByText("Plans")).toBeInTheDocument();

    // all items
    for (const p of plans) {
      expect(screen.getByRole("button", { name: p.name })).toBeInTheDocument();
    }

    // no selection initially
    for (const p of plans) {
      expect(screen.getByRole("button", { name: p.name })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    }
  });

  it("calls updateSelection with the clicked plan", async () => {
    const user = userEvent.setup();
    const { updateSelection } = renderList();

    const item = screen.getByRole("button", { name: "Flat Field" });
    await user.click(item);

    expect(updateSelection).toHaveBeenCalledTimes(1);
    expect(updateSelection).toHaveBeenCalledWith({
      name: "Flat Field",
      schema: {},
      description: "",
    });
  });

  it("reflects controlled selection via selectedPlan prop", async () => {
    const { props, rerender } = renderList();

    const selectedButton = screen.getByRole("button", { name: "Dark Current" });

    // none selected initially
    expect(selectedButton).toHaveAttribute("aria-selected", "false");

    // re-render with selected plan
    const selected = { name: "Dark Current", schema: {}, description: "" };
    rerender(<SearchablePlanList {...props} selectedPlan={selected} />);
    // selected plan marked so with aria-selected
    expect(selectedButton).toHaveAttribute("aria-selected", "true");
    // others remain unselected
    expect(screen.getByRole("button", { name: "Align Beam" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("filters plans by case-insensitive search", async () => {
    const user = userEvent.setup();
    renderList();

    const search = screen.getByRole("textbox", { name: /search plans/i });
    await user.type(search, "dark"); // lower-case query

    expect(
      screen.getByRole("button", { name: "Dark Current" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Align Beam" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Flat Field" }),
    ).not.toBeInTheDocument();

    // Case-insensitive check
    await user.clear(search);
    await user.type(search, "ALIG");
    expect(
      screen.getByRole("button", { name: "Align Beam" }),
    ).toBeInTheDocument();
  });

  it("shows empty-state message when no plans match search", async () => {
    const user = userEvent.setup();
    renderList();

    const search = screen.getByRole("textbox", { name: /search plans/i });
    await user.type(search, "zzz");

    expect(screen.getByText(/no plans match/i)).toBeInTheDocument();
  });

  it("handles empty plans array", () => {
    renderList({ plans: [] });
    // List is empty, but the heading and search are present
    expect(screen.getByText("Plans")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /search plans/i }),
    ).toBeInTheDocument();
  });

  it("shows all items after clearing a search", async () => {
    renderList();
    const user = userEvent.setup();

    const planList = screen.getByRole("list");
    const { getAllByRole, queryAllByRole } = within(planList);

    // three initial plans
    expect(getAllByRole("button")).toHaveLength(3);

    // search
    const search = screen.getByRole("textbox", { name: /search plans/i });
    await user.type(search, "zzz");

    // no matches
    expect(screen.getByText(/no plans match/i)).toBeInTheDocument();
    // no plans shown
    expect(queryAllByRole("button")).toHaveLength(0);

    // clear search
    await user.clear(search);

    // no matches label disappears
    expect(screen.queryByText(/no plans match/i)).not.toBeInTheDocument();

    // three plans again
    expect(getAllByRole("button")).toHaveLength(3);
  });
});
