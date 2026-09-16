import { describe, it, expect } from "vitest";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { createAuthenticatedAxios } from "./axios";

/**
 * A custom axios adapter that captures the outgoing config instead of
 * hitting the network, so we can assert on headers without mocking
 * fetch/XHR underneath axios.
 */
function captureAdapter() {
  let captured: AxiosRequestConfig | null = null;
  const adapter = async (
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse> => {
    captured = config;
    return {
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    } as AxiosResponse;
  };
  return { adapter, getCaptured: () => captured };
}

describe("createAuthenticatedAxios", () => {
  it("attaches an Authorization header when a token is available", async () => {
    const { adapter, getCaptured } = captureAdapter();
    const instance = createAuthenticatedAxios(async () => "tok-123", {
      adapter,
    });

    await instance.get("/api/things");

    expect(getCaptured()?.headers?.Authorization).toBe("Bearer tok-123");
  });

  it("omits the header when there's no token", async () => {
    const { adapter, getCaptured } = captureAdapter();
    const instance = createAuthenticatedAxios(async () => null, { adapter });

    await instance.get("/api/things");

    expect(getCaptured()?.headers?.Authorization).toBeUndefined();
  });

  it("preserves config passed to createAuthenticatedAxios", async () => {
    const { adapter, getCaptured } = captureAdapter();
    const instance = createAuthenticatedAxios(async () => "tok-123", {
      adapter,
      baseURL: "https://api.example.com",
    });

    await instance.get("/api/things");

    expect(getCaptured()?.baseURL).toBe("https://api.example.com");
  });
});
