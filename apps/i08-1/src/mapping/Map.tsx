import { ImagePlot } from "@diamondlightsource/davidia";

import ndarray from "ndarray";

export function Map() {
  const values = ndarray(new Float32Array([0, 0, 0]), [1, 1, 3]);
  const initialAxis = ndarray(new Float32Array([0, 100]));
  return (
    <ImagePlot
      plotConfig={{
        xValues: initialAxis,
        yValues: initialAxis,
      }}
      values={values}
      aspect={"auto"}
      customToolbarChildren={null}
    />
  );
}
