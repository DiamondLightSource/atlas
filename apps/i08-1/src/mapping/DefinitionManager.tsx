import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import type { MappingScan } from "./types";
import {
  DefinitionManagerContext,
  type DefinitionManager,
  type MappingDefinition,
} from "./definitions";

const colours = [
  "#7c5ee0",
  "#ed604f",
  "#3d3027",
  "#9283b0",
  "#464892",
  "#316f5e",
  "#b67886",
  "#a25500",
  "#318ff8",
  "#786941",
  "#589704",
  "#9c5894",
];

const defaultScan: MappingScan = {
  region: { fastStart: 0, fastStop: 0.005, slowStart: 0, slowStop: 0.005 },
  path: { xPoints: 10, yPoints: 10 },
  exposure: 0.1,
};

export function DefinitionManagerProvider({ children }: PropsWithChildren) {
  const [definitions, setDefinitions] = useState<MappingDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [count, setCount] = useState<number>(0);

  const add = useCallback(() => {
    const definition: MappingDefinition = {
      id: crypto.randomUUID(),
      name: `ROI ${count}`,
      colour: colours[count % colours.length],
      scan: structuredClone(defaultScan),
    };
    setDefinitions(prev => [...prev, definition]);
    setSelectedId(definition.id);
    setCount(prev => prev + 1);
  }, [count]);

  const updateScan = useCallback(
    (id: string, update: (scan: MappingScan) => MappingScan) =>
      setDefinitions(prev =>
        prev.map(def =>
          def.id === id ? { ...def, scan: update(def.scan) } : def,
        ),
      ),
    [],
  );

  const value = useMemo<DefinitionManager>(
    () => ({
      definitions,
      selected: definitions.find(def => def.id === selectedId),
      select: setSelectedId,
      add,
      updateScan,
    }),
    [definitions, selectedId, add, updateScan],
  );

  return (
    <DefinitionManagerContext.Provider value={value}>
      {children}
    </DefinitionManagerContext.Provider>
  );
}
