import { Collapse, GlobalStyles } from "@mui/material";
import Box from "@mui/material/Box";
import { NavLink, Outlet } from "react-router-dom";
import { routePath, type RouterProps } from "./Router";
import { SidebarNav, type Navigation } from "@diamondlightsource/sci-react-ui";
import { TopBar } from "./TopBar";
import { usePersistentDrawerState } from "./usePersistentDrawerState";
import { topBarHeight, statusBarHeight } from "./layoutConstants";
import { useAuth } from "@atlas/auth";
import { useState, type ReactNode } from "react";
import { StatusBar } from "./StatusBar";
import { Resizable } from "re-resizable";
import { GlobalPanel } from "./GlobalPanel";

export function toNavItemGroups(
  routerProps: RouterProps,
  isAuthenticated: boolean,
): Navigation {
  return routerProps.navigation.map((group) => ({
    name: group.name,
    navItems: group.sections
      .filter((section) => isAuthenticated || !section.isProtected)
      .map((section) => ({
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
  const { open: sidebarOpen, setOpen: setSidebarOpen } =
    usePersistentDrawerState();
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return null;
  const navigation = toNavItemGroups(props, isAuthenticated);

  const footer = props.footer ? props.footer({ open: sidebarOpen }) : undefined;
  const panelControl = props.panelComponents
    ? { panelOpen, setPanelOpen }
    : undefined;
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
        footerSlot={footer}
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
              minHeight={"20vh"}
              maxHeight={"80vh"}
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
              enable={{
                top: true,
              }}
            >
              <GlobalPanel
                children={props.panelComponents.components}
                close={() => setPanelOpen(false)}
              />
            </Resizable>
          </Collapse>
        )}
      </Box>
      <StatusBar panelControl={panelControl} />
    </Box>
  );
}
