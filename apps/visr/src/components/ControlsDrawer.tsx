import { Box, IconButton, Typography } from "@mui/material";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Children, Fragment, type ReactNode } from "react";

interface ControlsDrawerProps {
  open: boolean;
  onToggle: () => void;
  controls: ReactNode | ReactNode[];
}

function ControlsDrawer({ open, onToggle, controls }: ControlsDrawerProps) {
  const items = Children.toArray(controls);

  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          height: 80,
          flexShrink: 0,
        }}
      >
        <Typography variant="overline">Controls</Typography>
        <IconButton
          onClick={onToggle}
          aria-label={open ? "Collapse" : "Expand"}
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
          overflow: "scroll",
          padding: 1,
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
    </Box>
  );
}

export default ControlsDrawer;
