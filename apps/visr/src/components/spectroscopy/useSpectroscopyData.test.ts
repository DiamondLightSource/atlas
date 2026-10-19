import { fetchData } from "./useSpectroscopyData";

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
