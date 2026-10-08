import { Box, Collapse, IconButton, Paper, Typography } from "@mui/material";
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
    <Paper
      square
      elevation={0}
      sx={{
        flexShrink: 0,
        bgcolor: "transparent",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          height: 80,
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

      <Collapse in={open}>
        <Box
          sx={{
            display: "flex",
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
      </Collapse>
    </Paper>
  );
}

export default ControlsDrawer;
