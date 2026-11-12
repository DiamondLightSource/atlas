import { render, screen, userEvent, within } from "@atlas/vitest-conf";
import { ContextPanel, type CardItem, type PanelFilter } from "./ContextPanel";

const ITEMS: CardItem[] = [
  {
    id: "a",
    title: "Scan 2",
    subtitle: "grid_scan",
    status: { label: "Running", colour: "info" },
    metadata: [{ key: "points", label: "Points", value: 100 }],
  },
  { id: "b", title: "Scan 1" },
];

const STATUS_FILTER: PanelFilter = {
  key: "status",
  label: "Status",
  options: [
    { value: "success", label: "Success" },
    { value: "abort", label: "Abort" },
  ],
  value: "",
};

describe("ContextPanel", () => {
  it("shows each item as a card", () => {
    render(<ContextPanel title="Scans" items={ITEMS} />);

    const [first, second] = screen.getAllByRole("listitem");
    expect(within(first).getByText("Scan 2")).toBeVisible();
    expect(within(first).getByText("grid_scan")).toBeVisible();
    expect(within(first).getByText("Running")).toBeVisible();
    expect(within(first).getByText("Points")).toBeVisible();
    expect(within(first).getByText("100")).toBeVisible();
    expect(within(second).getByText("Scan 1")).toBeVisible();
  });

  it.each([
    [{ matching: 12, total: 40 }, "12 of 40"],
    [{ matching: 40_000, total: 40_000 }, "40,000"],
  ])("counts %o items as %s", (count, text) => {
    render(<ContextPanel title="Scans" items={ITEMS} count={count} />);

    expect(screen.getByText(text)).toBeVisible();
  });

  it("marks the active item and reports the one clicked", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <ContextPanel
        title="Scans"
        items={ITEMS}
        activeId="a"
        onActivate={onActivate}
      />,
    );

    expect(screen.getByRole("button", { current: true })).toHaveTextContent(
      "Scan 2",
    );

    await user.click(screen.getByText("Scan 1"));

    expect(onActivate).toHaveBeenCalledWith("b");
  });

  it("reports changes to the search and filters", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    render(
      <ContextPanel
        title="Scans"
        items={ITEMS}
        search=""
        onSearchChange={onSearchChange}
        searchLabel="Search scans"
        filters={[STATUS_FILTER]}
        onFilterChange={onFilterChange}
      />,
    );

    await user.type(screen.getByLabelText("Search scans"), "4");
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(screen.getByRole("option", { name: "Abort" }));

    expect(onSearchChange).toHaveBeenCalledWith("4");
    expect(onFilterChange).toHaveBeenCalledWith("status", "abort");
  });

  it("says when there is nothing yet", () => {
    render(
      <ContextPanel title="Scans" items={[]} emptyMessage="No scans yet" />,
    );

    expect(screen.getByText("No scans yet")).toBeVisible();
    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });

  it("offers to clear the filters when they hide everything", async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    render(
      <ContextPanel
        title="Scans"
        items={[]}
        filters={[{ ...STATUS_FILTER, value: "abort" }]}
        onClearFilters={onClearFilters}
      />,
    );

    expect(screen.getByText("Nothing matches")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onClearFilters).toHaveBeenCalled();
  });

  it("shows placeholders while loading, and errors", () => {
    const { rerender } = render(
      <ContextPanel title="Scans" items={ITEMS} loading />,
    );

    expect(screen.queryByText("Scan 2")).not.toBeInTheDocument();

    rerender(<ContextPanel title="Scans" items={[]} error="Could not fetch" />);

    expect(screen.getByText("Could not fetch")).toBeVisible();
    expect(screen.queryByText("Nothing yet")).not.toBeInTheDocument();
  });
});
