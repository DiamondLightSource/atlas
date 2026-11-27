import { render, screen, userEvent, within } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { MemoryRouter } from "react-router-dom";
import { NO_SCANS } from "./Message";
import { ScanBrowser } from "./ScanBrowser";
import type { Selection } from "./selection";
import {
  useGetChildren,
  useGetLatestRun,
  useGetPlanNames,
  useRefreshOnRunChange,
  type ScanQuery,
  type TiledNode,
} from "./tiledService";

vi.mock("./tiledService", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./tiledService")>()),
  useGetChildren: vi.fn(),
  useGetLatestRun: vi.fn(),
  useGetPlanNames: vi.fn(),
  useRefreshOnRunChange: vi.fn(),
}));

const SESSION_PATH = "p48/cm44196/cm44196-1";

function makeRun(scanId: number, stop?: object): TiledNode {
  return {
    id: `run-${scanId}`,
    path: `${SESSION_PATH}/run-${scanId}`,
    structureFamily: "container",
    specs: ["BlueskyRun"],
    metadata: {
      start: { scan_id: scanId, plan_name: "count", num_points: 5 },
      ...(stop && { stop }),
    },
  };
}

const SCAN_2 = makeRun(2, { exit_status: "success" });
const SCAN_1 = makeRun(1, { exit_status: "abort" });

function mockLatestRun(run: TiledNode | null) {
  vi.mocked(useGetLatestRun).mockReturnValue({
    data: run,
    isPending: false,
    isError: false,
    isSuccess: true,
  } as ReturnType<typeof useGetLatestRun>);
}

/** The session's scans that match each query */
function mockScans(scans: (query: ScanQuery) => TiledNode[]) {
  vi.mocked(useGetChildren).mockImplementation((path, _page, query = {}) => {
    const nodes = path === SESSION_PATH ? scans(query) : [];
    return {
      data: { nodes, count: nodes.length },
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useGetChildren>;
  });
}

/** `opened` is a scan, and its fields, picked from elsewhere such as the Dashboard */
function browser(opened?: Selection) {
  return (
    <MemoryRouter initialEntries={[{ state: opened }]}>
      <ThemeProvider theme={DiamondDSTheme}>
        <ScanBrowser session="cm44196-1" />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderBrowser(opened?: Selection) {
  return render(browser(opened));
}

function workspace() {
  return within(screen.getByRole("region", { name: "Selected scan" }));
}

function panel() {
  return within(screen.getByRole("complementary", { name: "Scans" }));
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("ScanBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLatestRun(SCAN_2);
    mockScans(({ status }) =>
      status === "abort" ? [SCAN_1] : [SCAN_2, SCAN_1],
    );
    vi.mocked(useGetPlanNames).mockReturnValue({
      data: ["count"],
    } as ReturnType<typeof useGetPlanNames>);
  });

  it("lists the session's scans and opens the newest", () => {
    renderBrowser();

    const panel = within(screen.getByRole("complementary", { name: "Scans" }));
    expect(panel.getByText("Scan 2")).toBeVisible();
    expect(panel.getByText("Scan 1")).toBeVisible();
    expect(workspace().getByText("Scan 2 · count")).toBeVisible();
    expect(useRefreshOnRunChange).toHaveBeenCalledWith("cm44196-1");
  });

  it("opens the scan that is clicked", async () => {
    const user = userEvent.setup();
    renderBrowser();

    await user.click(screen.getByText("Scan 1"));

    expect(workspace().getByText("Scan 1 · count")).toBeVisible();
    expect(screen.getByRole("button", { current: true })).toHaveTextContent(
      "Scan 1",
    );
  });

  it("opens a scan picked on the Dashboard at the field that was clicked", () => {
    renderBrowser({ node: SCAN_1, fields: [["start", "num_points"]] });

    expect(workspace().getByText("Scan 1 · count")).toBeVisible();
    expect(screen.getByText(/"num_points": 5/)).toHaveAttribute(
      "data-highlighted",
      "true",
    );
  });

  it("ignores a scan opened from another session", () => {
    renderBrowser({
      node: { ...SCAN_1, path: "p48/cm44196/cm44196-2/run-1" },
      fields: [["start", "num_points"]],
    });

    expect(workspace().getByText("Scan 2 · count")).toBeVisible();
  });

  it("filters the scans, and counts them against the total", async () => {
    const user = userEvent.setup();
    renderBrowser();

    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(screen.getByRole("option", { name: "Abort" }));

    expect(useGetChildren).toHaveBeenCalledWith(SESSION_PATH, 1, {
      search: undefined,
      status: "abort",
      plan: undefined,
    });
    expect(screen.queryByText("Scan 2")).toBeNull();
    expect(screen.getByText("1 of 2")).toBeVisible();
  });

  it("opens the only scan a search finds", async () => {
    const user = userEvent.setup();
    mockScans(({ search }) => (search === "1" ? [SCAN_1] : [SCAN_2, SCAN_1]));
    renderBrowser();

    await user.type(screen.getByLabelText("Search scans"), "1");

    expect(await workspace().findByText("Scan 1 · count")).toBeVisible();
  });

  it("highlights a card's value in the scan's metadata when clicked", async () => {
    const user = userEvent.setup();
    renderBrowser();

    await user.click(workspace().getByRole("button", { name: "5" }));

    expect(screen.getByText(/"num_points": 5/)).toHaveAttribute(
      "data-highlighted",
      "true",
    );
  });

  it("says when the session has no scans yet", () => {
    mockLatestRun(null);
    mockScans(() => []);
    renderBrowser();

    expect(screen.getByText("No scans found")).toBeVisible();
    expect(screen.getByText(NO_SCANS)).toBeVisible();
  });

  it("shows a scan that is missing its ID and points", () => {
    const partial: TiledNode = {
      ...SCAN_1,
      metadata: { start: { time: 1_700_000_000 } },
    };
    mockScans(() => [partial]);

    renderBrowser();

    expect(panel().getByText("Scan ?")).toBeVisible();
    expect(
      panel().getByText(new Date(1_700_000_000_000).toLocaleString()),
    ).toBeVisible();
    expect(panel().getByText("-")).toBeVisible();
  });

  it("shows progress while the scans load", async () => {
    vi.mocked(useGetLatestRun).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isSuccess: false,
    } as ReturnType<typeof useGetLatestRun>);
    vi.mocked(useGetChildren).mockReturnValue({
      data: undefined,
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useGetChildren>);

    renderBrowser();

    expect(panel().queryByText("Scan 2")).not.toBeInTheDocument();
    expect(
      await workspace().findByRole("progressbar", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("says when Tiled cannot be reached", () => {
    vi.mocked(useGetLatestRun).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      isSuccess: false,
    } as ReturnType<typeof useGetLatestRun>);
    vi.mocked(useGetChildren).mockReturnValue({
      data: undefined,
      isPending: false,
      error: new Error("Request failed with status code 502"),
    } as unknown as ReturnType<typeof useGetChildren>);

    renderBrowser();

    expect(
      panel().getByText(
        "Could not fetch from Tiled: Request failed with status code 502",
      ),
    ).toBeVisible();
    expect(workspace().getByText("Could not fetch from Tiled")).toBeVisible();
  });

  it("filters by plan", async () => {
    const user = userEvent.setup();
    vi.mocked(useGetPlanNames).mockReturnValue({
      data: ["count", "scan"],
    } as ReturnType<typeof useGetPlanNames>);
    renderBrowser();

    await user.click(screen.getByRole("combobox", { name: "Plan" }));
    await user.click(screen.getByRole("option", { name: "scan" }));

    expect(useGetChildren).toHaveBeenCalledWith(
      "p48/cm44196/cm44196-1",
      1,
      expect.objectContaining({ plan: "scan" }),
    );
  });

  it("clears the search and filters when nothing matches", async () => {
    const user = userEvent.setup();
    mockScans(({ search }) => (search ? [] : [SCAN_2, SCAN_1]));
    renderBrowser();

    await user.type(screen.getByLabelText("Search scans"), "abc");
    await user.click(
      await panel().findByRole("button", { name: "Clear filters" }),
    );

    expect(screen.getByLabelText("Search scans")).toHaveValue("");
  });

  it("pages through a session with many scans", () => {
    vi.mocked(useGetChildren).mockReturnValue({
      data: { nodes: [SCAN_2, SCAN_1], count: 120 },
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useGetChildren>);

    renderBrowser();

    expect(panel().getByText("1–50 of 120")).toBeVisible();
  });

  it("shows a picked scan finishing, even after a newer one starts", async () => {
    const user = userEvent.setup();
    const running = makeRun(3);
    mockLatestRun(running);
    mockScans(() => [running, SCAN_2]);
    const { rerender } = renderBrowser();
    await user.click(panel().getByText("Scan 3"));

    // Scan 3 finishes and scan 4 starts
    const next = makeRun(4);
    mockLatestRun(next);
    mockScans(() => [next, makeRun(3, { exit_status: "success" }), SCAN_2]);
    rerender(browser());

    expect(workspace().getByText("Scan 3 · count")).toBeVisible();
    expect(workspace().getByText("Success")).toBeVisible();
  });

  it("keeps showing a picked scan that the filters hide", async () => {
    const user = userEvent.setup();
    vi.mocked(useGetPlanNames).mockReturnValue({
      data: ["count", "scan"],
    } as ReturnType<typeof useGetPlanNames>);
    mockScans(({ plan }) => (plan ? [SCAN_2] : [SCAN_2, SCAN_1]));
    renderBrowser();
    await user.click(panel().getByText("Scan 1"));

    await user.click(screen.getByRole("combobox", { name: "Plan" }));
    await user.click(screen.getByRole("option", { name: "scan" }));

    expect(panel().queryByText("Scan 1")).not.toBeInTheDocument();
    expect(workspace().getByText("Scan 1 · count")).toBeVisible();
  });
});
