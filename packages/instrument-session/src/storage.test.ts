import { loadStoredSession, resolveSession, storeSession } from "./storage";

describe("resolveSession", () => {
  it("is null while sessions are unknown", () => {
    expect(resolveSession("cm1-1", null)).toBeNull();
  });

  it("uses the stored session if it is still available", () => {
    expect(resolveSession("cm2-2", ["cm1-1", "cm2-2"])).toBe("cm2-2");
  });

  it("ignores a stored session that is no longer available", () => {
    expect(resolveSession("cm9-9", ["cm1-1", "cm2-2"])).toBeNull();
  });

  it("uses the only available session when nothing valid is stored", () => {
    expect(resolveSession("cm9-9", ["cm1-1"])).toBe("cm1-1");
    expect(resolveSession(null, ["cm1-1"])).toBe("cm1-1");
  });

  it("does not guess between several sessions", () => {
    expect(resolveSession(null, ["cm1-1", "cm2-2"])).toBeNull();
  });

  it("is null when there are no sessions", () => {
    expect(resolveSession(null, [])).toBeNull();
  });
});

describe("session storage", () => {
  beforeEach(() => localStorage.clear());

  it("stores the session per instrument", () => {
    storeSession("I08-1", "cm1-1");
    storeSession("B21", "cm2-2");
    expect(loadStoredSession("I08-1")).toBe("cm1-1");
    expect(loadStoredSession("B21")).toBe("cm2-2");
    expect(loadStoredSession("P99")).toBeNull();
  });
});
