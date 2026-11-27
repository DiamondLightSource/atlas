import { Box, Pagination, Typography } from "@mui/material";
import { PAGE_SIZE } from "./tiledService";

/** Pages of PAGE_SIZE, e.g. "51–100 of 40,000" */
export function PageControls({
  page,
  count,
  onChange,
}: {
  page: number;
  count: number;
  onChange: (page: number) => void;
}) {
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, count);

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
    >
      <Pagination
        size="small"
        count={Math.ceil(count / PAGE_SIZE)}
        page={page}
        siblingCount={0}
        onChange={(_, page) => onChange(page)}
      />
      <Typography variant="caption" color="text.secondary">
        {`${first.toLocaleString()}–${last.toLocaleString()} of ${count.toLocaleString()}`}
      </Typography>
    </Box>
  );
}
