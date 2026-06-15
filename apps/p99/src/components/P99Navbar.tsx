import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import {
  ColourSchemeButton,
  Navbar,
  NavLink,
  NavLinks,
  User,
} from "@diamondlightsource/sci-react-ui";
import { useUserAuth } from "../context/userAuth/useUserAuth";

const P99Navbar = () => {
  const user = useUserAuth();

  const handleLogIn = () => window.location.assign("/oauth2/sign_in");
  const handleLogOut = () => window.location.assign("/oauth2/sign_out");

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
            <NavLink to="/" linkComponent={Link} test-id="home-button">
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
          <User
            onLogin={handleLogIn}
            onLogout={handleLogOut}
            user={
              user.person == null || user.person == undefined
                ? null
                : { fedid: user.person }
            }
            colour="white"
          />
          <ColourSchemeButton />
        </Box>
      }
    />
  );
};

export default P99Navbar;
