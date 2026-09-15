import { getData } from "../../utils/queryfunctions";
import DataChart from "./DataChart";
import { useQuery } from "@tanstack/react-query";

const DataChartWrapper = ({
  scanId,
  dataName,
}: {
  scanId: string;
  dataName: string;
}) => {
  const query = useQuery({
    queryKey: ["array/full", scanId, dataName],
    queryFn: () => getData(scanId, dataName),
  });

  return <DataChart yData={query.data ?? []} title={dataName} />;
};

export default DataChartWrapper;
