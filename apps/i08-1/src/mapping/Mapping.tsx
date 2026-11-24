import { Box, Grid } from "@mui/material";
import { Map } from "./Map";
import {
  RectangularSelection,
  type SelectionHandler,
} from "@diamondlightsource/davidia";
import { useMemo } from "react";
import { Parameters } from "./Parameters";
import { DefinitionManagerProvider } from "./DefinitionManager";
import {
  regionFromSelection,
  toSelection,
  useDefinitionManager,
} from "./definitions";

const plotContainerSx = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  "& > div": {
    display: "flex",
    flex: 1,
    minHeight: 0,
  },
};

export function Mapping() {
  return (
    <DefinitionManagerProvider>
      <MappingLayout />
    </DefinitionManagerProvider>
  );
}

function MappingLayout() {
  const { definitions, selected, select, updateScan } = useDefinitionManager();

  const selections = useMemo(
    () => definitions.map(def => toSelection(def, def.id === selected?.id)),
    [definitions, selected?.id],
  );

  const selectionHandler: SelectionHandler = updatedSelection => {
    if (!updatedSelection) return "";
    if (RectangularSelection.isShape(updatedSelection)) {
      const region = regionFromSelection(updatedSelection);
      updateScan(updatedSelection.id, scan => ({ ...scan, region }));
      select(updatedSelection.id);
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
            <Box sx={plotContainerSx}>
              <Map
                selections={selections}
                selectionHandler={selectionHandler}
              />
            </Box>
            <Box sx={plotContainerSx}>
              <Map selections={[]} selectionHandler={() => null} />
            </Box>
          </Box>
        </Grid>
        <Grid size={3}>
          <Parameters />
        </Grid>
      </Grid>
    </Box>
  );
}
