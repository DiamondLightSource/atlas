import { render, screen, userEvent, waitFor } from "@atlas/vitest-conf";
import { useState } from "react";
import { RunTree } from "./RunTree";
import type { Selection } from "./selection";
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

/** RunTree, keeping track of what is selected */
function Tree({
  initialSelection = null,
}: {
  initialSelection?: Selection | null;
}) {
  const [selection, setSelection] = useState(initialSelection);
  return <RunTree run={RUN} selection={selection} onSelect={setSelection} />;
}

function mockChildren(
  children: (
    ...args: Parameters<typeof useGetChildren>
  ) => Partial<ReturnType<typeof useGetChildren>>,
) {
  vi.mocked(useGetChildren).mockImplementation(
    (...args) => children(...args) as ReturnType<typeof useGetChildren>,
  );
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("RunTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChildren(() => ({
      data: { nodes: [PRIMARY], count: 1 },
      isPending: false,
      error: null,
    }));
  });

  it("shows the run open, with its streams", async () => {
    render(<Tree />);

    expect(screen.getByText("Scan 3 · scan")).toBeVisible();
    expect(await screen.findByText("primary")).toBeVisible();
    expect(screen.getByText("table")).toBeVisible();
    expect(useGetChildren).toHaveBeenCalledWith(RUN.path, 1);
  });

  it("collapses the run when it is clicked", async () => {
    const user = userEvent.setup();
    render(<Tree />);
    await screen.findByText("primary");

    await user.click(screen.getByText("Scan 3 · scan"));

    await waitFor(() =>
      expect(screen.queryByText("primary")).not.toBeInTheDocument(),
    );
  });

  it("shows the metadata of the selected entry", async () => {
    const user = userEvent.setup();
    render(<Tree />);

    expect(
      screen.getByText("Select an entry to see its metadata"),
    ).toBeVisible();

    await user.click(await screen.findByText("primary"));

    expect(screen.getByText(PRIMARY.path)).toBeVisible();
    expect(screen.getByText(/"stream": "primary"/)).toBeVisible();
  });

  it("pages through a stream with many entries", async () => {
    const user = userEvent.setup();
    mockChildren((_, page = 1) => ({
      data: {
        nodes: [
          {
            ...PRIMARY,
            id: `entry-${page}`,
            path: `${RUN.path}/entry-${page}`,
          },
        ],
        count: 120,
      },
      isPending: false,
      error: null,
    }));
    render(<Tree />);

    expect(await screen.findByText("1–50 of 120")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(await screen.findByText("entry-2")).toBeVisible();
    expect(useGetChildren).toHaveBeenLastCalledWith(RUN.path, 2);
  });

  it("shows an error when Tiled cannot be reached", async () => {
    mockChildren(() => ({
      data: undefined,
      isPending: false,
      error: new Error("Request failed with status code 502"),
    }));

    render(<Tree />);

    expect(
      await screen.findByText(
        "Could not fetch from Tiled: Request failed with status code 502",
      ),
    ).toBeVisible();
  });

  it("highlights and scrolls to the selected fields", () => {
    render(
      <Tree
        initialSelection={{ node: RUN, fields: [["start", "plan_name"]] }}
      />,
    );

    const line = screen.getByText(/"plan_name": "scan"/);
    expect(line).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByText(/"scan_id": 3/)).not.toHaveAttribute(
      "data-highlighted",
    );
    expect(line.scrollIntoView).toHaveBeenCalled();
  });
});
