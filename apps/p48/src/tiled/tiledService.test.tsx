import { vi, beforeEach, describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@atlas/vitest-conf";

const mocks = vi.hoisted(() => {
  const axiosInstance = {
    get: vi.fn(),
  };

  return {
    ...axiosInstance,
    createAxiosWithLoginRedirect: vi.fn(() => axiosInstance),
    login: vi.fn(),
  };
});

vi.mock("@atlas/auth/axios", () => ({
  createAxiosWithLoginRedirect: mocks.createAxiosWithLoginRedirect,
}));

vi.mock("../auth", () => ({
  authProvider: {
    login: mocks.login,
  },
}));

import {
  createTiledApiClient,
  getChildren,
  getLatestRun,
  getPlanNames,
  PAGE_SIZE,
  sessionPath,
  useGetChildren,
  useGetLatestRun,
  useRefreshOnRunChange,
} from "./tiledService";

const SESSION_PATH = "p48/cm44196/cm44196-1";

function runEntry(id: string, metadata: object = { start: { scan_id: 7 } }) {
  return {
    id,
    attributes: {
      metadata,
      structure_family: "container",
      specs: [{ name: "BlueskyRun", version: "3.0" }],
    },
  };
}

function runNode(id: string) {
  return {
    id,
    path: `${SESSION_PATH}/${id}`,
    structureFamily: "container",
    specs: ["BlueskyRun"],
    metadata: { start: { scan_id: 7 } },
  };
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
}

function createWrapper(queryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function searchResponse(entries: unknown[], count = entries.length) {
  return { status: 200, data: { meta: { count }, data: entries } };
}

function requestedParams() {
  const [, config] = mocks.get.mock.calls[0];
  return config.params as URLSearchParams;
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.get.mockResolvedValue(searchResponse([]));
});

describe("Tiled HTTP requests", () => {
  it("creates a client that redirects to login on 401 and times out", () => {
    createTiledApiClient("/api/data");

    expect(mocks.createAxiosWithLoginRedirect).toHaveBeenCalledWith(
      mocks.login,
      { baseURL: "/api/data", timeout: 10_000 },
    );
  });

  it.each([
    ["cm44196-1", "p48/cm44196/cm44196-1"],
    ["mg12345-10", "p48/mg12345/mg12345-10"],
  ])("finds the runs of %s at %s", (session, path) => {
    expect(sessionPath(session)).toBe(path);
  });

  describe("getChildren", () => {
    it("searches the node, latest first", async () => {
      await getChildren(SESSION_PATH);

      expect(mocks.get).toHaveBeenCalledWith(
        `/search/${SESSION_PATH}`,
        expect.anything(),
      );
      const params = requestedParams();
      expect(params.get("sort")).toBe("-");
      expect(params.get("page[offset]")).toBe("0");
      expect(params.get("page[limit]")).toBe(String(PAGE_SIZE));
      expect(params.getAll("fields")).toEqual([
        "metadata",
        "structure_family",
        "specs",
        "count",
      ]);
    });

    it("asks for the given page", async () => {
      await getChildren(SESSION_PATH, { page: 3 });

      expect(requestedParams().get("page[offset]")).toBe(String(2 * PAGE_SIZE));
    });

    it("returns each child with its path from the catalog root, and the total", async () => {
      mocks.get.mockResolvedValue(
        searchResponse(
          [
            runEntry("run-uid"),
            {
              id: "primary",
              attributes: { metadata: null, structure_family: "table" },
            },
          ],
          40_000,
        ),
      );

      await expect(getChildren(SESSION_PATH)).resolves.toEqual({
        count: 40_000,
        nodes: [
          runNode("run-uid"),
          {
            id: "primary",
            path: `${SESSION_PATH}/primary`,
            structureFamily: "table",
            specs: [],
            metadata: {},
          },
        ],
      });
    });

    it("returns no children for a node that doesn't exist yet", async () => {
      mocks.get.mockResolvedValue({ status: 404, data: {} });

      await expect(getChildren(SESSION_PATH)).resolves.toEqual({
        nodes: [],
        count: 0,
      });
    });

    it("searches by scan ID when given a number", async () => {
      await getChildren(SESSION_PATH, { query: { search: " 42 " } });

      const params = requestedParams();
      expect(params.get("filter[eq][condition][key]")).toBe("start.scan_id");
      expect(params.get("filter[eq][condition][value]")).toBe("42");
    });

    it("searches by the start of the uid otherwise", async () => {
      await getChildren(SESSION_PATH, { query: { search: "01cbeb" } });

      const params = requestedParams();
      expect(params.get("filter[like][condition][key]")).toBe("start.uid");
      expect(params.get("filter[like][condition][pattern]")).toBe('"01cbeb%"');
    });

    it.each([
      ["success", "eq", { key: "stop.exit_status", value: '"success"' }],
      ["abort", "eq", { key: "stop.exit_status", value: '"abort"' }],
      ["running", "keypresent", { key: "stop", exists: "false" }],
    ] as const)(
      "filters %s scans by their stop document",
      async (status, kind, condition) => {
        await getChildren(SESSION_PATH, { query: { status } });

        const params = requestedParams();
        for (const [name, value] of Object.entries(condition)) {
          expect(params.get(`filter[${kind}][condition][${name}]`)).toBe(value);
        }
      },
    );

    it("combines a plan with a scan ID, as repeated filters", async () => {
      await getChildren(SESSION_PATH, {
        query: { search: "3", plan: "grid_scan" },
      });

      const params = requestedParams();
      expect(params.getAll("filter[eq][condition][key]")).toEqual([
        "start.scan_id",
        "start.plan_name",
      ]);
      expect(params.getAll("filter[eq][condition][value]")).toEqual([
        "3",
        '"grid_scan"',
      ]);
    });

    it("does not filter without a query", async () => {
      await getChildren(SESSION_PATH, { query: { search: "  " } });

      expect([...requestedParams().keys()]).not.toContainEqual(
        expect.stringMatching(/^filter/),
      );
    });
  });

  describe("getPlanNames", () => {
    it("lists the plans, without the runs that have none", async () => {
      mocks.get.mockResolvedValue({
        status: 200,
        data: {
          metadata: {
            "start.plan_name": [
              { value: "scan" },
              { value: null },
              { value: "count" },
            ],
          },
        },
      });

      await expect(getPlanNames("cm44196-1")).resolves.toEqual([
        "count",
        "scan",
      ]);
      expect(mocks.get).toHaveBeenCalledWith(`/distinct/${SESSION_PATH}`, {
        params: { metadata: "start.plan_name" },
        validateStatus: expect.any(Function),
      });
    });

    it("lists no plans for a session that doesn't exist yet", async () => {
      mocks.get.mockResolvedValue({ status: 404, data: {} });

      await expect(getPlanNames("cm44196-1")).resolves.toEqual([]);
    });
  });

  describe("getLatestRun", () => {
    it("gets the latest run in the session", async () => {
      mocks.get.mockResolvedValue(searchResponse([runEntry("run-uid")]));

      await expect(getLatestRun("cm44196-1")).resolves.toEqual(
        runNode("run-uid"),
      );
      const params = requestedParams();
      expect(params.get("page[limit]")).toBe("1");
      // Only paging needs the total, and counting a large session is slow
      expect(params.getAll("fields")).not.toContain("count");
    });

    it("returns null when the session has no runs", async () => {
      await expect(getLatestRun("cm44196-1")).resolves.toBeNull();
    });
  });
});

describe("Tiled hooks", () => {
  it("gets the latest run in the session", async () => {
    mocks.get.mockResolvedValue(searchResponse([runEntry("run-uid")]));

    const { result } = renderHook(() => useGetLatestRun("cm44196-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(runNode("run-uid"));
    });
  });

  it("gets a page of a node's children", async () => {
    const { result } = renderHook(
      () => useGetChildren(SESSION_PATH, 2, { search: "42" }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mocks.get).toHaveBeenCalledExactlyOnceWith(
      `/search/${SESSION_PATH}`,
      expect.anything(),
    );
    const params = requestedParams();
    expect(params.get("page[offset]")).toBe(String(PAGE_SIZE));
    expect(params.get("filter[eq][condition][value]")).toBe("42");
  });

  it("refreshes the tree only when a new run appears", async () => {
    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mocks.get.mockResolvedValue(searchResponse([runEntry("run-1")]));

    renderHook(() => useRefreshOnRunChange("cm44196-1"), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() => {
      expect(
        queryClient.getQueryData(["tiled", "latestRun", "cm44196-1"]),
      ).toBeTruthy();
    });

    await act(() => queryClient.refetchQueries({ queryKey: ["tiled"] }));
    expect(invalidate).not.toHaveBeenCalled();

    mocks.get.mockResolvedValue(searchResponse([runEntry("run-2")]));
    await act(() => queryClient.refetchQueries({ queryKey: ["tiled"] }));

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["tiled", "children"],
      });
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["tiled", "planNames"],
    });
  });

  it("refreshes the tree when the latest run finishes", async () => {
    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const start = { scan_id: 7 };
    mocks.get.mockResolvedValue(searchResponse([runEntry("run-1", { start })]));

    renderHook(() => useRefreshOnRunChange("cm44196-1"), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() => {
      expect(
        queryClient.getQueryData(["tiled", "latestRun", "cm44196-1"]),
      ).toBeTruthy();
    });

    mocks.get.mockResolvedValue(
      searchResponse([
        runEntry("run-1", { start, stop: { exit_status: "success" } }),
      ]),
    );
    await act(() => queryClient.refetchQueries({ queryKey: ["tiled"] }));

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["tiled", "children"],
      });
    });
  });
});
