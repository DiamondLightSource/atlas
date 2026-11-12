import { ProgressDelayed } from "@diamondlightsource/sci-react-ui";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ContextPanel, type CardItem } from "./ContextPanel";
import { PageControls } from "./PageControls";
import {
  getColour,
  getStatus,
  normaliseCase,
  summariseRun,
} from "./runSummary";
import { ScanWorkspace } from "./ScanWorkspace";
import type { Selection } from "./selection";
import {
  PAGE_SIZE,
  sessionPath,
  useGetChildren,
  useGetLatestRun,
  useGetPlanNames,
  useRefreshOnRunChange,
  type ScanStatus,
  type TiledNode,
} from "./tiledService";

const SEARCH_DELAY_MS = 300;
const STATUSES: ScanStatus[] = ["success", "abort", "fail", "running"];

/** `value`, once it has stopped changing for `delay` ms */
function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

function toCard(run: TiledNode): CardItem {
  const summary = summariseRun(run.metadata);
  const status = getStatus(summary);
  return {
    id: run.path,
    title: `Scan ${summary.scanId ?? "?"}`,
    subtitle: summary.planName,
    status: { label: normaliseCase(status), colour: getColour(status) },
    metadata: [
      {
        key: "started",
        label: "Started",
        value:
          summary.startTime === undefined
            ? "-"
            : new Date(summary.startTime * 1000).toLocaleString(),
      },
      { key: "points", label: "Points", value: summary.numPoints ?? "-" },
    ],
  };
}

function Message({ children }: { children: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
}

/** A session's scans to pick from, beside the picked one (by default the newest) */
export function ScanBrowser({ session }: { session: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  // A scan opened from elsewhere, such as the Dashboard, unless the session
  // has changed since
  const state = useLocation().state as Selection | null;
  const opened = state?.node.path.startsWith(`${sessionPath(session)}/`)
    ? state
    : null;
  const [openRun, setOpenRun] = useState(opened?.node ?? null);

  const debouncedSearch = useDebounced(search.trim(), SEARCH_DELAY_MS);
  // Unset rather than empty, so an unfiltered query shares the total's request
  const query = {
    search: debouncedSearch || undefined,
    status: (status || undefined) as ScanStatus | undefined,
    plan: plan || undefined,
  };
  const scans = useGetChildren(sessionPath(session), page, query);
  const allScans = useGetChildren(sessionPath(session));
  const latest = useGetLatestRun(session);
  const { data: planNames = [] } = useGetPlanNames(session);
  useRefreshOnRunChange(session);

  // Follow the newest scan until another is picked; the newest is polled, so
  // use that copy of it to see it finish
  const run =
    !openRun || openRun.path === latest.data?.path ? latest.data : openRun;

  // A search for one scan, usually by its ID, opens it straight away
  const onlyMatch =
    debouncedSearch && scans.data?.count === 1 ? scans.data.nodes[0] : null;
  useEffect(() => {
    if (onlyMatch) setOpenRun(onlyMatch);
  }, [onlyMatch]);

  const updateQuery = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <ContextPanel
        title="Scans"
        count={
          scans.data &&
          allScans.data && {
            matching: scans.data.count,
            total: allScans.data.count,
          }
        }
        items={scans.data?.nodes.map(toCard) ?? []}
        activeId={run?.path}
        onActivate={(path) =>
          setOpenRun(
            scans.data?.nodes.find((node) => node.path === path) ?? null,
          )
        }
        search={search}
        onSearchChange={(search) => updateQuery(() => setSearch(search))}
        searchLabel="Search scans"
        searchPlaceholder="Scan ID or uid"
        filters={[
          {
            key: "status",
            label: "Status",
            options: STATUSES.map((status) => ({
              value: status,
              label: normaliseCase(status),
            })),
            value: status,
          },
          {
            key: "plan",
            label: "Plan",
            options: planNames.map((plan) => ({ value: plan, label: plan })),
            value: plan,
          },
        ]}
        onFilterChange={(key, value) =>
          updateQuery(() =>
            key === "status" ? setStatus(value) : setPlan(value),
          )
        }
        onClearFilters={() =>
          updateQuery(() => {
            setSearch("");
            setStatus("");
            setPlan("");
          })
        }
        loading={scans.isPending}
        error={
          scans.error
            ? `Could not fetch from Tiled: ${scans.error.message}`
            : undefined
        }
        emptyMessage="No scans yet"
        footer={
          scans.data &&
          scans.data.count > PAGE_SIZE && (
            <PageControls
              page={page}
              count={scans.data.count}
              onChange={setPage}
            />
          )
        }
      />
      <Box
        component="section"
        aria-label="Selected scan"
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          overflow: "auto",
          p: 2,
        }}
      >
        {run && (
          <ScanWorkspace
            key={run.path}
            run={run}
            fields={opened?.node.path === run.path ? opened.fields : undefined}
          />
        )}
        {!run && latest.isPending && <ProgressDelayed />}
        {!run && latest.isError && (
          <Message>Could not fetch from Tiled</Message>
        )}
        {!run && latest.isSuccess && (
          <Message>No scans in this session yet</Message>
        )}
      </Box>
    </Box>
  );
}
