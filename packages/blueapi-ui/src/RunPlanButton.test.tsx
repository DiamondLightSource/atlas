import * as React from "react";
import { render, screen, within, userEvent } from "@atlas/vitest-conf";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { RunPlanButton } from "./RunPlanButton";
import { BlueapiProvider } from "@atlas/blueapi-query";
import {
  createTestQueryClient,
  renderWithProviders,
  useSubmitTask,
} from "@atlas/blueapi-query";
import type { Api } from "@atlas/blueapi";

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
});
