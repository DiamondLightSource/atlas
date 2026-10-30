import { Box, Typography } from "@mui/material";

export interface SystemControlsProps {
  open: boolean;
  children?: React.ReactNode;
}
export function SystemControls({ open, children }: SystemControlsProps) {
  // This component is designed to be the footer prop in the SideNav component.
  return (
    <Box
      sx={{
        py: 2,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
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
