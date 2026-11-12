import { render, screen, userEvent } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { LatestScan } from "./LatestScan";
import { useGetLatestRun, type TiledNode } from "./tiledService";

vi.mock("./tiledService", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./tiledService")>()),
  useGetLatestRun: vi.fn(),
}));

const RUN: TiledNode = {
  id: "run-4",
  path: "p48/cm44196/cm44196-1/run-4",
  structureFamily: "container",
  specs: ["BlueskyRun"],
  metadata: {
    start: { scan_id: 4, plan_name: "count" },
    stop: { exit_status: "success" },
  },
};

function mockLatestRun(latest: Partial<ReturnType<typeof useGetLatestRun>>) {
  vi.mocked(useGetLatestRun).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    ...latest,
  } as ReturnType<typeof useGetLatestRun>);
}

function ScansRoute() {
  const { state } = useLocation();
  return (
    <p>
      Scans page showing {state.node.id} at {state.fields[0].join(".")}
    </p>
  );
}

function renderLatestScan() {
  render(
    <MemoryRouter>
      <ThemeProvider theme={DiamondDSTheme}>
        <Routes>
          <Route path="/" element={<LatestScan session="cm44196-1" />} />
          <Route path="/scans/scans" element={<ScansRoute />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("LatestScan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("summarises the session's newest scan, with a link to the rest", () => {
    mockLatestRun({ data: RUN });
    renderLatestScan();

    expect(useGetLatestRun).toHaveBeenCalledWith("cm44196-1");
    expect(screen.getByText("Scan ID:")).toBeVisible();
    expect(screen.getByText("4")).toBeVisible();
    expect(screen.getByText("Success")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "View all scans" }),
    ).toHaveAttribute("href", "/scans/scans");
  });

  it.each([
    ["4", "start.scan_id"],
    ["count", "start.plan_name"],
    ["Success", "stop.exit_status"],
  ])(
    "opens Scans at the scan's field when %s is clicked",
    async (value, field) => {
      const user = userEvent.setup();
      mockLatestRun({ data: RUN });
      renderLatestScan();

      await user.click(screen.getByRole("button", { name: value }));

      expect(
        screen.getByText(`Scans page showing run-4 at ${field}`),
      ).toBeVisible();
    },
  );

  it("says when the session has no scans yet", () => {
    mockLatestRun({ data: null });
    renderLatestScan();

    expect(screen.getByText("No scans in this session yet")).toBeVisible();
  });

  it("says when Tiled cannot be reached", () => {
    mockLatestRun({ isError: true });
    renderLatestScan();

    expect(screen.getByText("Could not fetch from Tiled")).toBeVisible();
  });
});
