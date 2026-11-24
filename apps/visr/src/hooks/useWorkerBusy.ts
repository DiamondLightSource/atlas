import { useGetWorkerState } from "@atlas/blueapi-query";
import { isBusy } from "./useScanStatus";

// Unknown counts as not busy, so the forms stay usable if blueapi is unreachable
export function useWorkerBusy(): boolean {
  const { data, isError } = useGetWorkerState();
  return !isError && isBusy(data);
}
