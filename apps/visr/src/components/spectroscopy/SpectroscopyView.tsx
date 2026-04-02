import { Box } from "@mui/material";
import ProcessedSpectroscopyData from "./ProcessedSpectroscopyData";
import RawSpectroscopyData from "./RawSpectroscopyData";
import { SpectroscopyForm } from "./SpectroscopyForm";
import { useEffect, useMemo, useState } from "react";
import { useScanEvents, type ScanEventMessage } from "../../hooks/scanEvents";
import { useSubmitWorkflow } from "../../hooks/useSubmitWorkflow";
import { useInstrumentSession } from "../../context/instrumentSession/useInstrumentSession";
import { visitTextToVisit } from "../../utils/common";
import { useWorkflowArtifacts } from "../../hooks/useWorkflowArtifacts";
import type { VisitInput } from "../workflows/__generated__/TemplateViewMutation.graphql";

export type SpectroscopyFormData = {
  total_number_of_scan_points: number;
  grid_size: number;
  grid_origin_x: number;
  grid_origin_y: number;
  exposure_time: number;
};

// function SpectroscopyView() {
//   // set off workflow when scan ends
//   const scanEvent = useScanEvents();
//   const { instrumentSession } = useInstrumentSession();

//   const submitWorkflow = useSubmitWorkflow("visr-reconstruction");

//   useEffect(() => {
//     if (!scanEvent || !instrumentSession) return;
//     if (scanEvent.status == "finished") {
//       const visit = visitTextToVisit(instrumentSession);
//       if (!visit) {
//         console.warn("Invalid visit; cannot submit workflow");
//         return;
//       }
//       submitWorkflow(visit, {
//         "input-file-path": scanEvent.filepath,
//       });
//     }
//   });

//   return (
//     <Box
//       sx={{
//         margin: 2,
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <RawSpectroscopyData />
//       <SpectroscopyForm />
//     </Box>
//   );
// }
function SpectroscopyView() {
  // set off workflow when scan ends
  const scanEvent = useScanEvents();
  const { instrumentSession } = useInstrumentSession();
  const visit = useMemo(() => {
    return visitTextToVisit(instrumentSession);
  }, [instrumentSession]);
  const [workflowName, setWorkflowName] = useState<string>("");
  const submitWorkflow = useSubmitWorkflow("visr-reconstruction");
  const [hasSubmittedWorkflow, setHasSubmittedWorkflow] =
    useState<boolean>(false);
  const workflowArtifacts = useWorkflowArtifacts(visit, workflowName);

  useEffect(() => {
    if (!scanEvent || !instrumentSession) return;
    if (scanEvent.status == "running") {
      setHasSubmittedWorkflow(false);
    } else if (scanEvent.status == "finished" && !hasSubmittedWorkflow) {
      if (!visit) {
        console.warn("Invalid visit; cannot submit workflow");
        return;
      }
      async function doSubmitWorkflow(
        visit: VisitInput,
        scanEvent: ScanEventMessage,
      ) {
        const submittedWorkflow = await submitWorkflow(visit, {
          "input-file-path": scanEvent.filepath,
        });
        setWorkflowName(submittedWorkflow.name);
      }
      doSubmitWorkflow(visit, scanEvent);
      setHasSubmittedWorkflow(true);
      return;
    }
  }, [
    scanEvent,
    instrumentSession,
    submitWorkflow,
    visit,
    hasSubmittedWorkflow,
  ]);

  return (
    <Box
      sx={{
        margin: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <RawSpectroscopyData />
      <SpectroscopyForm />
      <ProcessedSpectroscopyData workflowArtifacts={workflowArtifacts} />
    </Box>
  );
}

export default SpectroscopyView;
