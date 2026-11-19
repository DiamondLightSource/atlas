import { Box, Grid } from "@mui/material";
import { Map } from "./Map";
import { ROIs } from "./roi/ROIs";
import {
  RectangularSelection,
  type SelectionBase,
  type SelectionHandler,
} from "@diamondlightsource/davidia";
import { useState } from "react";
import { Parameters } from "./Parameters";

export function Mapping() {
  const [selections, setSelections] = useState<SelectionBase[]>([]);
  const selectionHandler: SelectionHandler = (
    updatedSelection,
    dragging,
    clear,
  ) => {
    if (!updatedSelection) return "";
    if (RectangularSelection.isShape(updatedSelection)) {
      setSelections(prev =>
        prev.map(sel =>
          sel.id === updatedSelection.id ? updatedSelection : sel,
        ),
      );
    }
    return updatedSelection.id;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
        }}
      >
        <Grid size={2}>Datasets</Grid>
        <Grid size={7}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "& > div": {
                  display: "flex",
                  flex: 1,
                  minHeight: 0,
                },
              }}
            >
              <Map
                selections={selections}
                selectionHandler={selectionHandler}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "& > div": {
                  display: "flex",
                  flex: 1,
                  minHeight: 0,
                },
              }}
            >
              <Map selections={[]} selectionHandler={() => null} />
            </Box>
          </Box>
        </Grid>
        <Grid size={3}>
          <Parameters selections={selections} setSelections={setSelections} />
        </Grid>
      </Grid>
    </Box>
  );
}
