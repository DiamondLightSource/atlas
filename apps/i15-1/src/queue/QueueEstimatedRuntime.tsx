import { Typography, type TypographyProps } from "@mui/material";
import { useGetQueueState } from "./queueService";
import { useState } from "react";
import { isToday, format } from "date-fns";
import { formatRuntime } from "./formatRuntime";

interface QueueEstimatedRuntimeProps extends TypographyProps {
  runtimeLabel?: string;
  finishTimeLabel?: string;
}

export function QueueEstimatedRuntime({
  runtimeLabel = "Estimated Runtime:",
  finishTimeLabel = "Estimated Finish Time:",
  ...typographyProps
}: QueueEstimatedRuntimeProps) {
  const { data } = useGetQueueState();
  const runtime = data?.estimated_runtime;
  const [showFinishTime, setShowFinishTime] = useState(false);

  const isValidRuntime =
    typeof runtime === "number" && Number.isFinite(runtime) && runtime >= 0;

  const finishTime = isValidRuntime
    ? new Date(Date.now() + runtime * 1000)
    : null;

  const formattedFinishTime = finishTime
    ? isToday(finishTime)
      ? format(finishTime, "HH:mm:ss")
      : format(finishTime, "d MMM, HH:mm")
    : null;

  const display =
    runtime == null || !Number.isFinite(runtime) || runtime < 0
      ? "Unknown"
      : showFinishTime
        ? formattedFinishTime
        : formatRuntime(runtime);

  return (
    <Typography
      variant="h6"
      sx={{
        fontWeight: 500,
        fontSize: 17,
      }}
      onClick={() => setShowFinishTime((v) => !v)}
      {...typographyProps}
    >
      {showFinishTime ? finishTimeLabel : runtimeLabel} {display}
    </Typography>
  );
}
