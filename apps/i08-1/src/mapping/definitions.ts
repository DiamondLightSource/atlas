import { RectangularSelection } from "@diamondlightsource/davidia";
import { createContext, useContext } from "react";
import type { MappingScan, PandaScanParameters } from "./types";

export type MappingDefinition = {
  id: string;
  name: string;
  colour: string;
  scan: MappingScan;
};

export type DefinitionManager = {
  definitions: MappingDefinition[];
  selected: MappingDefinition | undefined;
  select: (id: string) => void;
  add: () => void;
  updateScan: (id: string, update: (scan: MappingScan) => MappingScan) => void;
};

export const DefinitionManagerContext = createContext<DefinitionManager | null>(
  null,
);

export function useDefinitionManager(): DefinitionManager {
  const manager = useContext(DefinitionManagerContext);
  if (!manager) {
    throw new Error(
      "useDefinitionManager must be used within a DefinitionManagerProvider",
    );
  }
  return manager;
}

/** Shape of a definition as plotted by davidia, sharing the definition's id */
export function toSelection(
  definition: MappingDefinition,
  isSelected: boolean,
): RectangularSelection {
  const { fastStart, fastStop, slowStart, slowStop } = definition.scan.region;
  const selection = new RectangularSelection(
    [fastStart, slowStart],
    [fastStop - fastStart, slowStop - slowStart],
  );
  selection.id = definition.id;
  selection.name = definition.name;
  selection.colour = definition.colour;
  selection.asDashed = !isSelected;
  return selection;
}

/** Region covered by a rectangle drawn/dragged on the plot */
export function regionFromSelection(
  selection: RectangularSelection,
): MappingScan["region"] {
  const [x, y] = selection.start;
  const [width, height] = selection.lengths;
  return {
    fastStart: Math.min(x, x + width),
    fastStop: Math.max(x, x + width),
    slowStart: Math.min(y, y + height),
    slowStop: Math.max(y, y + height),
  };
}

export function toPandaScanParameters(scan: MappingScan): PandaScanParameters {
  return {
    start: scan.region.fastStart,
    stop: scan.region.fastStop,
    start_slow: scan.region.slowStart,
    stop_slow: scan.region.slowStop,
    // TODO: panda_scan currently uses a single `num` for both axes, so yPoints
    // is ignored until the plan takes separate fast/slow point counts
    num: scan.path.xPoints,
    duration: scan.exposure,
  };
}
