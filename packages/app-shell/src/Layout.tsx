import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import { NavLink, Outlet } from "react-router-dom";
import { routePath, type RouterProps } from "./Router";
import { SidebarNav, type Navigation } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { usePersistentDrawerState } from "./usePersistentDrawerState";
import { topBarHeight } from "./layoutConstants";

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
  const { open, setOpen } = usePersistentDrawerState();

  const navigation = toNavItemGroups(props);

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar title={props.title} open={open} setOpen={setOpen} />
      <SidebarNav
        navigation={navigation}
        open={open}
        setOpen={setOpen}
        footer={props.footer}
      />
      <Box
        component="main"
        sx={{ display: "flex", flex: 1, flexDirection: "column" }}
      >
        {/* Spacer, same height as the fixed TopBar's Navbar */}
        <Box sx={{ height: topBarHeight, flexShrink: 0 }} />
        <Outlet />
      </Box>
    </Box>
  );
}
