import * as React from "react";
import {
  render,
  screen,
  within,
  userEvent,
  queryByText,
  getByText,
} from "@atlas/vitest-conf";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { RunPlanButton } from "./RunPlanButton";
import { BlueapiProvider } from "@atlas/blueapi-query";
import {
  createTestQueryClient,
  renderWithProviders,
  useSubmitTask,
} from "@atlas/blueapi-query";
import type { Api, TaskResponse } from "@atlas/blueapi";
import { Snackbar } from "@mui/material";

describe("RunPlanButton", () => {
  let queryClient: QueryClient;
  let api: Api;

  beforeEach(() => {
    queryClient = createTestQueryClient();

    api = {
      tasks: {
        submit: vi.fn(),
      },
      worker: {
        setActiveTask: vi.fn(),
      },
    } as unknown as Api;
  });

  it("renders default button with Run Plan", () => {
    render(
      <BlueapiProvider api={api}>
        <QueryClientProvider client={queryClient}>
          <RunPlanButton
            name="test_plan"
            params={[]}
            instrumentSession="cm12345-1"
          />
        </QueryClientProvider>
        ,
      </BlueapiProvider>,
    );
    expect(screen.getByText("Run"));
  });

  it("presses button", () => {
    const mockResponse: TaskResponse = {
      task_id: "92e6a0c3-52ff-4161-84ec-73096697e571",
    };
    vi.mocked(api.worker.setActiveTask).mockResolvedValue(mockResponse);

    render(
      <BlueapiProvider api={api}>
        <QueryClientProvider client={queryClient}>
          <RunPlanButton
            name="test_plan"
            params={[]}
            instrumentSession="cm12345-1"
          />
        </QueryClientProvider>
        ,
      </BlueapiProvider>,
    );
    // screen.getByText("Run").click();

    const runPlanButton = screen.getByText("Run");
    const user = userEvent.setup();
    user.click(runPlanButton);
    expect(screen.queryByText("successful")).toBeInTheDocument();

    // const message = queryByText("successful");
    // expect(message).toBeInTheDocument();
  });
});
