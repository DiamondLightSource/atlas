import { Box, Drawer, IconButton } from "@mui/material";
import { PanelBottomOpen, PanelBottomClose } from "lucide-react";
import { statusBarHeight } from "./layoutConstants";

type PanelControl = {
  panelOpen: boolean;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type Props = {
  panelControl?: PanelControl;
};

export const StatusBar = ({ panelControl }: Props) => {
  const Icon = panelControl?.panelOpen ? PanelBottomClose : PanelBottomOpen;
  const onClick = () => panelControl!.setPanelOpen((prev) => !prev);
  return (
    <Drawer variant="permanent" anchor="bottom">
      <Box sx={{ display: "flex", px: 1, py: 0.5, height: statusBarHeight }}>
        {panelControl && (
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              aria-label="Open/close panel"
              onClick={onClick}
              sx={{
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <Icon size={16} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
