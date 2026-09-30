import { Box, Drawer, IconButton } from "@mui/material";
import { Terminal } from "lucide-react";

type Props = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const StatusBar = ({ setOpen }: Props) => {
  return (
    <Drawer variant="permanent" anchor="bottom">
      <Box sx={{ display: "flex", px: 1, py: 0.5 }}>
        <Box sx={{ ml: "auto" }}>
          <IconButton
            size="small"
            aria-label="Run command"
            onClick={() => setOpen((current) => !current)}
            sx={{
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <Terminal size={16} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};
