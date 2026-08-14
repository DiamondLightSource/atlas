import { Drawer, Box, IconButton, Typography } from "@mui/material";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Children, Fragment, type ReactNode } from "react";

interface ControlsDrawerProps {
  open: boolean;
  collapsedHeight: number;
  onToggle: () => void;
  controls: ReactNode | ReactNode[];
}

function ControlsDrawer({
  open,
  collapsedHeight,
  onToggle,
  controls,
}: ControlsDrawerProps) {
  const items = Children.toArray(controls);

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
          bgcolor: "transparent",
          overflowY: "auto",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          height: 64,
          flexShrink: 0,
        }}
      >
        <Typography variant="overline">Controls</Typography>
        <IconButton
          onClick={onToggle}
          aria-label={open ? "Collapse controls" : "Expand controls"}
          aria-expanded={open}
        >
          {open ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          display: open ? "flex" : "none",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "flex-start",
          px: { xs: 3, md: 6 },
          pb: 3,
        }}
      >
        {items.map((control, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <Box
                sx={{
                  alignSelf: "stretch",
                  borderTop: { xs: 1, md: 0 },
                  borderLeft: { xs: 0, md: 1 },
                  borderColor: "divider",
                  mx: { xs: 6, md: 0 },
                  my: { xs: 0, md: 4 },
                }}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>{control}</Box>
          </Fragment>
        ))}
      </Box>
    </Drawer>
  );
}

export default ControlsDrawer;
