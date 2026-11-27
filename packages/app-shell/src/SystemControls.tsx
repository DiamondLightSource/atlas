import { Box, Typography } from "@mui/material";
import { statusBarHeight } from "./layoutConstants";

export interface SystemControlsProps {
  open: boolean;
  children?: React.ReactNode;
}
export function SystemControls({ open, children }: SystemControlsProps) {
  return (
    <Box paddingY={2}>
      {open && (
        <Typography variant="overline" color="textSecondary" noWrap={true}>
          SYSTEM CONTROLS
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          /**
           * Temporary fix!
           * see https://github.com/DiamondLightSource/sci-react-ui/issues/334
           */
          pb: `${statusBarHeight}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
