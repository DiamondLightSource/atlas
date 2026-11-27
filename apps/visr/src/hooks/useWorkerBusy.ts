import { useGetWorkerState } from "@atlas/blueapi-query";
import { isBusy } from "./useScanStatus";

/**
 * Whether the worker is busy, for locking the forms. Unknown counts as not, so
 * they stay usable if blueapi is unreachable.
 */
export function useWorkerBusy(): boolean {
  const { data, isError } = useGetWorkerState();
  return !isError && isBusy(data);
}
