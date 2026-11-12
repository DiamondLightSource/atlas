import { render, screen, userEvent, within } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { MemoryRouter } from "react-router-dom";
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
function renderBrowser(opened?: Selection) {
  return render(
    <MemoryRouter initialEntries={[{ state: opened }]}>
      <ThemeProvider theme={DiamondDSTheme}>
        <ScanBrowser session="cm44196-1" />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

function workspace() {
  return within(screen.getByRole("region", { name: "Selected scan" }));
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

    expect(screen.getByText("No scans yet")).toBeVisible();
    expect(screen.getByText("No scans in this session yet")).toBeVisible();
  });
});
