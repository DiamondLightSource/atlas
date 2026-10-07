import { Typography } from "@mui/material";

export function JsonView({ data }: { data: unknown }) {
  return (
    <Typography
      component="pre"
      variant="mono2"
      sx={{
        p: 1,
        ml: 4,
        overflow: "auto",
        bgcolor: "action.hover",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Typography>
  );
}
