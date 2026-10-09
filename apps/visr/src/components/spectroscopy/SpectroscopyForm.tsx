import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import { RunPlanButton } from "@atlas/blueapi-ui";
import AbortButton from "../AbortButton";
import { useState } from "react";
import { NumberInput } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";

export type SpectroscopyFormData = {
  total_number_of_scan_points: number;
  grid_size: number;
  grid_origin_x: number;
  grid_origin_y: number;
  exposure_time: number;
};

export function SpectroscopyForm() {
  const { instrumentSession } = useInstrumentSession();
  const [formData, setFormData] = useState<SpectroscopyFormData>({
    total_number_of_scan_points: 25,
    grid_size: 5.0,
    grid_origin_x: 0.0,
    grid_origin_y: 0.0,
    exposure_time: 0.1,
  });
  const minValue = -14.5;
  const maxValue = 14.5;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Line one */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            alignItems: "start",
          }}
        >
          <NumberInput
            label="Grid Origin x"
            numberMode="scientific"
            defaultValue={formData["grid_origin_x"]}
            onCommit={parsedValue =>
              setFormData(prev => ({ ...prev, grid_origin_x: parsedValue }))
            }
            minValue={minValue}
            maxValue={maxValue}
          />
          <NumberInput
            label="Grid Origin y"
            numberMode="scientific"
            defaultValue={formData["grid_origin_y"]}
            onCommit={parsedValue =>
              setFormData(prev => ({ ...prev, grid_origin_y: parsedValue }))
            }
            minValue={minValue}
            maxValue={maxValue}
          />
        </Box>

        <NumberInput
          label="Grid Size"
          numberMode="scientific"
          defaultValue={formData["grid_size"]}
          onCommit={parsedValue =>
            setFormData(prev => ({ ...prev, grid_size: parsedValue }))
          }
          minValue={0.1}
          maxValue={15}
        />

        {/* Line two */}
        <NumberInput
          label="Number of Points"
          numberMode="natural"
          defaultValue={formData["total_number_of_scan_points"]}
          onCommit={parsedValue =>
            setFormData(prev => ({
              ...prev,
              total_number_of_scan_points: parsedValue,
            }))
          }
          minValue={1}
        />
        <NumberInput
          label="Exposure Time"
          numberMode="scientific"
          defaultValue={formData["exposure_time"]}
          onCommit={parsedValue =>
            setFormData(prev => ({ ...prev, exposure_time: parsedValue }))
          }
          minValue={0.1}
        />
      </Box>

      {/* Line three */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          pt: 3,
          borderTop: 1,
          borderColor: "divider",
          "& .MuiButton-root": {
            width: "100%",
            height: 40,
            whiteSpace: "nowrap",
          },
        }}
      >
        <RunPlanButton
          name="demo_spectroscopy"
          params={{ ...formData, fly: false }}
          instrumentSession={instrumentSession}
          buttonText="Step Scan"
        />
        <RunPlanButton
          name="demo_spectroscopy"
          params={{ ...formData, fly: true }}
          instrumentSession={instrumentSession}
          buttonText="Fly Scan"
        />
      </Box>

      {/* Line four */}
      <Box sx={{ "& .MuiButton-root": { width: "100%", height: 40 } }}>
        <AbortButton />
      </Box>
    </Box>
  );
}
