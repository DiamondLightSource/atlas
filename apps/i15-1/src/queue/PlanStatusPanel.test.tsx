import { userEvent, render, screen, waitFor } from "@atlas/vitest-conf";
import { describe, expect, it, vi } from "vitest";

import { PlanStatusPanel } from "./PlanStatusPanel";
import type { BlueapiCallResponse } from "../../generated/queue";

vi.mock("../components/JsonView", () => ({
  JsonView: ({ data }: { data: unknown }) => (
    <div data-testid="json-view">{JSON.stringify(data)}</div>
  ),
}));

vi.mock("./TaskStatusIcon", () => ({
  TaskStatusIcon: ({ status }: { status: string }) => (
    <div data-testid="status-icon">{status}</div>
  ),
}));

const data = [
  {
    status: "Success",
    task_request: {
      name: "Plan A",
    },
    tiled_ids: ["123", "456"],
    scan_ids: ["10000", "10001"],
  },
  {
    status: "Waiting",
    task_request: {
      name: "Plan B",
    },
    tiled_ids: [],
    scan_ids: [],
  },
] as BlueapiCallResponse[];

describe("PlanStatusPanel", () => {
  it("renders all plans", () => {
    render(<PlanStatusPanel data={data} />);

    expect(screen.getByText("Plan A")).toBeInTheDocument();
    expect(screen.getByText("Plan B")).toBeInTheDocument();
  });

  it("starts collapsed", () => {
    render(<PlanStatusPanel data={data} />);

    expect(screen.queryByText('{"name":"Plan A"}')).not.toBeInTheDocument();
  });

  it("expands when clicked", async () => {
    const user = userEvent.setup();

    render(<PlanStatusPanel data={data} />);

    await user.click(screen.getByText("Plan A"));

    expect(screen.getByText('{"name":"Plan A"}')).toBeInTheDocument();
  });

  it("collapses when clicked twice", async () => {
    const user = userEvent.setup();

    render(<PlanStatusPanel data={data} />);

    const row = screen.getByText("Plan A");
    await user.click(row);

    expect(screen.getByText('{"name":"Plan A"}')).toBeInTheDocument();

    await user.click(row);
    await waitFor(() => {
      expect(screen.queryByText('{"name":"Plan A"}')).not.toBeInTheDocument();
    });
  });

  it("passes status to TaskStatusIcon", () => {
    render(<PlanStatusPanel data={data} />);

    const icons = screen.getAllByTestId("status-icon");

    expect(icons[0]).toHaveTextContent("Success");
    expect(icons[1]).toHaveTextContent("Waiting");
  });
});

describe("TiledLinks", () => {
  it("renders a link for each tiled_id with the correct href", () => {
    render(<PlanStatusPanel data={data} />);

    const link1 = screen.getByText("10000").closest("a");
    const link2 = screen.getByText("10001").closest("a");

    expect(link1).toHaveAttribute(
      "href",
      "https://tiled-ui.diamond.ac.uk/ui/browse/123",
    );
    expect(link2).toHaveAttribute(
      "href",
      "https://tiled-ui.diamond.ac.uk/ui/browse/456",
    );
  });

  it("opens tiled links in a new tab safely", () => {
    render(<PlanStatusPanel data={data} />);

    const link = screen.getByText("10000").closest("a");

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders run numbers as plain text when there are no tiled_ids", () => {
    render(<PlanStatusPanel data={data} />);

    expect(screen.queryByText("Plan B")).toBeInTheDocument();
    // Plan B has no tiled_ids, so there should be no links rendered for it
    const allLinks = screen.queryAllByRole("link");
    expect(allLinks).toHaveLength(2); // only from Plan A
  });

  it("shows a 'tiled' tooltip on hover", async () => {
    const user = userEvent.setup();

    render(<PlanStatusPanel data={data} />);

    const link = screen.getByText("10000").closest("a") as HTMLElement;
    await user.hover(link);

    expect(await screen.findByText("tiled")).toBeInTheDocument();
  });

  it("renders plain text (not a link) when a tiled_id is null", () => {
    const dataWithNullId = [
      {
        status: "Success",
        task_request: { name: "Plan C" },
        tiled_ids: [null, "789"],
        scan_ids: ["20000", "20001"],
      },
    ] as BlueapiCallResponse[];

    render(<PlanStatusPanel data={dataWithNullId} />);

    expect(screen.getByText("20000")).toBeInTheDocument();
    expect(screen.getByText("20000").closest("a")).toBeNull();

    expect(screen.getByText("20001").closest("a")).toHaveAttribute(
      "href",
      "https://tiled-ui.diamond.ac.uk/ui/browse/789",
    );
  });
});
