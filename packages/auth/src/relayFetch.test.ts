import { createRelayFetchFunction } from "./relayFetch";

function fakeJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createRelayFetchFunction", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(fakeJsonResponse({ data: {} })),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("POSTs the query and variables to the configured URL", async () => {
    const fetchGql = createRelayFetchFunction(async () => "tok-123", {
      url: "/api/supergraph",
    });

    await fetchGql({ text: "query Foo { foo }" }, { id: 1 });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/supergraph");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      query: "query Foo { foo }",
      variables: { id: 1 },
    });
  });

  it("attaches an Authorization header when a token is available", async () => {
    const fetchGraphQL = createRelayFetchFunction(async () => "tok-123", {
      url: "/api/supergraph",
    });
    await fetchGraphQL({ text: "query Foo { foo }" }, {});

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer tok-123");
  });

  it("omits the Authorization header when there's no token", async () => {
    const fetchGql = createRelayFetchFunction(async () => null, {
      url: "/api/supergraph",
    });
    await fetchGql({ text: "query Foo { foo }" }, {});
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.has("Authorization")).toBeFalsy();
  });

  it("throws on a non-ok repsponse", async () => {
    const fetchGql = createRelayFetchFunction(async () => null, {
      url: "/api/supergraph",
    });

    vi.mocked(fetch).mockResolvedValue(fakeJsonResponse({}, 500));

    await expect(fetchGql({ text: "query Foo { foo }" }, {})).rejects.toThrow(
      /500/,
    );
  });

  it("returns the parsed GraphQL response body", async () => {
    const fetchGraphQL = createRelayFetchFunction(async () => null, {
      url: "/api/supergraph",
    });
    vi.mocked(fetch).mockResolvedValue(
      fakeJsonResponse({ data: { foo: "bar" } }),
    );
    await expect(
      fetchGraphQL({ text: "query Foo { foo }" }, {}),
    ).resolves.toEqual({ data: { foo: "bar" } });
  });
});
