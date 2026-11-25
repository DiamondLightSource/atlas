import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import {
  AxialSelection,
  ConnectedPlot,
  type EventConfig,
  type SourceConfig,
} from "@diamondlightsource/davidia";

function ARPESViewer() {
  const [uuid] = useState(() => crypto.randomUUID().slice(-8));

  const baseUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/davidia`;

  useEffect(() => {
    console.info("ARPES Viewer mounted", {
      uuid,
      baseUrl,
    });

    return () => {
      console.info("ARPES Viewer unmounted", { uuid });
    };
  }, [uuid, baseUrl]);

  return <ConnectedARPESTab uuid={uuid} baseUrl={baseUrl} />;
}

interface ConnectedTabProps {
  uuid: string;
  baseUrl: string;
}

function ConnectedARPESTab({ uuid, baseUrl }: ConnectedTabProps) {
  const plots = [
    "plot_0",
    "plot_1",
    "dep_plot_1_vertical",
    "dep_plot_1_horizontal",
    "dep_plot_1_intersection",
  ];

  const [srcConfig, setSrcConfig] = useState<SourceConfig>({
    plugin: "NXSImageSourcePlugin",
    path: "demos/i05-1-62874.nxs",
    dataset: "entry1/analyser/data",
    activate: true,
  });

  const profileConfig: EventConfig = {
    plugin: "AxisProfilePlugin",
    vertical_plot_id: plots[2],
    horizontal_plot_id: plots[3],
  };

  const energyIntegrationConfig: EventConfig = {
    plugin: "AxisIntegrationPlugin",
    source_plot_id: plots[0],
    output_plot_id: plots[0],
    integration_axis: 2,
    selection_dimension: 1,
    reduction: "mean",
    transpose: true,
    reverse_output_axis: 0,
    title: "Constant Energy Map",
  };

  const polarIntegrationConfig: EventConfig = {
    plugin: "AxisIntegrationPlugin",
    source_plot_id: plots[0],
    output_plot_id: plots[1],
    integration_axis: 0,
    selection_dimension: 0,
    reduction: "mean",
    transpose: true,
    reverse_output_axis: 0,
    title: "Detector Image",
  };

  const intersectionConfig: EventConfig = {
    plugin: "IntersectionSumPlugin",
    output_plot_id: plots[4],
  };

  function centredSelection(
    values: { data: ArrayLike<number> },
    dimension: number,
    name: string,
    colour: string,
  ) {
    const data = values.data;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];

      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    const range = max - min;
    const length = range * 0.03;
    const start = min + (range - length) / 2;

    const selection = new AxialSelection(
      dimension === 0 ? [start, 0] : [0, start],
      length,
      dimension,
    );

    selection.name = name;
    selection.colour = colour;

    return selection;
  }

  useEffect(() => {
    console.info("[ARPES] Initialising plots", {
      uuid,
      baseUrl,
      plots,
      source: srcConfig,
    });
  }, [uuid, baseUrl]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 0.8fr",
          gap: "8px",
          height: "85vh",
        }}
      >
        {/* Column 1: polar angle x angle heatmap */}
        <div style={{ minWidth: 0, minHeight: 0 }}>
          <ConnectedPlot
            plotId={plots[0]}
            uuid={uuid}
            baseUrl={baseUrl}
            source={srcConfig}
            events={[polarIntegrationConfig]}
            initialSelections={(config) => {
              if (!config.xValues) {
                return [];
              }

              return [
                centredSelection(
                  config.xValues,
                  0,
                  "polar-angle-selection",
                  "#cc79a7",
                ),
              ];
            }}
          />
        </div>

        {/* Column 2: angle x energy heatmap */}
        <div style={{ minWidth: 0, minHeight: 0 }}>
          <ConnectedPlot
            plotId={plots[1]}
            uuid={uuid}
            baseUrl={baseUrl}
            depends_on={plots[0]}
            events={[
              energyIntegrationConfig,
              profileConfig,
              intersectionConfig,
            ]}
            initialSelections={(config) => {
              if (!config.xValues || !config.yValues) {
                return [];
              }

              return [
                centredSelection(
                  config.yValues,
                  1,
                  "energy-selection",
                  "#009e73",
                ),
                centredSelection(
                  config.xValues,
                  0,
                  "angle-selection",
                  "#e69d00",
                ),
              ];
            }}
          />
        </div>

        {/* Column 3: profiles */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr auto",
            gap: "8px",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {/* Energy profile */}
          <div style={{ minWidth: 0, minHeight: 0 }}>
            <ConnectedPlot
              plotId={plots[3]}
              uuid={uuid}
              baseUrl={baseUrl}
              depends_on={plots[1]}
            />
          </div>
          {/* Angle profile */}
          <div style={{ minWidth: 0, minHeight: 0 }}>
            <ConnectedPlot
              plotId={plots[2]}
              uuid={uuid}
              baseUrl={baseUrl}
              depends_on={plots[1]}
            />
          </div>
          {/* Intersection Sum */}
          <div style={{ minWidth: 0, minHeight: 0, border: "1px solid grey" }}>
            <ConnectedPlot
              plotId={plots[4]}
              uuid={uuid}
              baseUrl={baseUrl}
              depends_on={plots[1]}
              customToolbarChildren={null}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          setSrcConfig((previous) => {
            const updated = {
              ...previous,
              activate: !previous.activate,
            };

            console.info("[ARPES] Source activation changed", {
              activate: updated.activate,
            });

            return updated;
          })
        }
      >
        {srcConfig.activate ? "Disable" : "Enable"} source
      </button>

      <ToastContainer closeOnClick draggable />
    </>
  );
}

export { ARPESViewer };
