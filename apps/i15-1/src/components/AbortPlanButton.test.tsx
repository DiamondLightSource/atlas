import { render, screen, userEvent } from "@atlas/vitest-conf";
import { AbortPlanButton } from "./AbortPlanButton";
import { useSetWorkerState } from "@atlas/blueapi-query";
import type { WorkerState, WorkerStateRequest } from "@atlas/blueapi";
import type { UseMutationResult } from "@tanstack/react-query";

describe("AbortPlanButton", () => {
  vi.mock("@atlas/blueapi-query");
  const mockedHook = vi.mocked(useSetWorkerState);

  const mutate = vi.fn();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  mockedHook.mockReturnValue({ mutate } as any as UseMutationResult<
    WorkerState,
    Error,
    WorkerStateRequest
  >);

  it("renders default Abort button", () => {
    render(<AbortPlanButton />);

    expect(screen.getByText("Abort"));
  });

  it("when abort clicked the worker state changes and alert comes on screen", async () => {
    const expectedRequest: WorkerStateRequest = {
      new_state: "ABORTING",
      reason: "Abort button pressed",
    };
    const user = userEvent.setup();
    render(<AbortPlanButton />);

    const button = screen.getByText("Abort");
    await user.click(button);
    expect(mutate).toHaveBeenCalledWith(expectedRequest);
    expect(
      screen.findByTestId("Abort button pressed, will abort current plan ..."),
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toBeVisible();
  });
});
