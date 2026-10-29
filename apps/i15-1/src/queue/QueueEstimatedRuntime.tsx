import { Typography, type TypographyProps } from "@mui/material";
import { useToggleQueueState } from "./queueService";

export function formatDuration(runtime: number): string {
  const hours = Math.floor(runtime / 3600);
  const minutes = Math.floor((runtime % 3600) / 60);
  const seconds = Math.floor(runtime % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

interface QueueEstimatedRuntimeProps extends TypographyProps {
  label?: string;
}

export function QueueEstimatedRuntime({
  label = "Estimated Runtime:",
  ...typographyProps
}: QueueEstimatedRuntimeProps) {
  const { queueState } = useToggleQueueState();
  const runtime = queueState?.estimated_runtime;

  const formatted =
    runtime == null || !Number.isFinite(runtime) || runtime < 0
      ? "Unknown"
      : formatDuration(runtime);

  return (
    <Typography
      variant="h6"
      sx={{
        fontWeight: 500,
        fontSize: 17,
      }}
      {...typographyProps}
    >
      {label} {formatted}
    </Typography>
  );
}
