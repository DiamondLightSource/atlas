import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import { NavLink, Outlet } from "react-router-dom";
import { routePath, type RouterProps } from "./Router";
import { SidebarNav, type Navigation } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { usePersistentDrawerState } from "./usePersistentDrawerState";

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
      <SidebarNav navigation={navigation} open={open} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* The Toolbar acts as a spacer,
            same size as the toolbar used inside the TopBar's AppBar*/}
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
