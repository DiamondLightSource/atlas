import {
  InteractionModeType,
  SelectionType,
  usePlotCustomizationContext,
} from "@diamondlightsource/davidia";
import { useEffect } from "react";

/**
 * Lets a rectangle be drawn on the plot it is rendered in (as the plot's
 * toolbar children) while `active`, and otherwise pans and zooms as usual,
 * clearing the drawn rectangle. It draws nothing itself.
 */
function RegionSelectMode({ active }: { active: boolean }) {
  const { setMode, setSelectionType, setSelections } =
    usePlotCustomizationContext();

  useEffect(() => {
    if (active) {
      setSelectionType(SelectionType.rectangle);
      setMode(InteractionModeType.selectRegion);
    } else {
      setMode(InteractionModeType.panAndWheelZoom);
      setSelections([]);
    }
    // the setters change identity with the plot's state; only `active` matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return null;
}

export default RegionSelectMode;
