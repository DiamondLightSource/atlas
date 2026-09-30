import { Collapse, GlobalStyles, Paper, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { NavLink, Outlet } from "react-router-dom";
import { routePath, type RouterProps } from "./Router";
import { SidebarNav, type Navigation } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { usePersistentDrawerState } from "./usePersistentDrawerState";
import { topBarHeight, statusBarHeight } from "./layoutConstants";
import { StatusBar } from "./StatusBar";
import { OverlayedPanel, type LabelledContent } from "./OverlayedPanel";
import { useState } from "react";
import { Resizable } from "re-resizable";

export function toNavItemGroups(routerProps: RouterProps): Navigation {
  return routerProps.navigation.map((group) => ({
    name: group.name,
    navItems: group.sections.map((section) => ({
      label: section.name,
      icon: section.icon,
      linkProps: {
        to: routePath(section),
        component: NavLink,
      },
    })),
  }));
}

export function Layout(props: RouterProps) {
  const { sidebarOpen, setSidebarOpen } = usePersistentDrawerState();

  const navigation = toNavItemGroups(props);

  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <GlobalStyles
        styles={{
          html: { height: "100%" },
          body: { height: "100%" },
          "#root": { height: "100%" },
        }}
      />
      <TopBar title={props.title} open={sidebarOpen} setOpen={setSidebarOpen} />
      <SidebarNav
        navigation={navigation}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        footer={props.footer}
      />
      <Box
        component="main"
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
        }}
      >
        {/* Spacer, same height as the fixed TopBar's Navbar */}
        <Box sx={{ height: topBarHeight, flexShrink: 0 }} />
        <Outlet />
        {props.panelComponents && (
          <Collapse
            in={panelOpen}
            orientation="vertical"
            sx={{
              position: "absolute",
              bottom: statusBarHeight,
              left: 0,
              right: 0,
              zIndex: 1,
              minWidth: 0,
            }}
          >
            <Resizable
              defaultSize={{ height: 450 }}
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <OverlayedPanel
                children={props.panelComponents.components}
                close={() => setPanelOpen(false)}
              />
            </Resizable>
          </Collapse>
        )}
      </Box>
      <StatusBar setOpen={setPanelOpen} />
    </Box>
  );
}
