import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";
import type { MappingScan } from "../types";

export type Raster = MappingScan["path"];

type Props = {
  path: Raster;
  setPath: (path: Raster) => void;
};

export function RasterPath({ path, setPath }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, p: 2 }}>
      <NumberInput
        label="X points"
        defaultValue={path.xPoints}
        onCommit={xPoints => setPath({ ...path, xPoints })}
        helperText={false}
      />
      <NumberInput
        label="Y points"
        defaultValue={path.yPoints}
        onCommit={yPoints => setPath({ ...path, yPoints })}
        helperText={false}
      />
    </Box>
  );
}
