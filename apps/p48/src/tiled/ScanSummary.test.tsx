import { act, render, screen, userEvent } from "@atlas/vitest-conf";
import { DataCard, type DataCardProps } from "@diamondlightsource/sci-react-ui";
import { ScanSummary } from "./ScanSummary";
import type { TiledNode } from "./tiledService";

vi.mock("@diamondlightsource/sci-react-ui", () => ({
  DataCard: vi.fn(() => null),
}));

const START_TIME = 1_700_000_000;
const STOP_TIME = 1_700_000_010;

function makeRun(stop?: { exit_status: string; time: number }): TiledNode {
  return {
    id: "run-uid",
    path: "p48/cm44196/cm44196-1/run-uid",
    structureFamily: "container",
    specs: ["BlueskyRun"],
    metadata: {
      start: {
        uid: "run-uid",
        scan_id: 42,
        plan_name: "scan",
        detectors: ["det1", "det2"],
        motors: ["sample_x"],
        num_points: 10,
        time: START_TIME,
      },
      ...(stop && { stop }),
    },
  };
}

/** Makes the mocked DataCard render its values, so they can be clicked */
function renderDataCardValues() {
  vi.mocked(DataCard).mockImplementation((props: DataCardProps) => (
    <>
      {[props.value, props.value1, props.value2, props.subvalue].map(
        (item, i) => item && <span key={i}>{item.value}</span>,
      )}
    </>
  ));
}

describe("ScanSummary", () => {
  const mockedDataCard = vi.mocked(DataCard);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedDataCard.mockImplementation(() => <></>);
  });

  it("shows the scan ID, plan, devices and points", () => {
    render(
      <ScanSummary
        run={makeRun({ exit_status: "success", time: STOP_TIME })}
      />,
    );

    expect(mockedDataCard).toHaveBeenCalledWith(
      {
        title: "Scan",
        value1: { label: "Scan ID", value: "42" },
        value2: { label: "Plan", value: "scan" },
        colour: "neutral",
      },
      expect.anything(),
    );
    expect(mockedDataCard).toHaveBeenCalledWith(
      {
        title: "Devices",
        value1: { label: "Detectors", value: "2" },
        value2: { label: "Motors", value: "1" },
        colour: "neutral",
      },
      expect.anything(),
    );
    expect(mockedDataCard).toHaveBeenCalledWith(
      { title: "Points", value: { value: "10" }, colour: "neutral" },
      expect.anything(),
    );
  });

  it.each([
    ["success", "Success", "success"],
    ["abort", "Abort", "warning"],
    ["fail", "Fail", "danger"],
  ])(
    "represents exit status %s with value %s and colour %s",
    (exitStatus, expectedValue, expectedColour) => {
      render(
        <ScanSummary
          run={makeRun({ exit_status: exitStatus, time: STOP_TIME })}
        />,
      );

      expect(mockedDataCard).toHaveBeenCalledWith(
        {
          title: "Scan status",
          value: { value: expectedValue },
          subvalue: {
            label: "Finished",
            value: new Date(STOP_TIME * 1000).toLocaleTimeString(),
          },
          colour: expectedColour,
        },
        expect.anything(),
      );
    },
  );

  describe("while the run is going", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("represents a run without a stop document as running", () => {
      render(<ScanSummary run={makeRun()} />);

      expect(mockedDataCard).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Scan status",
          subvalue: {
            label: "Started",
            value: new Date(START_TIME * 1000).toLocaleTimeString(),
          },
          colour: "info",
        }),
        expect.anything(),
      );
    });

    it("shows how long it has been running, every second", () => {
      vi.setSystemTime((START_TIME + 133) * 1000);
      renderDataCardValues();
      render(<ScanSummary run={makeRun()} />);

      expect(screen.getByText("Running · 2m 13s")).toBeVisible();

      act(() => vi.advanceTimersByTime(1000));

      expect(screen.getByText("Running · 2m 14s")).toBeVisible();
    });

    it.each([
      [45, "45s"],
      [60, "1m 00s"],
      [3_900, "1h 05m"],
      [-5, "0s"],
    ])("shows %s seconds as %s", (seconds, text) => {
      vi.setSystemTime((START_TIME + seconds) * 1000);
      renderDataCardValues();
      render(<ScanSummary run={makeRun()} />);

      expect(screen.getByText(`Running · ${text}`)).toBeVisible();
    });

    it("shows only Running when the start time is missing", () => {
      renderDataCardValues();
      render(
        <ScanSummary
          run={{ ...makeRun(), metadata: { start: { scan_id: 42 } } }}
        />,
      );

      expect(screen.getByText("Running")).toBeVisible();
    });
  });

  it.each([
    ["Detectors", "2", ["start", "detectors"]],
    ["Motors", "1", ["start", "motors"]],
    ["Points", "10", ["start", "num_points"]],
    ["Scan ID", "42", ["start", "scan_id"]],
    ["Plan", "scan", ["start", "plan_name"]],
    ["Status", "Success", ["stop", "exit_status"]],
  ])(
    "shows %s in the tree when its value is clicked",
    async (_, text, field) => {
      const user = userEvent.setup();
      renderDataCardValues();
      const onShow = vi.fn();

      const run = makeRun({ exit_status: "success", time: STOP_TIME });
      render(<ScanSummary run={run} onShow={onShow} />);
      await user.click(screen.getByRole("button", { name: text }));

      expect(onShow).toHaveBeenCalledWith({ node: run, fields: [field] });
    },
  );

  it("shows - without a link for values a run lacks", () => {
    renderDataCardValues();

    render(
      <ScanSummary run={{ ...makeRun(), metadata: {} }} onShow={vi.fn()} />,
    );

    expect(screen.getAllByText("-")).toHaveLength(6);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
