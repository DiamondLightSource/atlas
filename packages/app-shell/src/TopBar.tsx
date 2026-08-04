import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { Menu } from "lucide-react";

import { ColourSchemeButton, Logo } from "@diamondlightsource/sci-react-ui";
import { Divider } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type Props = {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function TopBar({ title, open, setOpen }: Props) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          aria-label="menu"
          sx={{ mr: 2, color: "brand.onContainer" }}
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </IconButton>

        <Box sx={{ mr: 2, width: 100 }}>
          <Logo interchange />
        </Box>

        <Divider orientation="vertical" variant="middle" flexItem />

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            ml: 1.5,
            mt: 1.25,
            mr: 1.25,
            color: "brand.onContainer",
          }}
        >
          Data Acquisition
        </Typography>

        <Divider orientation="vertical" variant="middle" flexItem />

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            ml: 1.5,
            mt: 1.25,
            color: "brand.onContainer",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ ml: "auto" }}>
          <ColourSchemeButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
