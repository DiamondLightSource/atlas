import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { RunTree } from "./RunTree";
import { ScanSummary } from "./ScanSummary";
import type { MetadataField, Selection } from "./selection";
import type { TiledNode } from "./tiledService";

/**
 * Clicking a value on a card highlights where it came from in the metadata;
 * `fields` are highlighted to begin with
 */
export function ScanWorkspace({
  run,
  fields,
}: {
  run: TiledNode;
  fields?: MetadataField[];
}) {
  const [selection, setSelection] = useState<Selection>({ node: run, fields });

  // `run` is refetched, e.g. to get its stop document when it finishes, so
  // show that rather than the copy saved when it was selected
  const currentSelection = useMemo(
    () =>
      selection.node.path === run.path
        ? { ...selection, node: run }
        : selection,
    [selection, run],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
      <ScanSummary run={run} onShow={setSelection} />
      <RunTree run={run} selection={currentSelection} onSelect={setSelection} />
    </Box>
  );
}
