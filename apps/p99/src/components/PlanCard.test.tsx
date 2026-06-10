import { render, screen, waitFor } from "@atlas/vitest-conf";
import { fireEvent } from "@testing-library/react";
import { PlanCard } from "./PlanCard";
import type { Plan } from "@atlas/blueapi";

const mockUseGetWorkerState = vi.fn(() => ({ data: "IDLE" }));
const mockSubmitTask = {
  mutateAsync: vi.fn(() => Promise.resolve({ task_id: "task-1" })),
};
const mockStartTask = { mutateAsync: vi.fn(() => Promise.resolve()) };

vi.mock("@atlas/blueapi-query", () => ({
  useGetWorkerState: () => mockUseGetWorkerState(),
  useSubmitTask: () => mockSubmitTask,
  useSetActiveTask: () => mockStartTask,
}));

const mockPlan: Plan = {
  name: "test-plan",
  description: "Test plan description\n\nParameters:\nSome params",
  schema: {
    properties: {
      param1: {
        type: "string",
        title: "Parameter 1",
        description: "First parameter",
      },
      param2: {
        type: "number",
        title: "Parameter 2",
        description: "Second parameter",
      },
    },
    required: ["param1"],
  },
};

describe("PlanCard", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetWorkerState.mockReset();
    mockUseGetWorkerState.mockReturnValue({ data: "IDLE" });
    mockSubmitTask.mutateAsync.mockClear();
    mockStartTask.mutateAsync.mockClear();
  });

  it("renders the plan name and description", () => {
    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );

    expect(screen.getByText("test-plan")).toBeInTheDocument();
    expect(screen.getByText(/Test plan description/)).toBeInTheDocument();
  });

  it("renders accordion with configure details", async () => {
    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );

    // Click accordion to expand
    const accordionButton = screen.getByRole("button", {
      name: /Configure & View Details/i,
    });
    fireEvent.click(accordionButton);

    await waitFor(() => {
      expect(screen.getByText(/Protocol Documentation/)).toBeInTheDocument();
    });
  });

  it("enables submit button when worker is idle", () => {
    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const runButton = buttons.find(btn => btn.textContent?.includes("Run"));
    expect(runButton).not.toBeDisabled();
  });

  it("disables submit button when worker is busy", () => {
    mockUseGetWorkerState.mockReturnValue({ data: "RUNNING" });

    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const runButton = buttons.find(btn => btn.textContent?.includes("Run"));
    expect(runButton).toBeDisabled();
  });

  it("shows configure & view details button", () => {
    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );

    const configButton = screen.getByRole("button", {
      name: /Configure & View Details/i,
    });
    expect(configButton).toBeInTheDocument();
  });

  it("submits the form successfully and triggers onSuccess", async () => {
    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );
    const accordionButton = screen.getByRole("button", {
      name: /Configure & View Details/i,
    });
    fireEvent.click(accordionButton);

    const param1Input = screen.getByLabelText(/param1/i);
    const param2Input = screen.getByLabelText(/param2/i);

    fireEvent.change(param1Input, { target: { value: "kupo" } });
    fireEvent.change(param2Input, { target: { value: "42" } });

    const runButton = screen.getByRole("button", { name: /Run test-plan/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(mockSubmitTask.mutateAsync).toHaveBeenCalledWith({
        name: "test-plan",
        params: {
          param1: "kupo",
          param2: 42,
        },
        instrument_session: "test-session",
      });
    });
    expect(mockStartTask.mutateAsync).toHaveBeenCalledWith("task-1");

    expect(mockOnSuccess).toHaveBeenCalledWith(
      "Plan test-plan started successfully!",
    );
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("handles triggers onError", async () => {
    mockSubmitTask.mutateAsync.mockRejectedValueOnce({
      response: {
        data: {
          detail: [
            {
              loc: ["body", "params", "param2"],
              msg: "value is not a valid integer",
              type: "type_error.integer",
            },
          ],
        },
      },
    });

    render(
      <PlanCard
        plan={mockPlan}
        instrumentSession="test-session"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />,
    );

    const runButton = screen.getByRole("button", { name: /Run test-plan/i });
    fireEvent.click(runButton);
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        "param2: value is not a valid integer",
      );
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
