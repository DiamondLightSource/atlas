import { Box } from "@mui/material";
import { Console } from "./Console";

export function Dashboard() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 400,
        width: "50%",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Console />
    </Box>
  );
}
