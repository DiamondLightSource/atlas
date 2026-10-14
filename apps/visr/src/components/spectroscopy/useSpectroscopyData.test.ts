import {
  binEdgesToAxis,
  CELL_PIXELS,
  fetchData,
  EMPTY_STRIPE_GREYS,
  splitEdges,
  toRgbNdt,
} from "./useSpectroscopyData";

/** Every pixel of one cell as [r, g, b] */
function cell(
  matrix: (number | null)[][],
  row: number,
  col: number,
  colour: "red" | "green" = "red",
) {
  const image = toRgbNdt(matrix, colour);
  const out: number[][] = [];
  for (let y = 0; y < CELL_PIXELS; y++) {
    for (let x = 0; x < CELL_PIXELS; x++) {
      const py = row * CELL_PIXELS + y;
      const px = col * CELL_PIXELS + x;
      out.push([0, 1, 2].map(ch => image.get(py, px, ch)));
    }
  }
  return out;
}

/** The single colour a measured cell is filled with */
function fill(matrix: (number | null)[][], row: number, col: number) {
  const pixels = cell(matrix, row, col);
  expect(new Set(pixels.map(p => p.join()))).toHaveLength(1);
  return pixels[0];
}

describe("toRgbNdt", () => {
  it("scales each value over the matrix's range in its own colour", () => {
    expect([0, 1, 2].map(c => fill([[10, 15, 20]], 0, c))).toEqual([
      [0, 0, 0],
      [128, 0, 0],
      [255, 0, 0],
    ]);
    expect(cell([[0, 4]], 0, 1, "green")[0]).toEqual([0, 255, 0]);
  });

  it("draws cells without a value as grey stripes, unlike any measured value", () => {
    const empty = cell([[0, null, 10]], 0, 1);
    const greys = new Set(
      empty.map(([r, g, b]) => (r === g && g === b ? r : -1)),
    );
    expect([...greys].sort()).toEqual([...EMPTY_STRIPE_GREYS].sort());
    expect(fill([[0, null, 10]], 0, 0)).toEqual([0, 0, 0]); // measured dark stays black
  });

  it("draws a single point, or equal values, at full brightness", () => {
    expect(fill([[42]], 0, 0)).toEqual([255, 0, 0]);
    expect(fill([[7, null, 7]], 0, 2)).toEqual([255, 0, 0]);
  });

  it("is laid out as rows of height x width x RGB, CELL_PIXELS per cell", () => {
    const image = toRgbNdt(
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      "green",
    );
    expect(image.shape).toEqual([2 * CELL_PIXELS, 3 * CELL_PIXELS, 3]);
  });
});

describe("splitEdges", () => {
  it("splits each bin into CELL_PIXELS equal parts, keeping the outer edges", () => {
    const edges = splitEdges([0, 4, 12]);
    expect(edges).toHaveLength(2 * CELL_PIXELS + 1);
    expect(edges[0]).toBe(0);
    expect(edges[CELL_PIXELS]).toBe(4);
    expect(edges[edges.length - 1]).toBe(12);
    expect(edges[1] - edges[0]).toBeCloseTo(4 / CELL_PIXELS);
  });
});

describe("binEdgesToAxis", () => {
  it("gives the plot the edges themselves, one more than the cells", () => {
    const axis = binEdgesToAxis([-0.5, 0.5, 1.5]);
    expect(Array.from(axis.data as Float64Array)).toEqual([-0.5, 0.5, 1.5]);
    expect(axis.shape).toEqual([3]);
  });

  it("needs at least two edges", () => {
    expect(() => binEdgesToAxis([1])).toThrow("At least two bin edges");
  });
});

describe("fetchData", () => {
  afterEach(() => vi.unstubAllGlobals());

  function respond(
    status: number,
    headers: Record<string, string> = {},
    body = {},
  ) {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify(body), { status, headers }),
      ),
    );
  }

  it("returns the binned images", async () => {
    respond(200, {}, { RedTotal: [[1]] });
    expect(await fetchData("uid")).toEqual({ RedTotal: [[1]] });
  });

  it("reports a 503 as not ready yet, waiting as long as Retry-After asks", async () => {
    respond(503, { "Retry-After": "2" });
    expect(await fetchData("uid")).toEqual({
      notReady: true,
      retryAfterMs: 2000,
    });
  });

  it("waits a second after a 503 without Retry-After", async () => {
    respond(503);
    expect(await fetchData("uid")).toEqual({
      notReady: true,
      retryAfterMs: 1000,
    });
  });

  it("still throws for other errors", async () => {
    respond(500);
    await expect(fetchData("uid")).rejects.toThrow();
  });
});
