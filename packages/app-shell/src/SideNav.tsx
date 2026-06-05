import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  type Theme,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import type { Section, SectionGroup } from "./Router";
import type React from "react";
import { Fragment } from "react";
import { DiamondTheme } from "@diamondlightsource/sci-react-ui";

interface SideNavProps {
  navigation: SectionGroup[];
  open: boolean;
}

const drawerTransition = (theme: Theme, opening: boolean) => {
  return theme.transitions.create("width", {
    easing: opening
      ? theme.transitions.easing.easeIn
      : theme.transitions.easing.easeOut,
    duration: opening
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  });
};

export function SideNav({ navigation, open }: SideNavProps) {
  const width = open ? 256 : 72;
  console.log(DiamondTheme.spacing(1));

  return (
    <Drawer
      variant="permanent"
      sx={(theme) => ({
        width: width,
        flexShrink: 0,
        transition: drawerTransition(theme, open),
        [`& .MuiDrawer-paper`]: {
          width: width,
          boxSizing: "border-box",
          transition: drawerTransition(theme, open),
        },
      })}
    >
      <Toolbar /> {/* spacer equal to the AppBar's height*/}
      <Box sx={{ overflow: "auto" }}>
        <List
          sx={{
            p: 1,
            flexDirection: "column",
          }}
        >
          {navigation.map((group, groupIndex) => (
            <Fragment key={groupIndex}>
              {groupIndex > 0 && <SectionDivider />}
              {group.sections.map((route) => (
                <Entry key={route.path} route={route} open={open} />
              ))}
            </Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

function SectionDivider() {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Divider />
    </Box>
  );
}

interface EntryProps {
  route: Section;
  open: boolean;
}

function Entry(props: EntryProps) {
  const route = props.route;
  const icon = (
    <ListItemIcon
      sx={{
        minWidth: 0,
        mr: 2,
        color: props.open ? "text.secondary" : "text.primary",
      }}
    >
      {route.icon}
    </ListItemIcon>
  );
  return (
    <ListItem
      disablePadding
      sx={{ mb: 0.5 }} // the gap prop implemented with bottom margin
    >
      <ListItemButton
        component={NavLink as React.ElementType}
        to={route.path}
        sx={{
          borderRadius: 1,
          "&.active": {
            bgcolor: "action.selected", // "primary.onContainer" when it exists
          },
        }}
        aria-label={route.name}
      >
        {props.open ? (
          icon
        ) : (
          <Tooltip title={route.name} placement="right">
            {icon}
          </Tooltip>
        )}
        <ListItemText // always render but conditionally hide
          primary={route.name}
          sx={{
            width: props.open ? "auto" : 0,
            overflow: "hidden",
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
