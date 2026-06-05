import type { WorkerState } from "@atlas/blueapi";

export const getStatusColor = (state: WorkerState) => {
  switch (state) {
    case "RUNNING":
      return { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" };
    case "IDLE":
      return { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" };
    case "PAUSED":
      return { bg: "#fff3e0", text: "#ef6c00", border: "#ffcc80" };
    case "PANICKED":
    case "ABORTING":
      return { bg: "#ffebee", text: "#c62828", border: "#ef9a9a" };
    default:
      return { bg: "#f5f5f5", text: "#616161", border: "#e0e0e0" };
  }
};
