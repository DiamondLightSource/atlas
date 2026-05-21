import { ImagePlot } from "@diamondlightsource/davidia";
import Box from "@mui/material/Box";
import { useSpectroscopyData } from "./useSpectroscopyData";

function RawSpectroscopyData() {
  const { data } = useSpectroscopyData();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          sm: "1fr",
          md: "1fr 1fr 1fr",
        },
        gap: 3,
        flexGrow: 1,
      }}
    >
      <ImagePlot
        aspect="auto"
        plotConfig={{
          title: "Red channel",
          xValues: data.xValues,
          yValues: data.yValues,
        }}
        customToolbarChildren={null}
        values={data.red}
      />

      <ImagePlot
        aspect="auto"
        plotConfig={{
          title: "Green channel",
          xValues: data.xValues,
          yValues: data.yValues,
        }}
        customToolbarChildren={null}
        values={data.green}
      />

      <ImagePlot
        aspect="auto"
        plotConfig={{
          title: "Blue channel",
          xValues: data.xValues,
          yValues: data.yValues,
        }}
        customToolbarChildren={null}
        values={data.blue}
      />
    </Box>
  );
}

export default RawSpectroscopyData;
