import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { topBarHeight } from "./layoutConstants";
import { usePageSlots } from "./context/pageSlots";

export interface TabDescription {
  label: string;
  path: string;
}

export interface TabbedPanelProps {
  tabs: TabDescription[];
  basePath: string;
}

/** An outlet for tabbed pages */
export function TabbedPanel({ tabs, basePath }: TabbedPanelProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const slots = usePageSlots();

  const currentTab =
    tabs.find((tab) => location.pathname.startsWith(`${basePath}/${tab.path}`))
      ?.path ?? false;

  const handleChange = (_: React.SyntheticEvent, value: string) => {
    navigate(`${basePath}/${value}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        width: "100%",
      }}
    >
      <Paper
        square
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChange}
          variant="standard"
          sx={{ flex: 1, minWidth: 0 }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.path}
              label={tab.label}
              value={tab.path}
              aria-label={tab.label}
            />
          ))}
        </Tabs>
        <Box
          ref={slots?.setTabBarEnd}
          sx={{ display: "flex", alignItems: "center", pr: 1 }}
        />
      </Paper>

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Box>
        {/* a page's side panel, flush with the edges; no room while empty */}
        <Box
          ref={slots?.setSidePanel}
          sx={{ display: "flex", flexShrink: 0, minHeight: 0 }}
        />
      </Box>
    </Box>
  );
}
