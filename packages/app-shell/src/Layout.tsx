import { GlobalStyles } from "@mui/material";
import Box from "@mui/material/Box";
import { NavLink, Outlet } from "react-router-dom";
import { routePath, type RouterProps } from "./Router";
import { SidebarNav, type Navigation } from "@diamondlightsource/sci-react-ui";
import { TopBar } from "./TopBar";
import { usePersistentDrawerState } from "./usePersistentDrawerState";
import { topBarHeight } from "./layoutConstants";
import { useAuth } from "@atlas/auth";
import type { ReactNode } from "react";

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
  const { open, setOpen } = usePersistentDrawerState();
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return null;
  const navigation = toNavItemGroups(props, isAuthenticated);

  const footer = props.footer ? props.footer({ open }) : undefined;

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <GlobalStyles
        styles={{
          html: { height: "100%" },
          body: { height: "100%" },
          "#root": { height: "100%" },
        }}
      />
      <TopBar title={props.title} open={open} setOpen={setOpen} />
      <SidebarNav
        navigation={navigation}
        open={open}
        setOpen={setOpen}
        footerSlot={footer}
      />
      <Box
        component="main"
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{ height: topBarHeight, flexShrink: 0 }} />
        <Outlet />
      </Box>
    </Box>
  );
}
