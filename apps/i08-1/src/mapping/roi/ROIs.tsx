import { Button, List, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { RoiItem } from "./ROIEditor";
import { useDefinitionManager } from "../definitions";

export function ROIs() {
  const { definitions, selected, select, add } = useDefinitionManager();
  return (
    <>
      <Typography variant="h6">Regions</Typography>
      <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {definitions.map(definition => (
          <RoiItem
            key={definition.id}
            definition={definition}
            selected={definition.id === selected?.id}
            onSelect={() => select(definition.id)}
          />
        ))}
      </List>
      <Button variant="outlined" startIcon={<Plus />} onClick={add}>
        Add ROI
      </Button>
    </>
  );
}
