import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { type AxiosInstance } from "axios";
import { createAxiosWithLoginRedirect } from "@atlas/auth/axios";
import { authProvider } from "../auth";
import { summariseRun } from "./runSummary";

// Proxied to p48-tiled's /api/v1 (helm/values.yaml, and vite.config.ts in dev)
const TILED_URL = "/api/data";
const BEAMLINE = "p48";
export const PAGE_SIZE = 50;

export type StructureFamily =
  | "container"
  | "composite"
  | "array"
  | "awkward"
  | "sparse"
  | "table";

export interface TiledNode {
  id: string;
  /** e.g. "p48/cm44196/cm44196-1/<run uid>" */
  path: string;
  structureFamily: StructureFamily;
  specs: string[];
  metadata: Record<string, unknown>;
}

/** One page of a node's children, and how many it has in total */
export interface TiledPage {
  nodes: TiledNode[];
  count: number;
}

export type ScanStatus = "success" | "abort" | "fail" | "running";

/** Narrows a session's scans; every part is optional */
export interface ScanQuery {
  /** A scan ID, or the start of a scan's uid */
  search?: string;
  status?: ScanStatus;
  plan?: string;
}

interface TiledSearchResponse {
  meta: { count: number };
  data: {
    id: string;
    attributes: {
      metadata?: Record<string, unknown> | null;
      structure_family?: StructureFamily;
      specs?: { name: string }[] | null;
    };
  }[];
}

interface TiledDistinctResponse {
  metadata: Record<string, { value: unknown }[]>;
}

export function createTiledApiClient(baseURL: string): AxiosInstance {
  return createAxiosWithLoginRedirect(authProvider.login, {
    baseURL,
    timeout: 10_000,
  });
}

const tiledClient = createTiledApiClient(TILED_URL);

/** Diamond's tiled keeps a session's runs at <beamline>/<proposal>/<session> */
export function sessionPath(session: string) {
  const proposal = session.split("-")[0];
  return `${BEAMLINE}/${proposal}/${session}`;
}

/** A session with nothing recorded yet has no container */
const allowNotFound = (status: number) => status === 404 || status < 400;

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function addScanQuery(
  params: URLSearchParams,
  { search = "", status, plan }: ScanQuery,
) {
  // tiled takes repeated filters of the same kind, matched up in order
  const filter = (kind: string, condition: Record<string, string>) => {
    for (const [name, value] of Object.entries(condition)) {
      params.append(`filter[${kind}][condition][${name}]`, value);
    }
  };
  // and expects values JSON-encoded
  const term = search.trim();
  if (/^\d+$/.test(term)) {
    filter("eq", { key: "start.scan_id", value: term });
  } else if (term) {
    filter("like", { key: "start.uid", pattern: JSON.stringify(`${term}%`) });
  }
  if (plan) {
    filter("eq", { key: "start.plan_name", value: JSON.stringify(plan) });
  }
  if (status === "running") {
    filter("keypresent", { key: "stop", exists: "false" });
  } else if (status) {
    filter("eq", { key: "stop.exit_status", value: JSON.stringify(status) });
  }
}

/**
 * Newest first, by when tiled added them. That matches start time for runs,
 * and unlike sorting on start.time it can use tiled's index.
 */
export const getChildren = async (
  path: string,
  {
    page = 1,
    query = {} as ScanQuery,
    limit = PAGE_SIZE,
    withCount = true,
  } = {},
): Promise<TiledPage> => {
  const params = new URLSearchParams({
    sort: "-",
    "page[offset]": String((page - 1) * limit),
    "page[limit]": String(limit),
    omit_links: "true",
  });
  for (const field of ["metadata", "structure_family", "specs"]) {
    params.append("fields", field);
  }
  // Without it, tiled stops counting at 100
  if (withCount) params.append("fields", "count");
  addScanQuery(params, query);
  const response = await tiledClient.get<TiledSearchResponse>(
    `/search/${encodePath(path)}`,
    {
      params,
      validateStatus: allowNotFound,
    },
  );
  if (response.status === 404) return { nodes: [], count: 0 };
  return {
    count: response.data.meta.count,
    nodes: response.data.data.map((entry) => ({
      id: entry.id,
      path: `${path}/${entry.id}`,
      structureFamily: entry.attributes.structure_family ?? "container",
      specs: (entry.attributes.specs ?? []).map((spec) => spec.name),
      metadata: entry.attributes.metadata ?? {},
    })),
  };
};

export const getLatestRun = async (
  session: string,
): Promise<TiledNode | null> => {
  const { nodes } = await getChildren(sessionPath(session), {
    limit: 1,
    withCount: false,
  });
  return nodes[0] ?? null;
};

/**
 * The plans run anywhere in tiled, not only in `session`: tiled doesn't limit
 * distinct values to a node's children, which is also why there are no counts
 */
export const getPlanNames = async (session: string): Promise<string[]> => {
  const response = await tiledClient.get<TiledDistinctResponse>(
    `/distinct/${encodePath(sessionPath(session))}`,
    {
      params: { metadata: "start.plan_name" },
      validateStatus: allowNotFound,
    },
  );
  if (response.status === 404) return [];
  return response.data.metadata["start.plan_name"]
    .map(({ value }) => value)
    .filter((value) => typeof value === "string")
    .sort();
};

export function useGetLatestRun(session: string) {
  return useQuery({
    queryKey: ["tiled", "latestRun", session],
    queryFn: () => getLatestRun(session),
    refetchInterval: 5000,
    retry: 1,
  });
}

export function useGetChildren(path: string, page = 1, query: ScanQuery = {}) {
  return useQuery({
    queryKey: ["tiled", "children", path, page, query],
    queryFn: () => getChildren(path, { page, query }),
    // Keep showing the current page while the next one loads
    placeholderData: keepPreviousData,
    retry: 1,
  });
}

export function useGetPlanNames(session: string) {
  return useQuery({
    queryKey: ["tiled", "planNames", session],
    queryFn: () => getPlanNames(session),
    retry: 1,
  });
}

/**
 * Refetches the scan lists and plans when a new run starts in `session`, or
 * the latest one finishes
 */
export function useRefreshOnRunChange(session: string) {
  const { data: run } = useGetLatestRun(session);
  const queryClient = useQueryClient();
  // undefined until the first fetch, then null while the session has no runs
  const previousState = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (run === undefined) return;
    const state = run && `${run.id}:${summariseRun(run.metadata).finished}`;
    if (
      previousState.current !== undefined &&
      state !== previousState.current
    ) {
      queryClient.invalidateQueries({ queryKey: ["tiled", "children"] });
      queryClient.invalidateQueries({ queryKey: ["tiled", "planNames"] });
    }
    previousState.current = state;
  }, [run, queryClient]);
}
