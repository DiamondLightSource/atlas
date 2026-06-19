import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import type { RouterProps } from "./Router";
import { usePersistentDrawerState } from "./usePersistentDrawerState";
import { Toolbar } from "@mui/material";

export function Layout(props: RouterProps) {
  const { open, setOpen } = usePersistentDrawerState();

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar title={props.title} open={open} setOpen={setOpen} />
      <SideNav navigation={props.navigation} open={open} />
      <Box
        component="main"
        sx={{ display: "flex", flex: 1, flexDirection: "column" }}
      >
        {/* The Toolbar acts as a spacer,
            same size as the toolbar used inside the TopBar's AppBar*/}
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
