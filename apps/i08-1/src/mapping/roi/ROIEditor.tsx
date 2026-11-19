import {
  RectangularSelection,
  type SelectionBase,
} from "@diamondlightsource/davidia";
import { Box, ListItemButton, Typography } from "@mui/material";
import { Circle } from "lucide-react";

type Props = {
  roi: SelectionBase;
  shape: "rect" | "line" | "point";
};

export function RoiItem({ roi }: Props) {
  if (!(roi instanceof RectangularSelection)) {
    return <Typography>Unsupported shape</Typography>;
  }

  return (
    <ListItemButton
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        p: 1,
        alignItems: "flex-start",
        alignSelf: "stretch",
        borderRadius: "4px",
        border: "1px solid",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          alignSelf: "stretch",
        }}
      >
        <Circle size={"8px"} color={roi.colour} fill={roi.colour} />
        <Typography>{roi.id}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          alignSelf: "stretch",
        }}
      >
        <Typography color="text.tertiary">{`${roi.lengths[0].toFixed(1)} x ${roi.lengths[1].toFixed(1)} mm at ${roi.start[0].toFixed(1)}, ${roi.start[1].toFixed(1)}`}</Typography>
      </Box>
    </ListItemButton>
  );
}

export function ROIEditor({ roi, shape }: Props) {
  if (!(roi instanceof RectangularSelection)) {
    return <Typography>Unsupported shape</Typography>;
  }
  const summary = `${roi.id} - ${roi.start} : ${roi.lengths}`;
  return (
    <Box>
      {/* <TextField id="roi-name" label="Name" defaultValue={props.roi.id} /> */}
      <Typography>{summary}</Typography>
    </Box>
  );
}
