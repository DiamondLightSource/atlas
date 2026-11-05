import { useGetWorkerState } from "@atlas/blueapi-query";
import { render } from "@atlas/vitest-conf";
import { DataCard } from "@diamondlightsource/sci-react-ui";
import { BlueapiWorkerState } from "./BlueapiWorkerState";

vi.mock("@atlas/blueapi-query");
vi.mock("@diamondlightsource/sci-react-ui", () => ({
  DataCard: vi.fn(() => null),
}));

/**
 * This test simply verifies that the DataCard SciReactUI component is invoked
 * with the correct arguments for each state
 */
describe("BlueapiWorkerState", () => {
  const mockedState = vi.mocked(useGetWorkerState);
  const mockedDataCard = vi.mocked(DataCard);

  it.each([
    ["IDLE", "Idle", "success"],
    ["RUNNING", "Running", "info"],
    ["PAUSING", "Pausing", "warning"],
    ["PAUSED", "Paused", "warning"],
    ["HALTING", "Halting", "warning"],
    ["STOPPING", "Stopping", "danger"],
    ["ABORTING", "Aborting", "danger"],
    ["SUSPENDING", "Suspending", "danger"],
    ["PANICKED", "Panicked", "danger"],
    ["UNKNOWN", "Unknown", "neutral"],
  ])(
    "represents state %s with value %s and colour %s",
    (state, expectedValue, expectedColour) => {
      mockedState.mockReturnValue({
        data: state,
      } as ReturnType<typeof useGetWorkerState>);

      render(<BlueapiWorkerState />);

      expect(mockedDataCard).toHaveBeenCalledWith(
        {
          title: "Blueapi worker",
          value: { value: expectedValue },
          colour: expectedColour,
        },
        expect.anything(),
      );
    },
  );
});
