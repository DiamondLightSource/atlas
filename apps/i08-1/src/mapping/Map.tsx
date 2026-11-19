import {
  ImagePlot,
  type SelectionBase,
  type SelectionHandler,
} from "@diamondlightsource/davidia";

import ndarray from "ndarray";

type Props = {
  selections: SelectionBase[];
  selectionHandler: SelectionHandler;
};
export function Map({ selections, selectionHandler }: Props) {
  const values = ndarray(new Float32Array([0, 0, 0]), [1, 1, 3]);
  const initialAxis = ndarray(new Float32Array([0, 100]));

  return (
    <ImagePlot
      selections={selections}
      updateSelection={selectionHandler}
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
