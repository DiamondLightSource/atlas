import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";

type Props = {
  exposure: number;
  setExposure: (exposure: number) => void;
};

export function Detector({ exposure, setExposure }: Props) {
  return (
    <Box p={1}>
      <NumberInput
        label="Detector exposure (s)"
        defaultValue={exposure}
        onCommit={setExposure}
        helperText={false}
      />
    </Box>
  );
}
