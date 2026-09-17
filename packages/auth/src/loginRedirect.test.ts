import { createFetchLoginRedirect } from "./loginRedirect";

function fakeResponse(status: number): Response {
  return { status, ok: status >= 200 && status < 300 } as Response;
}

describe("createFetchWithLoginRedirect", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/dashboard", search: "?x=1" },
    });
  });

  it("does not call login() on a non-401 response", async () => {
    const login = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(200));
    const wrapped = createFetchLoginRedirect(login, fetchImpl);

    const res = await wrapped("/api/scans");

    expect(res.status).toBe(200);
    expect(login).not.toHaveBeenCalled();
  });

  it("calls login() with current path + search on a 401", async () => {
    const login = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(401));
    const wrapped = createFetchLoginRedirect(login, fetchImpl);

    await wrapped("/api/scans");

    expect(login).toHaveBeenCalledWith("/dashboard?x=1");
  });

  it("still retains the 401 response (it doesn't swallow it)", async () => {
    const login = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(401));
    const wrapped = createFetchLoginRedirect(login, fetchImpl);

    expect(wrapped("/api/scans")).resolves.toMatchObject({ status: 401 });
  });

  it("calls login() only once across concurrent 401s", async () => {
    const login = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(401));
    const wrapped = createFetchLoginRedirect(login, fetchImpl);

    await Promise.all([
      wrapped("/api/a"),
      wrapped("/api/b"),
      wrapped("/api/c"),
    ]);

    expect(login).toHaveBeenCalledOnce();
  });
});
