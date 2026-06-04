import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import {
  ColourSchemeButton,
  Navbar,
  NavLink,
  NavLinks,
} from "@diamondlightsource/sci-react-ui";

function P99Navbar() {
  return (
    <Navbar
      logo="theme"
      containerWidth={false}
      leftSlot={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "nowrap",
            overflow: "hidden",
          }}
        >
          <NavLinks>
            <NavLink to="/" linkComponent={Link}>
              Home
            </NavLink>
            <NavLink to="plans" linkComponent={Link}>
              Plans
            </NavLink>
            <NavLink to="workflows" linkComponent={Link}>
              Workflows
            </NavLink>
          </NavLinks>
        </Box>
      }
      rightSlot={
        <Box sx={{ marginLeft: 4 }}>
          <ColourSchemeButton />
        </Box>
      }
    />
  );
}

export default P99Navbar;
