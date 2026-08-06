import { useState } from "react";
import { useInstrumentSession } from "./InstrumentSessionProvider";
import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Science, ExpandMore } from "@mui/icons-material";
import { ListSubheader } from "@mui/material";

export function InstrumentSessionView() {
  const { instrumentSession, setInstrumentSession, sessionsList } =
    useInstrumentSession();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  const menuDisabled = sessionsList.length <= 1 ? true : false;
  const id = "session-input";
  const staticButtonId = `${id}-staticButton`;
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
    setAllSelected(false);
    setAnchorEl(null);
    setInstrumentSession([event.currentTarget.textContent ?? ""]);
    setButtonText(event.currentTarget.textContent ?? "");
  };
  const handleAllSessionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSelectedIndex(null);
    setAllSelected(true);
    setAnchorEl(null);
    setInstrumentSession(sessionsList);
    setButtonText("All Active Sessions");
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (menuDisabled) {
    return (
      <div>
        <Button
          data-testid={staticButtonId}
          startIcon={<Science />}
          color="secondary"
          variant="outlined"
        >
          {instrumentSession[0]}
        </Button>
      </div>
    );
  } else {
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
          color="secondary"
          variant="outlined"
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
            selected={allSelected}
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
}
