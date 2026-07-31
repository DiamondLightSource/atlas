import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from "@atlas/vitest-conf";
import { RunPlanButton } from "./RunPlanButton";
import type { Api, TaskResponse, TrackableTask } from "@atlas/blueapi";

// Mocks with starting return values
const mockResponse: TaskResponse = {
  task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
};
const mockTask: TrackableTask = {
  task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
  task: { name: "test_plan", params: {}, metadata: {} },
  request_id: null,
  is_complete: true,
  is_pending: false,
  errors: [],
  outcome: { outcome: "success" },
};

// const mockWorkerState = vi.fn(() => ({ data: "IDLE" }));
// const mockSubmitTask = {
//   mutateAsync: vi.fn(() => Promise.resolve(mockResponse)),
// };
// const mockSetActiveTask = {
//   mutateAsync: vi.fn(() => Promise.resolve(mockResponse)),
// };

// const mockApi = {
//   worker: { getState: vi.fn(() => Promise.resolve("IDLE")) },
//   tasks: { get: vi.fn(() => Promise.resolve(mockTask)) },
// } as unknown as Api;

const {
  mockWorkerState,
  mockSubmitTask,
  mockSetActiveTask,
  mockGetState,
  mockGetTask,
} = vi.hoisted(() => {
  return {
    mockWorkerState: vi.fn(),
    mockSubmitTask: vi.fn(),
    mockSetActiveTask: vi.fn(),
    mockGetState: vi.fn(),
    mockGetTask: vi.fn(),
  };
});

// vi.mock("@atlas/blueapi-query", () => ({
//   useGetWorkerState: () => mockWorkerState(),
//   useSubmitTask: () => mockSubmitTask,
//   useSetActiveTask: () => mockSetActiveTask,
//   useBlueapi: () => mockApi,
// }));

vi.mock("@atlas/blueapi-query", () => ({
  useGetWorkerState: () => mockWorkerState(),
  useSubmitTask: () => ({ mutateAsync: mockSubmitTask }),
  useSetActiveTask: () => ({ mutateAsync: mockSetActiveTask }),
  useBlueapi: () => ({
    worker: { getState: mockGetState },
    tasks: { get: mockGetTask },
  }),
}));

describe("RunPlanButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockWorkerState.mockReset();
    // mockWorkerState.mockReturnValue({ data: "IDLE" });
    // mockSubmitTask.mutateAsync.mockClear();
    // mockSetActiveTask.mutateAsync.mockClear();
    mockWorkerState.mockReturnValue({ data: "IDLE" });
    mockGetState.mockResolvedValue("IDLE");
    mockGetTask.mockResolvedValue(mockTask);
    mockSubmitTask.mockResolvedValue(mockResponse);
    mockSetActiveTask.mockResolvedValue(mockResponse);
  });

  it("renders default button with Run", () => {
    // mockWorkerState.mockReturnValue({ data: "IDLE" } as any);
    mockWorkerState.mockReturnValue({ data: "IDLE" });
    // mockSubmitTask.mutateAsync.mockReturnValue({ data: mockResponse } as any);
    mockSubmitTask.mockReturnValue({ data: mockResponse });

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
    mockWorkerState.mockReturnValue({ data: "IDLE" } as any);
    // mockSubmitTask.mutateAsync.mockReturnValue({ data: mockResponse } as any);
    mockSubmitTask.mockReturnValue({ data: mockResponse });
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
    // mockWorkerState.mockReturnValue({ data: "RUNNING" } as any);
    mockWorkerState.mockReturnValue({ data: "RUNNING" });
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );
    expect(screen.getByText("Run")).toBeDisabled();
  });

  it("shows plan submission successful message then plan succeeded message when button is pressed with successful response", async () => {
    // mockSubmitTask.mutateAsync.mockResolvedValue({ data: mockResponse } as any);
    // mockSetActiveTask.mutateAsync.mockResolvedValue({
    //   data: mockTask,
    // } as any);
    mockSubmitTask.mockResolvedValue(mockResponse);
    mockSetActiveTask.mockResolvedValue(mockResponse);
    mockGetTask.mockResolvedValue(mockTask);

    const user = userEvent.setup();
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );

    user.click(screen.getByText("Run"));
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Plan submission successful!");
    });
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Plan succeeded");
    });
  });

  it("shows submission failed message when button is pressed with failed response", async () => {
    // mockSubmitTask.mutateAsync.mockResolvedValue(null as any);
    mockSubmitTask.mockResolvedValue(null);

    const user = userEvent.setup();
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );

    user.click(screen.getByText("Run"));
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Plan submission failed!");
    });
  });

  it("shows plan submission succeeds but plan has errors during execution", async () => {
    const mockFailedTask: TrackableTask = {
      task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
      task: { name: "test_plan", params: {}, metadata: {} },
      request_id: null,
      is_complete: true,
      is_pending: false,
      errors: ["Some error. You should see this text."],
      outcome: { outcome: "error" },
    };

    // mockSubmitTask.mutateAsync.mockResolvedValue({ data: mockResponse } as any);
    // mockSetActiveTask.mutateAsync.mockResolvedValue({
    //   data: mockFailedTask,
    // } as any);
    mockSubmitTask.mockResolvedValue(mockResponse);
    mockSetActiveTask.mockResolvedValue(mockResponse);
    mockGetTask.mockResolvedValue(mockFailedTask);

    const user = userEvent.setup();
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );

    user.click(screen.getByText("Run"));
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Plan submission successful!");
    });
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(
        "Failed to run plan test_plan, see console and blueapi logs for full error.",
      );
    });
  });
});
