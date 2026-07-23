import { render, screen } from "@atlas/vitest-conf";
import { RunPlanButton } from "./RunPlanButton";
import { useGetWorkerState, useSubmitTask } from "@atlas/blueapi-query";
import type { Api, TaskResponse } from "@atlas/blueapi";

vi.mock("@atlas/blueapi-query");
const workerStateMock = vi.mocked(useGetWorkerState);
const submitTaskMock = vi.mocked(useSubmitTask);
const mockResponse: TaskResponse = {
  task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
};

describe("RunPlanButton", () => {
  it("renders default button with Run", () => {
    workerStateMock.mockReturnValue({ data: "IDLE" } as any);
    submitTaskMock.mockReturnValue({ data: mockResponse } as any);

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
    submitTaskMock.mockReturnValue({ data: mockResponse } as any);
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
    submitTaskMock.mockReturnValue({ data: mockResponse } as any);
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
    submitTaskMock.mockRejectedValue;
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );
    screen.getByText("Run").click();
    expect(screen.findByTestId("Plan submission failed!"));
  });
});
