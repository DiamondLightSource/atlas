import { render, screen, userEvent } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { ScanWorkspace } from "./ScanWorkspace";
import { useGetChildren, type TiledNode } from "./tiledService";

vi.mock("./tiledService", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./tiledService")>()),
  useGetChildren: vi.fn(),
}));

const RUN: TiledNode = {
  id: "run-uid",
  path: "p48/cm44196/cm44196-1/run-uid",
  structureFamily: "container",
  specs: ["BlueskyRun"],
  metadata: { start: { scan_id: 3, plan_name: "scan" } },
};

const PRIMARY: TiledNode = {
  id: "primary",
  path: `${RUN.path}/primary`,
  structureFamily: "table",
  specs: [],
  metadata: { stream: "primary" },
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("ScanWorkspace", () => {
  it("shows the metadata of a stream picked in the tree", async () => {
    const user = userEvent.setup();
    vi.mocked(useGetChildren).mockReturnValue({
      data: { nodes: [PRIMARY], count: 1 },
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useGetChildren>);
    const { rerender } = render(
      <ThemeProvider theme={DiamondDSTheme}>
        <ScanWorkspace run={RUN} />
      </ThemeProvider>,
    );

    await user.click(await screen.findByText("primary"));
    // The run is refetched, e.g. when it finishes, without losing the pick
    rerender(
      <ThemeProvider theme={DiamondDSTheme}>
        <ScanWorkspace run={{ ...RUN, metadata: { ...RUN.metadata } }} />
      </ThemeProvider>,
    );

    expect(screen.getByText(PRIMARY.path)).toBeVisible();
    expect(screen.getByText(/"stream": "primary"/)).toBeVisible();
  });
});
