import { Box, ListItemButton, Typography } from "@mui/material";
import { Circle } from "lucide-react";
import type { MappingDefinition } from "../definitions";

type Props = {
  definition: MappingDefinition;
  selected: boolean;
  onSelect: () => void;
};

export function RoiItem({ definition, selected, onSelect }: Props) {
  const { fastStart, fastStop, slowStart, slowStop } = definition.scan.region;
  return (
    <ListItemButton
      selected={selected}
      onClick={onSelect}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        p: 1,
        alignItems: "flex-start",
        alignSelf: "stretch",
        borderRadius: "4px",
        border: "1px solid",
        borderStyle: selected ? "solid" : "dashed",
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
        <Circle
          size={"8px"}
          color={definition.colour}
          fill={definition.colour}
        />
        <Typography>{definition.name}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          alignSelf: "stretch",
        }}
      >
        <Typography color="text.tertiary">{`${(fastStop - fastStart).toFixed(1)} x ${(slowStop - slowStart).toFixed(1)} mm at ${fastStart.toFixed(1)}, ${slowStart.toFixed(1)}`}</Typography>
      </Box>
    </ListItemButton>
  );
}
