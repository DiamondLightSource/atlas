import { render, screen } from "@atlas/vitest-conf";
import { getWorkflowStatusIcon } from "./StatusIcons";

describe("getWorkflowStatusIcon", () => {
  it("renders the Unknown icon", () => {
    render(getWorkflowStatusIcon("Unknown"));
    expect(screen.getByTestId("status-icon-unknown")).toBeInTheDocument();
  });
  it("renders the WorkflowPendingStatus icon", () => {
    render(getWorkflowStatusIcon("WorkflowPendingStatus"));
    expect(screen.getByTestId("status-icon-pending")).toBeInTheDocument();
  });
  it("renders the WorkflowRunningStatus icon", () => {
    render(getWorkflowStatusIcon("WorkflowRunningStatus"));
    expect(screen.getByTestId("status-icon-running")).toBeInTheDocument();
  });
  it("renders the WorkflowSucceededStatus icon", () => {
    render(getWorkflowStatusIcon("WorkflowSucceededStatus"));
    expect(screen.getByTestId("status-icon-succeeded")).toBeInTheDocument();
  });
  it("renders the WorkflowFailedStatus icon", () => {
    render(getWorkflowStatusIcon("WorkflowFailedStatus"));
    expect(screen.getByTestId("status-icon-failed")).toBeInTheDocument();
  });
  it("renders the WorkflowErroredStatus icon", () => {
    render(getWorkflowStatusIcon("WorkflowErroredStatus"));
    expect(screen.getByTestId("status-icon-errored")).toBeInTheDocument();
  });
});
