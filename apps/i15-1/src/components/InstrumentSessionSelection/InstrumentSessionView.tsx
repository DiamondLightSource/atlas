import { useState } from "react";
import { visitToText, VisitInput } from "@diamondlightsource/sci-react-ui";
import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

function InstrumentSessionView({ sessionsList }: { sessionsList: string[] }) {
  const { instrumentSession, setInstrumentSession } = useInstrumentSession();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
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
      <List component="nav" aria-label="Instrument sessions">
        <ListItemButton
          id="lock-button"
          aria-haspopup="listbox"
          aria-controls="is-menu"
          aria-label="instrument session"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClickListItem}
        >
          <ListItemText
            primary="Instrument Session"
            secondary={instrumentSession}
          />
        </ListItemButton>
      </List>
      <Menu
        id="is-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "lock-button",
            role: "listbox",
          },
        }}
      >
        <MenuItem selected={true} onKeyDown={(e) => e.stopPropagation()}>
          <VisitInput
            visit={{
              number: 1,
              proposalCode: "cm",
              proposalNumber: 12345,
            }}
            onSubmit={(visit) => {
              setInstrumentSession(visitToText(visit));
              setAnchorEl(null);
            }}
          />
        </MenuItem>
        <Divider />
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

export default InstrumentSessionView;
