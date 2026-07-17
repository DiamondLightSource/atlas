import { render, screen, userEvent } from "@atlas/vitest-conf";
import { AbortPlanButton } from "./AbortPlanButton";
import { useSetWorkerState } from "@atlas/blueapi-query";
import type { WorkerStateRequest } from "@atlas/blueapi";

describe("AbortPlanButton", () => {
  vi.mock("@atlas/blueapi-query");
  const mockedHook = vi.mocked(useSetWorkerState);

  const mutate = vi.fn();

  mockedHook.mockReturnValue({ mutate } as any);

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
