import { Box, Divider, Typography } from "@mui/material";

export interface SystemControlsProps {
  open: boolean;
  systemControls?: (props: { open: boolean }) => React.ReactNode;
}
export function SystemControls({ open, systemControls }: SystemControlsProps) {
  return (
    <Box
      sx={{
        p: 2,
        mt: "auto",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Divider sx={{ width: "100%", mb: 1 }} />
      {open && (
        <Typography fontSize={14} color="grey">
          SYSTEM CONTROLS
        </Typography>
      )}
      <Box
        sx={{
          mt: "auto",
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {systemControls?.({ open })}
      </Box>
    </Box>
  );
}
