import {
  InteractionModeType,
  RectangularSelection,
  usePlotCustomizationContext,
  type SelectionBase,
} from "@diamondlightsource/davidia";
import { Button, List, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { useState, type MouseEventHandler } from "react";
import { RoiItem } from "./ROIEditor";

type Props = {
  selections: SelectionBase[];
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[]>>;
  selectedRoi: SelectionBase | undefined;
  setSelected: (selected: SelectionBase | undefined) => void;
};

const colours = [
  "#7c5ee0",
  "#ed604f",
  "#3d3027",
  "#9283b0",
  "#464892",
  "#316f5e",
  "#b67886",
  "#a25500",
  "#318ff8",
  "#786941",
  "#589704",
  "#9c5894",
];
export function ROIs(props: Props) {
  const [roiCount, setCount] = useState<number>(0);
  const [colourIndex, setColourIndex] = useState<number>(0);
  // const { setMode } = usePlotCustomizationContext();
  const newRoiHandler: MouseEventHandler = event => {
    const selection = new RectangularSelection([25, 25], [50, 50]);
    selection.id = `ROI ${roiCount}`;
    selection.colour = colours[colourIndex];
    props.setSelections(current => [...current, selection]);
    setCount(current => current + 1);
    setColourIndex(prev => {
      if (prev + 1 < colours.length) {
        return prev + 1;
      } else {
        return 0;
      }
    });

    // setMode(InteractionModeType.selectRegion);
  };
  return (
    <>
      <Typography variant="h6">Regions</Typography>
      <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {props.selections.map((selection, id) => (
          <RoiItem roi={selection} shape="rect" key={id} />
        ))}
      </List>
      <Button variant="outlined" startIcon={<Plus />} onClick={newRoiHandler}>
        Add ROI
      </Button>
    </>
  );
}
