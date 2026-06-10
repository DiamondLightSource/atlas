import { useState } from "react";
import { Box, Container, Alert, Grid2 } from "@mui/material";
import {
  usePlans,
  useDevices,
  useGetWorkerState,
  useActiveTask,
} from "@atlas/blueapi-query";
import type { Plan } from "@atlas/blueapi";

import { WorkerStatusBar } from "../components/WorkerStatusBar";
import { DevicePanel } from "../components/DevicePanel";
import { PlanCard } from "../components/PlanCard";

interface FeedbackState {
  type: "success" | "error";
  msg: string;
}

function Dashboard() {
  const { data: plansData, isError } = usePlans();
  const { data: devicesData } = useDevices();
  const {
    data: workerState,
    isFetching: isWorkerFetching,
    refetch: refetchWorkerState,
  } = useGetWorkerState();
  const { data: activeTask } = useActiveTask();
  const activeTaskId = activeTask?.task_id ?? null;

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [instrumentSession, setInstrumentSession] = useState("p99-session-01");

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
      {/* Sticky Global Status Header */}
      <WorkerStatusBar
        workerState={workerState ?? "UNKNOWN"}
        activeTaskId={activeTaskId}
        isFetching={isWorkerFetching}
        onSync={refetchWorkerState}
        instrumentSession={instrumentSession}
        onInstrumentSessionChange={setInstrumentSession}
      />

      {/* Sticky Global Feedback Alert Wrapper */}
      {feedback && (
        <Box
          sx={{
            position: "sticky",
            top: "74px",
            zIndex: 1050,
            px: 3,
            pt: 1.5,
            bgcolor: "background.default",
          }}
        >
          <Alert
            severity={feedback.type}
            onClose={() => setFeedback(null)}
            elevation={3}
          >
            {feedback.msg}
          </Alert>
        </Box>
      )}

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Unauthorized or Service Unreachable. Check proxy configs or Keycloak
            authentication.
          </Alert>
        )}

        <Grid2 container spacing={3} alignItems="flex-start">
          {/* LEFT COLUMN: Scrollable Plans Library */}
          <Grid2 size={{ xs: 12, md: 8, lg: 9 }}>
            <Grid2 container spacing={3}>
              {(plansData?.plans || []).map((plan: Plan) => (
                <Grid2
                  size={{ xs: 12, lg: 6 }}
                  key={plan.name || "unknown-plan"}
                >
                  <PlanCard
                    plan={plan}
                    instrumentSession={instrumentSession}
                    onSuccess={(msg: string) =>
                      setFeedback({ type: "success", msg })
                    }
                    onError={(msg: string) =>
                      setFeedback({ type: "error", msg })
                    }
                  />
                </Grid2>
              ))}
            </Grid2>
          </Grid2>

          {/* RIGHT COLUMN: Persistent Device Panel */}
          <Grid2
            size={{ xs: 12, md: 4, lg: 3 }}
            sx={{
              position: "sticky",
              top: feedback ? "150px" : "90px",
              zIndex: 1000,
              transition: "top 0.2s ease-in-out",
            }}
          >
            <DevicePanel devices={devicesData?.devices || []} />
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}

export default Dashboard;
