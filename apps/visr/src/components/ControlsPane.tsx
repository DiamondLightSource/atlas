import { Box, IconButton, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useState, type ReactNode } from "react";
import { layoutTransition } from "./plotGrid";

export const PANE_WIDTH = 600;
const COLLAPSED_WIDTH = 56;
export const HEADER_HEIGHT = 56;

export interface PaneTab {
  label: string;
  content: ReactNode;
}

interface ControlsPaneProps {
  open: boolean;
  onToggle: () => void;
  tabs: PaneTab[];
  /** In the footer; stays mounted when collapsed, so give it a compact form */
  status?: ReactNode;
}

/**
 * The controls, in tabs, in a pane at the right. Collapses to a strip with the
 * expand button and the status. The tabs stay mounted, so a form keeps its
 * values while hidden.
 */
function ControlsPane({ open, onToggle, tabs, status }: ControlsPaneProps) {
  const [tab, setTab] = useState(0);

  return (
    <Box
      component="aside"
      aria-label="Controls"
      sx={{
        width: open ? PANE_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        // opens and closes quickly, rather than snapping; its contents are
        // revealed or cut off by the edge as it goes
        ...layoutTransition(["width"]),
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        borderLeft: 1,
        borderColor: "divider",
        // set apart from the workspace: a tinted body, and a stronger header
        bgcolor: "action.hover",
      }}
    >
      {/* Header: the title, and the button; just the button when collapsed */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // the button stays at the right, in the same place whether open,
          // closed or in between: 8px in, which centres it when collapsed
          justifyContent: "flex-end",
          gap: 1,
          height: HEADER_HEIGHT,
          pl: open ? 2 : 0,
          pr: 1,
          flexShrink: 0,
          bgcolor: "action.selected",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {open && (
          <Typography
            variant="h6"
            component="h2"
            fontWeight="var(--ds-font-weight-semibold)"
            noWrap
            sx={{ mr: "auto" }}
          >
            Controls
          </Typography>
        )}
        <Tooltip title={open ? "Collapse controls" : "Expand controls"}>
          <IconButton
            onClick={onToggle}
            aria-label={open ? "Collapse controls" : "Expand controls"}
            aria-expanded={open}
          >
            {open ? (
              <KeyboardDoubleArrowRightIcon />
            ) : (
              <KeyboardDoubleArrowLeftIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          display: open ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          // its full width throughout, so the forms don't reflow as the pane
          // opens (the border takes 1px)
          width: PANE_WIDTH - 1,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          variant="fullWidth"
          sx={{
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { textTransform: "none", fontSize: "1.125rem" },
          }}
        >
          {tabs.map(({ label }, i) => (
            <Tab
              key={label}
              label={label}
              id={`controls-tab-${i}`}
              aria-controls={`controls-tabpanel-${i}`}
            />
          ))}
        </Tabs>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {tabs.map(({ label, content }, i) => (
            <Box
              key={label}
              role="tabpanel"
              hidden={i !== tab}
              id={`controls-tabpanel-${i}`}
              aria-labelledby={`controls-tab-${i}`}
            >
              {content}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer: the status; just a symbol when collapsed. Always rendered
          here, so it stays mounted through a collapse */}
      <Box
        sx={{
          display: "flex",
          justifyContent: open ? "flex-end" : "center",
          alignItems: "center",
          minWidth: 0,
          // the same height open or collapsed, matching the header
          height: HEADER_HEIGHT,
          px: open ? 2 : 0,
          // at the bottom even when collapsed, with the tabs hidden
          mt: "auto",
          flexShrink: 0,
          // shaded like the header, so it reads as the pane's footer
          bgcolor: "action.selected",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        {status}
      </Box>
    </Box>
  );
}

export default ControlsPane;
