import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";
import type { RouterProps } from "./Router";
import { usePersistentDrawerState } from "./usePersistentDrawerState";
import { Toolbar } from "@mui/material";

export function Layout(props: RouterProps) {
  const { open, setOpen } = usePersistentDrawerState();

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar title={props.title} open={open} setOpen={setOpen} />
      <SidebarNav navigation={props.navigation} open={open} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* The Toolbar acts as a spacer,
            same size as the toolbar used inside the TopBar's AppBar*/}
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
