import {
  Box,
  Drawer,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  useMediaQuery,
  useTheme,
  type Theme,
} from "@mui/material";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { PageSidePanel, TabBarActions } from "@atlas/app-shell";
import { layoutTransition } from "./plotGrid";

const PANE_WIDTH = 600;
const DRAWER_ID = "controls-drawer";

export interface PaneTab {
  label: string;
  content: ReactNode;
}

interface ControlsPaneProps {
  open: boolean;
  onToggle: () => void;
  tabs: PaneTab[];
}

/**
 * The controls, in tabs, in a persistent drawer at the right of the page,
 * below the section's tab bar, making room for itself. Its button is at the
 * end of the tab bar, above it. The drawer stays mounted, so a form keeps its
 * values while hidden.
 */
function ControlsPane({ open, onToggle, tabs }: ControlsPaneProps) {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // the name stays the same; aria-expanded says whether it is open
  const tooltip = open ? "Hide controls" : "Show controls";

  // the drawer comes after the whole page in the tab order, so opening it
  // with its button takes focus straight to it, once it has slid in
  const focusOnOpen = useRef(false);
  const focusTab = () => {
    if (!focusOnOpen.current) return;
    focusOnOpen.current = false;
    document.getElementById(`controls-tab-${tab}`)?.focus();
  };
  const toggle = () => {
    focusOnOpen.current = !open;
    onToggle();
  };

  return (
    <>
      <TabBarActions>
        <Tooltip title={tooltip}>
          <IconButton
            onClick={toggle}
            aria-label="Controls"
            aria-expanded={open}
            aria-controls={DRAWER_ID}
          >
            {open ? <PanelRightClose /> : <PanelRightOpen />}
          </IconButton>
        </Tooltip>
      </TabBarActions>

      <PageSidePanel>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            width: open ? PANE_WIDTH : 0,
            // the drawer slides in as the space opens, at the same pace
            ...layoutTransition(["width"]),
          }}
        >
          <Drawer
            variant="persistent"
            anchor="right"
            open={open}
            transitionDuration={
              reducedMotion ? 0 : theme.transitions.duration.shortest
            }
            slotProps={{
              transition: { onEntered: focusTab },
              paper: {
                id: DRAWER_ID,
                component: "aside",
                "aria-label": "Controls",
                sx: {
                  // in the space made for it, not fixed over the whole window
                  position: "absolute",
                  width: PANE_WIDTH,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  // what an elevation-1 Paper paints; a persistent drawer's
                  // paper is held at elevation 0
                  bgcolor: (theme: Theme) => theme.palette.surface.elevated(1),
                  borderLeft: 1,
                  borderColor: "divider",
                },
              },
            }}
          >
            <Tabs
              aria-label="Controls"
              value={tab}
              onChange={(_, value: number) => setTab(value)}
              sx={{
                flexShrink: 0,
                // sized to their labels, not stretched or held to a minimum
                "& .MuiTab-root": { minWidth: 0, px: 2 },
                bgcolor: (theme: Theme) => theme.palette.surface.elevated(2),
                borderBottom: 1,
                borderColor: "divider",
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
          </Drawer>
        </Box>
      </PageSidePanel>
    </>
  );
}

export default ControlsPane;
