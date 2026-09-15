import { useQuery } from "@tanstack/react-query";
import ScanBrowser from "./ScanBrowser";
import { getMetadata } from "../../utils/queryfunctions";
import { Box } from "@mui/material";
import type { TiledResponse } from "../../utils/types";

const ScanBrowserWrapper = ({
  scanId,
  setDataName,
}: {
  scanId: string;
  setDataName: (name: string) => void;
}) => {
  const query = useQuery<TiledResponse, Error>({
    queryKey: ["primary", scanId],
    queryFn: () => getMetadata(scanId),
    enabled: !!scanId,
  });

  if (query.isLoading) {
    return <Box>Loading BlueAPI events...</Box>;
  }

  if (query.isError) {
    return <Box>Error: {query.error.message}</Box>;
  }

  if (!query.data) {
    return <Box>No data available</Box>;
  }

  return <ScanBrowser taskData={query.data} setDataName={setDataName} />;
};

export default ScanBrowserWrapper;
