import { useParsedPvConnection } from "@atlas/pvws-config";
import { DataCard } from "@diamondlightsource/sci-react-ui";
import { Box } from "@mui/material";
import { BlueapiWorkerState } from "./BlueapiWorkerState";
import type { ReactNode } from "react";

/** To give cards a common (and maximum) width */
const CardWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box sx={{ display: "flex", flex: 1, maxWidth: "350px" }}>{children}</Box>
  );
};

function usePv(pv: string, decimal: boolean = false) {
  return useParsedPvConnection({
    label: "",
    pv,
    parseNumeric: decimal,
  });
}

function useDecimalPv(pv: string) {
  return usePv(pv, true);
}

/** A row of data cards with ring status, safety, sample and blueapi status */
export function StatusSummary() {
  const ringCurrent = useDecimalPv("ca://SR-DI-DCCT-01:SIGNAL");
  const ringEnergy = useDecimalPv("ca://CS-CS-MSTAT-01:BEAMENERGY");
  const hutchEnabled = usePv("ca://BL15I-PS-IOC-02:M14:LOP");
  const puck = usePv("ca://BL15J-EA-LOC-01:PUCK:INDEX");
  const pin = usePv("ca://BL15J-EA-LOC-01:SAMPLE:INDEX");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
      }}
    >
      <CardWrapper>
        <DataCard
          title="Ring status"
          value1={{ label: "Current", value: ringCurrent, suffix: "mA" }}
          value2={{ label: "Energy", value: ringEnergy, suffix: "GeV" }}
          colour="info"
        />
      </CardWrapper>

      <CardWrapper>
        <DataCard
          title="EH3 safety"
          value={{ label: "Hutch enabled", value: hutchEnabled }}
          colour="success"
        />
      </CardWrapper>

      <CardWrapper>
        <DataCard
          title="Current sample"
          value1={{ label: "Puck", value: puck }}
          value2={{ label: "Pin", value: pin }}
          colour="neutral"
        />
      </CardWrapper>

      <CardWrapper>
        <BlueapiWorkerState />
      </CardWrapper>
    </Box>
  );
}
