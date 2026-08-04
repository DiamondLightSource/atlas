import { Box, Divider, Typography } from "@mui/material";

export interface SystemControlsProps {
  open: boolean;
  children?: React.ReactNode;
}
export function SystemControls({ open, children }: SystemControlsProps) {
  // This component is designed to be the footer prop in the SideNav component.
  return (
    <Box
      sx={{
        p: 2,
        mt: "auto",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Divider sx={{ width: "100%", mb: 1 }} />
      {open && (
        <Typography
          fontSize={14}
          color="grey"
          sx={{
            alignSelf: "flex-start",
          }}
        >
          SYSTEM CONTROLS
        </Typography>
      )}
      {children}
    </Box>
  );
}
