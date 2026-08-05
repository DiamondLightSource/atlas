import { useState } from "react";
import { useInstrumentSession } from "./InstrumentSessionProvider";
import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Science, ExpandMore } from "@mui/icons-material";
import { ListSubheader, styled } from "@mui/material";

export function InstrumentSessionView() {
  const { instrumentSession, setInstrumentSession, sessionsList } =
    useInstrumentSession();
  const [selectedIndex, setSelectedIndex] = useState(1);

  const id = "session-input";
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [buttonText, setButtonText] = React.useState<string>(
    instrumentSession[0],
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setAnchorEl(null);
    setInstrumentSession([event.currentTarget.textContent ?? ""]);
    setButtonText(event.currentTarget.textContent ?? "");
  };
  const handleAllSessionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(null);
    setInstrumentSession(sessionsList);
    setButtonText("All Active Sessions");
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        data-testid={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        startIcon={<Science />}
        endIcon={<ExpandMore />}
        onClick={handleClick}
        color="inherit" // to let you actually see it
        variant="text"
      >
        {buttonText}
      </Button>
      <Menu
        data-testid={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": buttonId,
          },
        }}
      >
        <ListSubheader>Session Selection</ListSubheader>
        <MenuItem
          key="All Active Sessions"
          selected={true}
          onClick={(event) => handleAllSessionsClick(event)}
        >
          All Active Sessions
        </MenuItem>
        <Divider />
        <ListSubheader> Available Sessions </ListSubheader>
        {sessionsList.map((option, index) => (
          <MenuItem
            key={option}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
