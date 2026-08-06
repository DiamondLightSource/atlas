import { Box, Stack, Typography } from "@mui/material";
import { PucksTable } from "../components/PucksTable/PucksTable";

function Pucks() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Stack direction="column" alignItems="center" spacing={3}>
        <Typography variant="h4" component="h1" textAlign="center">
          Pucks for instrument i15-1
        </Typography>
        <PucksTable />
      </Stack>
    </Box>
  );
}

export default Pucks;
