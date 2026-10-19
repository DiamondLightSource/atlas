import {
  binEdgesToAxis,
  cellPixelsFor,
  LINE_SPACING,
  fetchData,
  orEmptyLike,
  splitEdges,
  DEFAULT_STRIPES,
  stripesOn,
  toChannels,
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
  const size = cellPixelsFor(matrix[0].length, matrix.length);
  const out: number[][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const py = row * size + y;
      const px = col * size + x;
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

  it("draws cells without a value as the background crossed by thin lines", () => {
    const empty = cell([[0, null, 10]], 0, 1).map(p => p.join());
    const [background, line] = DEFAULT_STRIPES.map(c => c.join());
    expect(new Set(empty)).toEqual(new Set([background, line]));
    const lines = empty.filter(p => p === line).length;
    expect(lines / empty.length).toBeCloseTo(1 / LINE_SPACING, 1);
    expect(fill([[0, null, 10]], 0, 0)).toEqual([0, 0, 0]); // measured dark stays black
  });

  it("draws a single point, or equal values, at full brightness", () => {
    expect(fill([[42]], 0, 0)).toEqual([255, 0, 0]);
    expect(fill([[7, null, 7]], 0, 2)).toEqual([255, 0, 0]);
  });

  it("is laid out as rows of height x width x RGB, cellPixelsFor per cell", () => {
    const image = toRgbNdt(
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      "green",
    );
    const size = cellPixelsFor(3, 2);
    expect(image.shape).toEqual([2 * size, 3 * size, 3]);
  });

  it("draws a missing channel as the empty placeholder", () => {
    const size = cellPixelsFor(3, 3);
    expect(toRgbNdt(null, "red").shape).toEqual([3 * size, 3 * size, 3]);
  });
});

describe("cellPixelsFor", () => {
  it("draws a small grid at least MIN_IMAGE_PIXELS across", () => {
    expect(cellPixelsFor(3, 3)).toBe(80);
    expect(cellPixelsFor(17, 5)).toBe(15);
  });

  it("draws a large grid at least CELL_PIXELS per cell", () => {
    expect(cellPixelsFor(100, 80)).toBe(4);
  });
});

describe("stripesOn", () => {
  it("is the background and darker lines on a light page", () => {
    expect(stripesOn([246, 246, 249])).toEqual([
      [246, 246, 249],
      [198, 198, 201],
    ]);
  });

  it("is the background and lighter lines on a dark page", () => {
    expect(stripesOn([14, 16, 23])).toEqual([
      [14, 16, 23],
      [62, 64, 71],
    ]);
  });

  it("colours toRgbNdt's empty cells", () => {
    const stripes = stripesOn([14, 16, 23]);
    const image = toRgbNdt([[null]], "red", stripes);
    const colours = new Set<string>();
    for (let y = 0; y < image.shape[0]; y++) {
      for (let x = 0; x < image.shape[1]; x++) {
        colours.add([0, 1, 2].map(ch => image.get(y, x, ch)).join());
      }
    }
    expect([...colours].sort()).toEqual(stripes.map(c => c.join()).sort());
  });
});

describe("orEmptyLike", () => {
  it("keeps a channel that is there", () => {
    expect(orEmptyLike([[1, 2]], [[3, 4]])).toEqual([[1, 2]]);
  });

  it("gives a missing channel empty cells the shape of another", () => {
    expect(
      orEmptyLike(null, [
        [1, null],
        [3, 4],
      ]),
    ).toEqual([
      [null, null],
      [null, null],
    ]);
  });
});

describe("splitEdges", () => {
  it("splits each bin into equal parts, keeping the outer edges", () => {
    const edges = splitEdges([0, 4, 12], 4);
    expect(edges).toHaveLength(2 * 4 + 1);
    expect(edges[0]).toBe(0);
    expect(edges[4]).toBe(4);
    expect(edges[edges.length - 1]).toBe(12);
    expect(edges[1] - edges[0]).toBeCloseTo(1);
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

describe("toChannels of /render's answer", () => {
  const stripes = stripesOn([246, 246, 249]);
  const answer = {
    viewport: { x0: 0, x1: 2, y0: 10, y1: 11, width: 2, height: 1 },
    channels: {
      RedTotal: [[0, 4]],
      GreenTotal: [[1, 1]],
      BlueTotal: [[null, 2]],
      DiodesRed: [[3, null]],
      DiodesGreen: null,
      DiodesBlue: null,
    },
    coverage: [[1, 0.5]],
    outline: [[0, 1]],
    beam: { x: 1, y: 1, source: "scan step" as const },
  };
  const pixel = (image: ReturnType<typeof toRgbNdt>, x: number) =>
    [0, 1, 2].map(ch => image.get(0, x, ch));

  it("draws one pixel per value, over the viewport's pixel edges", () => {
    const channels = toChannels(answer, stripes);
    expect(channels.cameraRed.shape).toEqual([1, 2, 3]);
    expect(Array.from(channels.xValues.data as Float64Array)).toEqual([
      0, 1, 2,
    ]);
    expect(Array.from(channels.yValues.data as Float64Array)).toEqual([10, 11]);
    expect(channels.beam).toEqual(answer.beam);
  });

  it("fades partly covered pixels into the stripes", () => {
    const channels = toChannels({ ...answer, outline: undefined }, stripes);
    expect(pixel(channels.cameraRed, 0)).toEqual([0, 0, 0]); // fully covered
    const [r, g] = pixel(channels.cameraRed, 1); // half 255, half its stripe
    expect(r).toBe(Math.round(0.5 * 255 + 0.5 * stripes[0][0]));
    expect(g).toBe(Math.round(0.5 * stripes[0][1]));
  });

  it("draws outlines in white over the pixels, if asked", () => {
    const image = toRgbNdt([[0, 4]], "red", stripes, {
      cellPixels: 1,
      outline: answer.outline,
    });
    expect(pixel(image, 0)).toEqual([0, 0, 0]);
    expect(pixel(image, 1)).toEqual([255, 255, 255]);
  });

  it("draws a channel the run lacks, and empty pixels, as the empty pattern", () => {
    const channels = toChannels({ ...answer, outline: undefined }, stripes);
    expect(pixel(channels.diodesGreen, 0)).toEqual([...stripes[1]]); // on a line
    expect(pixel(channels.cameraBlue, 0)).toEqual([...stripes[1]]);
    expect(pixel(channels.diodesGreen, 1)).toEqual([...stripes[0]]); // between lines
  });
});
