import { Box } from "@mui/material";

export function JsonView({ data }: { data: unknown }) {
  return (
    <Box
      component="pre"
      sx={{
        p: 1,
        ml: 4,
        overflow: "auto",
        fontFamily: "monospace",
        bgcolor: "action.hover",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Box>
  );
}
