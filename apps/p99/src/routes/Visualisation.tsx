import { Container, Stack } from "@mui/material";
import { useState } from "react";
import DataChartWrapper from "../components/visualisation/DataChartWrapper";
import ScanListWrapper from "../components/visualisation/ScanListWrapper";
import ScanBrowserWrapper from "../components/visualisation/ScanBrowserWrapper";

const Visualisation = () => {
  const [page, setPage] = useState<number>(1);
  const [scanId, setScanId] = useState<string>("");
  const [dataName, setDataName] = useState<string>("");

  return (
    <Container maxWidth={false} sx={{ maxHeight: "100vh", mt: 0, mb: 0 }}>
      <Stack direction="row" spacing={1}>
        <div style={{ width: "400px", height: "85vh" }}>
          <ScanListWrapper
            page={page}
            setPage={setPage}
            setScanId={setScanId}
          />
        </div>
        <div style={{ width: "600px", height: "85vh" }}>
          <ScanBrowserWrapper scanId={scanId} setDataName={setDataName} />
        </div>
        <div style={{ width: "100%", height: "85vh" }}>
          <DataChartWrapper scanId={scanId} dataName={dataName} />
        </div>
      </Stack>
    </Container>
  );
};

export default Visualisation;
