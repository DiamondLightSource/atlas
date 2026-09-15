import { Pagination, Stack } from "@mui/material";
import ScanList from "./ScanList";
import { useQuery } from "@tanstack/react-query";
import { getScans } from "../../utils/queryfunctions";
import { useInstrumentSession } from "@atlas/app-shell";

const ScanListWrapper = ({
  page,
  setPage,
  setScanId,
}: {
  page: number;
  setPage: (page: number) => void;
  setScanId: (id: string) => void;
}) => {
  const { instrumentSession } = useInstrumentSession();
  const query = useQuery({
    queryKey: ["search", instrumentSession, "-start.time", page],
    queryFn: () => getScans(instrumentSession, page - 1, 10, "-start.time"),
  });

  if (!query.data) {
    return <div>No Data</div>;
  }

  return (
    <Stack
      spacing={1}
      sx={{ width: "100%", height: "100%", alignItems: "center" }}
    >
      <ScanList data={query.data.data} setId={setScanId} />
      <Pagination
        count={Math.ceil(query.data.meta.count / 10)}
        size="small"
        onChange={(_, page) => setPage(page)}
        page={page}
        sx={{ width: "100%" }}
        siblingCount={0}
      />
    </Stack>
  );
};

export default ScanListWrapper;
