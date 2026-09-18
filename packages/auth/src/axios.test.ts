import { describe, it, expect } from "vitest";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { createAxiosWithLoginRedirect } from "./axios";

describe("createAxiosWithLoginRedirect", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/dashboard", search: "?x=1" },
    });
  });

  function failingAdapter(status: number) {
    return async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
      const error: any = new Error(`Request failed with status ${status}`);
      error.response = { status, data: null, headers: {}, config };
      error.config = config;
      error.isAxiosError = true;
      throw error;
    };
  }

  it("calls login and still rejects on a 401", async () => {
    const login = vi.fn();
    const instance = createAxiosWithLoginRedirect(login, {
      adapter: failingAdapter(401),
    });

    await expect(instance.get("/api/scans")).rejects.toThrow();
    expect(login).toHaveBeenLastCalledWith("/dashboard?x=1");
  });

  it("does not call login() on a non-401 error", async () => {
    const login = vi.fn();
    const instance = createAxiosWithLoginRedirect(login, {
      adapter: failingAdapter(500),
    });

    await expect(instance.get("/api/scans")).rejects.toThrow();
    expect(login).not.toHaveBeenCalled();
  });

  it("only calls login() once across concurrent 401s", async () => {
    const login = vi.fn();
    const instance = createAxiosWithLoginRedirect(login, {
      adapter: failingAdapter(401),
    });

    await Promise.allSettled([
      instance.get("/api/a"),
      instance.get("/api/b"),
      instance.get("/api/c"),
    ]);

    expect(login).toHaveBeenCalledOnce();
  });

  it("logs the method and URL of the call that triggered the redirect", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const instance = createAxiosWithLoginRedirect(vi.fn(), {
      adapter: failingAdapter(401),
      baseURL: "https://atlas.diamond.ac.uk",
    });

    await instance.get("/api/scans").catch(() => {});

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("GET https://atlas.diamond.ac.uk/api/scans"),
    );

    warn.mockRestore();
  });
});
