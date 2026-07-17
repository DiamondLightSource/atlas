import { Drawer, Box, IconButton, Typography } from "@mui/material";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { SpectroscopyForm } from "./SpectroscopyForm";

interface ControlsDrawerProps {
  open: boolean;
  collapsedHeight: number;
  onToggle: () => void;
}

function ControlsDrawer({
  open,
  collapsedHeight,
  onToggle,
}: ControlsDrawerProps) {
  return (
    <Drawer
      anchor="bottom"
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": {
          position: "relative",
          height: open ? "auto" : collapsedHeight,
          flexGrow: open ? 1 : 0,
          transition: "flex-grow 0.4s ease, height 0.4s ease",
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          height: 64,
        }}
      >
        <Typography variant="subtitle1">Controls</Typography>
        <IconButton onClick={onToggle}>
          {open ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
        </IconButton>
      </Box>
      <Box
        sx={{
          px: 10,
        }}
      >
        {open ? <SpectroscopyForm /> : <Box />}
      </Box>
    </Drawer>
  );
}

export default ControlsDrawer;
