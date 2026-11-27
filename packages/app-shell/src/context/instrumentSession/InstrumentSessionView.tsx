import { useState } from "react";
import { useInstrumentSession } from "@atlas/instrument-session";
import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Science, ExpandMore } from "@mui/icons-material";
import { ListSubheader, Tooltip } from "@mui/material";

export function InstrumentSessionView() {
  const {
    instrumentSession,
    setInstrumentSession,
    instrumentSessionList,
    loading,
    error,
  } = useInstrumentSession();

  const id = "session-input";
  const staticButtonId = `${id}-staticButton`;
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (session: string) => {
    setAnchorEl(null);
    setInstrumentSession(session);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!instrumentSessionList || instrumentSessionList.length <= 1) {
    const tooltip = loading
      ? "Loading sessions..."
      : error
        ? `Failed to load sessions: ${error.message}`
        : !instrumentSessionList
          ? "Log in to see your sessions."
          : instrumentSessionList.length === 0
            ? "You have no sessions in progress on this instrument."
            : "";
    return (
      <div>
        <Tooltip title={tooltip}>
          <Button
            data-testid={staticButtonId}
            startIcon={<Science />}
            color="secondary"
            variant="outlined"
          >
            {instrumentSession ?? "No Session Selected"}
          </Button>
        </Tooltip>
      </div>
    );
  }

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
        {instrumentSession ?? "Select Session"}
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
        <ListSubheader>Available Sessions</ListSubheader>
        {instrumentSessionList.map((session) => (
          <MenuItem
            key={session}
            selected={session === instrumentSession}
            onClick={() => handleMenuItemClick(session)}
          >
            {session}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
