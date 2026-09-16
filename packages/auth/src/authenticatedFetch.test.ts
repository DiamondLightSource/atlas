import { createAuthenticatedFetch } from "./authenticatedFetch";

describe("createAuthenticatedFetch", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("attaches an Authorization header when a token is available", async () => {
    const authenticatedFetch = createAuthenticatedFetch(async () => "tok-123");

    await authenticatedFetch("/api/things");

    const [, init] = vi.mocked(fetch).mock.calls[0];

    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer tok-123");
  });

  it("omits the Authorization header when there's no token", async () => {
    const authFetch = createAuthenticatedFetch(async () => null);
    await authFetch("/api/things");
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.has("Authorization")).toBe(false);
  });

  it("preserves headers and oher init options the caller passed in", async () => {
    const authenticatedFetch = createAuthenticatedFetch(async () => "tok-123");
    await authenticatedFetch("/api/things", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(init?.headers);

    expect(url).toBe("/api/things");
    expect(init?.method).toBe("POST");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer tok-123");
  });
});
