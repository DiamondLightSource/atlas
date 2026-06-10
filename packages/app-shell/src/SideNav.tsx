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
} from "@mui/material";
import { NavLink } from "react-router-dom";
import type { Section, SectionGroup } from "./Router";
import type React from "react";
import { Fragment } from "react";

interface SideNavProps {
  navigation: SectionGroup[];
  open: boolean;
}

export function SideNav({ navigation, open }: SideNavProps) {
  const width = open ? 256 : 72;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: width,
          boxSizing: "border-box",
        },
      }}
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
              {groupIndex > 0 && <Divider />}
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
      }}
    >
      {route.icon}
    </ListItemIcon>
  );
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={NavLink as React.ElementType}
        to={route.path}
        sx={{
          "&.active": {
            bgcolor: "action.selected",
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
            opacity: props.open ? 1 : 0,
            width: props.open ? "auto" : 0,
            overflow: "hidden",
            transition: "0.2s",
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
