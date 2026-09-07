import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { Theme } from "@mui/material/styles";

import { Menu } from "lucide-react";

import {
  ColourSchemeButton,
  Logo,
  Navbar,
  useAuth,
  User,
  type AuthState,
} from "@diamondlightsource/sci-react-ui";

import { topBarHeight } from "./layoutConstants";

import { InstrumentSessionView } from "./context/instrumentSession/InstrumentSessionView";
import { useMemo } from "react";

type Props = {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function TopBar({ title, open, setOpen }: Props) {
  const auth = useAuth();

  const user: AuthState | null = useMemo(() => {
    if (!auth || !auth.authenticated || !auth.user) return null;
    return { name: auth.user.name };
  }, [auth]);

  return (
    <Navbar
      surface="surface"
      variant="base"
      containerWidth={false}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: topBarHeight,
        zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
        borderBottom: (theme: Theme) =>
          `1px solid ${theme.palette.border.subtle}`,
      }}
      leftSlot={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </IconButton>

          <Box
            sx={{ mr: 2, width: 100, display: "flex", alignItems: "center" }}
          >
            <Logo />
          </Box>

          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ borderColor: "currentColor", opacity: 0.3 }}
          />

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ ml: 1.5, mr: 1.25 }}
          >
            {title}
          </Typography>

          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ borderColor: "currentColor", opacity: 0.3 }}
          />

          <Box
            sx={{
              ml: 1.5,
            }}
          >
            <InstrumentSessionView />
          </Box>
        </Box>
      }
      rightSlot={
        <>
          <User
            key="user"
            onLogin={auth.login}
            onLogout={auth.logout}
            user={user}
          />
          <ColourSchemeButton />
        </>
      }
    />
  );
}
