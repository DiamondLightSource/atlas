import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";

export type Raster = {
  xStep: number;
  yStep: number;
};

type Props = {
  path: Raster;
  setPath: React.Dispatch<React.SetStateAction<Raster>>;
};

export function RasterPath(props: Props) {
  const updateX = (x: number) => props.setPath(prev => ({ ...prev, xStep: x }));
  const updateY = (y: number) => props.setPath(prev => ({ ...prev, yStep: y }));
  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, p: 2 }}>
      <NumberInput
        label="X step (mm)"
        defaultValue={props.path.xStep}
        onCommit={updateX}
        helperText={false}
      />
      <NumberInput
        label="Y step (mm)"
        defaultValue={props.path.yStep}
        onCommit={updateY}
        helperText={false}
      />
    </Box>
  );
}
