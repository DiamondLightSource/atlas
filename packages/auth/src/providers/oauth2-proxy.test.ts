import {
  createOAuth2ProxyProvider,
  TOKEN_REFRESH_SKEW_SECONDS,
} from "./oauth2-proxy";

function encodeIdentityHeader(claims: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `header.${payload}.signature`;
}

function fakeResponse(init: {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
}): Response {
  return {
    status: init.status,
    ok: init.status >= 200 && init.status < 300,
    headers: new Headers(init.headers ?? {}),
    json: async () => init.body,
  } as Response;
}

describe("createOAuth2ProxyProvider().getUser()", () => {
  const provider = createOAuth2ProxyProvider();

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null on 401", async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ status: 401 }));
    await expect(provider.getUser()).resolves.toBeNull();
  });

  it("throws on an unexpected error status", async () => {
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ status: 500 }));
    await expect(provider.getUser()).rejects.toThrow(/500/);
  });

  it("decodes the Identity header into a User", async () => {
    const claims = {
      sub: "abc123",
      name: "Ada Lovelace",
      email: "ada@example.com",
    };
    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({
        status: 200,
        headers: { identity: encodeIdentityHeader(claims) },
        body: {},
      }),
    );

    await expect(provider.getUser()).resolves.toMatchObject({
      id: "abc123",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  it("prefers preferred_username when name is absent", async () => {
    const claims = { sub: "abc123", preferred_username: "ada" };
    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({
        status: 200,
        headers: { identity: encodeIdentityHeader(claims) },
        body: {},
      }),
    );

    await expect(provider.getUser()).resolves.toMatchObject({ name: "ada" });
  });

  it("falls back to the JSON body when the Identity header is missing", async () => {
    const body = { sub: "xyz", email: "grace@example.com" };
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ status: 200, body }));

    await expect(provider.getUser()).resolves.toMatchObject({
      id: "xyz",
      email: "grace@example.com",
    });
  });

  it("falls back to the JSON body when the Identity header is malformed", async () => {
    const body = { sub: "fallback-id" };
    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({
        status: 200,
        headers: { identity: "not-a-valid-jwt" },
        body,
      }),
    );

    await expect(provider.getUser()).resolves.toMatchObject({
      id: "fallback-id",
    });
  });

  it("returns null when neither the header nor the body yield a user", async () => {
    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({ status: 200, body: null }),
    );
    await expect(provider.getUser()).resolves.toBeNull();
  });
});

describe("createOauth2ProxyProvider().getAccessToken()", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function tokenWithExpiry(secondsFromNow: number) {
    const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
    return encodeIdentityHeader({ sub: "abc123", exp });
  }

  it("returns null on 401", async () => {
    const provider = createOAuth2ProxyProvider();
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ status: 401 }));
    await expect(provider.getAccessToken()).resolves.toBeNull();
  });

  it("returns null when header is missing", async () => {
    const provider = createOAuth2ProxyProvider();
    vi.mocked(fetch).mockResolvedValue(fakeResponse({ status: 200 }));
    await expect(provider.getAccessToken()).resolves.toBeNull();
  });

  it("returns the token from the X-Access-Token header", async () => {
    const provider = createOAuth2ProxyProvider();
    const token = tokenWithExpiry(TOKEN_REFRESH_SKEW_SECONDS + 200);
    const mockResponse = fakeResponse({
      status: 200,
      headers: { "x-access-token": token },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);
    await expect(provider.getAccessToken()).resolves.toBe(token);
  });

  it("caches the token instead of refetching while it's still valid", async () => {
    const provider = createOAuth2ProxyProvider();
    const token = tokenWithExpiry(TOKEN_REFRESH_SKEW_SECONDS + 200);
    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({
        status: 200,
        headers: { "x-access-token": token },
      }),
    );

    await provider.getAccessToken();
    await provider.getAccessToken();

    expect(fetch).toHaveBeenCalledOnce();
  });

  it("refetches once the cached token is close to expiry", async () => {
    const provider = createOAuth2ProxyProvider();
    const expiry = 300;
    const firstToken = tokenWithExpiry(expiry);

    vi.mocked(fetch).mockResolvedValue(
      fakeResponse({
        status: 200,
        headers: { "x-access-token": firstToken },
      }),
    );

    // this will result in a cached token expiring in 300 seconds:
    await provider.getAccessToken();

    // advance time to a point forcing a refetch
    const now = expiry - TOKEN_REFRESH_SKEW_SECONDS;
    vi.setSystemTime(new Date(`2026-01-01T00:00:${now}Z`));

    // expect a refetch
    await provider.getAccessToken();

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe("createOAuth2ProxyProvider().{login()/logout()}", () => {
  const provider = createOAuth2ProxyProvider();

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "", pathname: "/dashboard", search: "?tab=1" },
    });
  });

  it("login() defaults returnTo to the current path + search", () => {
    provider.login();
    expect(window.location.href).toBe(
      `/oauth2/start?rd=${encodeURIComponent("/dashboard?tab=1")}`,
    );
  });

  it("login() encodes an explicit returnTo", () => {
    provider.login("/settings?x=1&y=2");
    expect(window.location.href).toBe(
      `/oauth2/start?rd=${encodeURIComponent("/settings?x=1&y=2")}`,
    );
  });

  it("logout() targets /oauth2/sign_out", () => {
    provider.logout("/bye");
    expect(window.location.href).toBe(
      `/oauth2/sign_out?rd=${encodeURIComponent("/bye")}`,
    );
  });
});
