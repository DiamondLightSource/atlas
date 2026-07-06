import { userEvent, render, screen, waitFor } from "@atlas/vitest-conf";
import { describe, expect, it, vi } from "vitest";

import { PlanStatusPanel } from "./PlanStatusPanel";
import type { BlueapiCallResponse } from "../../generated/queue";

vi.mock("../components/JsonView", () => ({
  JsonView: ({ data }: { data: unknown }) => (
    <div data-testid="json-view">{JSON.stringify(data)}</div>
  ),
}));

vi.mock("./StatusIcon", () => ({
  QueueStatusIcon: ({ status }: { status: string }) => (
    <div data-testid="status-icon">{status}</div>
  ),
}));

describe("PlanStatusPanel", () => {
  const data = [
    {
      status: "Success",
      task_request: {
        name: "Plan A",
      },
    },
    {
      status: "Waiting",
      task_request: {
        name: "Plan B",
      },
    },
  ] as BlueapiCallResponse[];

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

  it("passes status to QueueStatusIcon", () => {
    render(<PlanStatusPanel data={data} />);

    const icons = screen.getAllByTestId("status-icon");

    expect(icons[0]).toHaveTextContent("Success");
    expect(icons[1]).toHaveTextContent("Waiting");
  });
});
