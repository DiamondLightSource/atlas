import {
  fetchVolume,
  listReconstructions,
  toReconstruction,
  type Reconstruction,
} from "./reconstruction";

/** A Tiled search result for a 3D uint8 array */
function result(
  id: string,
  visr: Record<string, string> = {},
  shape = [2, 3, 4],
  dataType = { kind: "u", itemsize: 1 },
) {
  return {
    id,
    attributes: {
      structure_family: "array",
      metadata: { visr: { kind: "tomography-reconstruction", ...visr } },
      structure: { shape, data_type: dataType },
    },
  };
}

describe("toReconstruction", () => {
  it("names it by key and workflow run", () => {
    expect(
      toReconstruction(
        result("recon", { workflow_run: "run-1", created: "2026-10-15" }),
      ),
    ).toEqual({
      path: "analysis/recon",
      label: "recon (run-1)",
      shape: [2, 3, 4],
      created: "2026-10-15",
    });
  });

  it("skips what the viewer can't show", () => {
    expect(toReconstruction(result("flat", {}, [2, 3]))).toBeNull();
    expect(
      toReconstruction(
        result("wide", {}, [2, 3, 4], { kind: "u", itemsize: 2 }),
      ),
    ).toBeNull();
    expect(
      toReconstruction(
        result("float", {}, [2, 3, 4], { kind: "f", itemsize: 1 }),
      ),
    ).toBeNull();
  });
});

describe("listReconstructions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("searches the analysis container by kind, newest first", async () => {
    const fetch = vi.fn<(url: string) => Promise<Response>>(
      async () =>
        new Response(
          JSON.stringify({
            data: [
              result("old", { created: "2026-10-01T00:00:00Z" }),
              result("flat", {}, [5]),
              result("new", { created: "2026-10-15T00:00:00Z" }),
            ],
          }),
        ),
    );
    vi.stubGlobal("fetch", fetch);
    const found = await listReconstructions();
    expect(found.map(r => r.path)).toEqual(["analysis/new", "analysis/old"]);
    const url = new URL(fetch.mock.calls[0][0], "http://host");
    expect(url.pathname).toBe("/api/data/search/analysis");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      "filter[eq][condition][key]": "visr.kind",
      "filter[eq][condition][value]": '"tomography-reconstruction"',
    });
  });

  it("finds none when there is no analysis container", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 })),
    );
    expect(await listReconstructions()).toEqual([]);
  });
});

describe("fetchVolume", () => {
  afterEach(() => vi.unstubAllGlobals());
  const recon: Reconstruction = {
    path: "analysis/recon",
    label: "recon",
    shape: [2, 3, 4],
  };

  it("reads the array's bytes", async () => {
    const fetch = vi.fn<(url: string) => Promise<Response>>(
      async () => new Response(new Uint8Array(24).fill(7)),
    );
    vi.stubGlobal("fetch", fetch);
    const data = await fetchVolume(recon);
    expect(data).toHaveLength(24);
    expect(data[23]).toBe(7);
    expect(fetch.mock.calls[0][0]).toBe(
      "/api/data/array/full/analysis/recon?format=application/octet-stream",
    );
  });

  it("refuses bytes that don't fit the shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array(10))),
    );
    await expect(fetchVolume(recon)).rejects.toThrow("10 bytes");
  });
});
