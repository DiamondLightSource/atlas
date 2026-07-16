import { render, screen } from "@atlas/vitest-conf";
import { RunPlanButton } from "./RunPlanButton";
import {
  useGetWorkerState,
  useSubmitTask,
  useSetActiveTask,
  useBlueapi,
} from "@atlas/blueapi-query";
import type { Api, TaskResponse } from "@atlas/blueapi";

// Mocks with starting return values
const mockResponse: TaskResponse = {
  task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
};
const workerStateMock = vi.fn(() => ({ data: "IDLE" }));
const submitTaskMock = {
  mutateAsync: vi.fn(() => Promise.resolve(mockResponse)),
};
const setActiveTaskMock = { mutateAsync: vi.fn(() => Promise.resolve()) };

vi.mock("@atlas/blueapi-query", () => ({
  useGetWorkerState: () => workerStateMock(),
  useSubmitTask: () => submitTaskMock,
  useSetActiveTask: () => setActiveTaskMock,
  useBlueapi: vi.fn(),
  // useBlueapi: { tasks: { get: vi.fn() } } as unknown as Api,
}));

describe("RunPlanButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workerStateMock.mockReset();
    workerStateMock.mockReturnValue({ data: "IDLE" });
    submitTaskMock.mutateAsync.mockClear();
    setActiveTaskMock.mutateAsync.mockClear();
  });

  it("renders default button with Run", () => {
    workerStateMock.mockReturnValue({ data: "IDLE" } as any);
    submitTaskMock.mutateAsync.mockReturnValue({ data: mockResponse } as any);

    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );

    expect(screen.getByText("Run"));
  });

  it("renders button with custom text", () => {
    workerStateMock.mockReturnValue({ data: "IDLE" } as any);
    submitTaskMock.mutateAsync.mockReturnValue({ data: mockResponse } as any);
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
        buttonText="My Button Text"
      />,
    );
    expect(screen.getByText("My Button Text"));
  });

  it("renders button as diabled when worker is busy", () => {
    workerStateMock.mockReturnValue({ data: "RUNNING" } as any);
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );
    expect(screen.getByText("Run")).toBeDisabled();
  });

  it("success message appears when button is pressed with successful response", () => {
    workerStateMock.mockReturnValue({ data: "IDLE" } as any);
    submitTaskMock.mutateAsync.mockReturnValue({ data: mockResponse } as any);
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );
    screen.getByText("Run").click();
    expect(screen.findByText("Plan submission successful!"));
  });

  it("failure message appears when button is pressed with failed response", () => {
    submitTaskMock.mutateAsync.mockRejectedValue;
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );
    screen.getByText("Run").click();
    expect(screen.findByTestId("Plan submission failed!"));
    expect(
      screen.findByText(
        "Failed to run plan test_plan, see console and blueapi logs for full error.",
      ),
    );
  });

  it("Plan submission succeeds but plan fails during execution", () => {});
});
