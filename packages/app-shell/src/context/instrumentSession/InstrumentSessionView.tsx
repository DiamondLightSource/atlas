import { useState } from "react";
import { visitToText, VisitInput } from "@diamondlightsource/sci-react-ui";
import { useInstrumentSession } from "./InstrumentSessionProvider";
import { visitTextToVisit } from "../../utils/common";
import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

export function InstrumentSessionView() {
  const { instrumentSession, setInstrumentSession, sessionsList } =
    useInstrumentSession();
  const [selectedIndex, setSelectedIndex] = useState(1);

  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setAnchorEl(null);
    setInstrumentSession(event.currentTarget.textContent ?? "");
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleClick}
        color="inherit" // to let you actually see it
        variant="text"
      >
        {instrumentSession}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": buttonId,
          },
        }}
      >
        {sessionsList.map((option, index) => (
          <MenuItem
            key={option}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem selected={true} onKeyDown={(e) => e.stopPropagation()}>
          <VisitInput
            visit={
              visitTextToVisit(instrumentSession) ?? {
                number: 6,
                proposalCode: "cm",
                proposalNumber: 12345,
              }
            }
            onSubmit={(visit) => {
              setInstrumentSession(visitToText(visit));
              setAnchorEl(null);
            }}
          />
        </MenuItem>
      </Menu>
    </div>
  );
}
