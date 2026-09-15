import {
  GlyphType,
  LinePlot,
  type Domain,
  type LineData,
} from "@diamondlightsource/davidia";
import { getDomain } from "@h5web/lib";
import { Paper } from "@mui/material";
import ndarray from "ndarray";

const DataChart = ({
  xData,
  yData,
  title,
}: {
  yData?: number[];
  xData?: number[];
  title?: string;
}) => {
  var lineData: LineData[] = [];

  const y = yData ? ndarray(new Float32Array(yData)) : null;

  const x = yData
    ? xData
      ? ndarray(new Float32Array(xData))
      : ndarray(new Float32Array(Array(yData.length).keys()))
    : null;

  const xDomain: Domain = x ? (getDomain(x) ?? [0, 1]) : [0, 1];
  const yDomain: Domain = y ? (getDomain(y) ?? [0, 1]) : [0, 1];

  if (y && x) {
    lineData.push({
      defaultIndices: false,
      key: "trace1",
      lineParams: {
        colour: "blue",
        glyphType: GlyphType.Circle,
        lineOn: true,
        pointSize: 4,
        name: "Trace 1",
      },
      x: x,
      xDomain: xDomain,
      y: y,
      yDomain: yDomain,
    });
  }

  return (
    <Paper
      sx={{
        height: "100%",
        display: "grid",
        flexDirection: "column",
        padding: 1,
      }}
    >
      <LinePlot
        lineData={lineData}
        plotConfig={{
          title: title,
        }}
        xDomain={xDomain}
        yDomain={yDomain}
      />
    </Paper>
  );
};

export default DataChart;
