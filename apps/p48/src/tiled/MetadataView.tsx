import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useRef } from "react";
import { findField, JSON_INDENT, type Selection } from "./selection";

/** The selected node's metadata, with the selected fields highlighted */
export function MetadataView({ selection }: { selection: Selection | null }) {
  const lines = useMemo(
    () =>
      JSON.stringify(selection?.node.metadata, null, JSON_INDENT)?.split(
        "\n",
      ) ?? [],
    [selection?.node.metadata],
  );
  const highlighted = useMemo(() => {
    const ranges = (selection?.fields ?? [])
      .map((field) => findField(lines, field))
      .filter((range) => range !== null);
    return (line: number) =>
      ranges.some(([first, last]) => line >= first && line <= last);
  }, [lines, selection?.fields]);
  const firstHighlighted = lines.findIndex((_, i) => highlighted(i));

  const firstRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    firstRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selection]);

  if (!selection) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        Select an entry to see its metadata
      </Typography>
    );
  }
  return (
    <>
      <Typography variant="body2" sx={{ p: 1, wordBreak: "break-all" }}>
        {selection.node.path}
      </Typography>
      <Typography
        component="pre"
        variant="mono2"
        sx={{ p: 1, m: 0, bgcolor: "action.hover", minHeight: "100%" }}
      >
        {lines.map((line, i) => (
          <Box
            component="span"
            key={i}
            ref={i === firstHighlighted ? firstRef : undefined}
            data-highlighted={highlighted(i) || undefined}
            sx={{
              display: "block",
              bgcolor: (theme) =>
                highlighted(i)
                  ? alpha(theme.palette.primary.main, 0.2)
                  : undefined,
            }}
          >
            {line}
          </Box>
        ))}
      </Typography>
    </>
  );
}
