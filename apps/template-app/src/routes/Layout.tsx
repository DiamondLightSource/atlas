/**A common layout for all routes, with a Navbar, breadcrumbs and footer
 * It should be customised to use the app-specific navbar
 */

import { Link, Outlet, useLocation } from "react-router-dom";
import { AppNavbar } from "../components/AppNavbar";
import {
  Breadcrumbs,
  ColourSchemeButton,
  Footer,
} from "@diamondlightsource/sci-react-ui";
import { Box, useTheme } from "@mui/material";


export function Layout() {
  const location = useLocation();
  const theme = useTheme();
  return (
    <div>
      <AppNavbar />
      <Breadcrumbs path={location.pathname} linkComponent={Link} />
      <Outlet />
      <Footer
        color={theme.palette.primary.main}
        leftSlot={<ColourSchemeButton />}
        containerWidth={false}
      />
    </div>
  );
}
