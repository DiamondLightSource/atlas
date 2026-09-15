import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import type { TiledResponse } from "../../utils/types";

const ScanBrowser = ({
  taskData,
  setDataName,
}: {
  taskData?: TiledResponse;
  setDataName: (name: string) => void;
}) => {
  const data = taskData?.data;
  if (!data) return <div>Loading...</div>;
  if (!data.attributes) return <div>No attributes</div>;
  if (!data.attributes.metadata) return <div>No attributes</div>;

  const metadata = data.attributes.metadata;

  return (
    <Card>
      <CardContent>
        <Typography>
          Scan ID: {taskData.data.attributes.ancestors[0]}
        </Typography>
        {Object.entries(metadata.data_keys || {}).map(([key, dk]) => (
          <Card key={key} sx={{ mt: 1 }}>
            <CardActionArea onClick={() => setDataName(key)}>
              <CardContent>
                <Typography>
                  <b>{key}</b>
                </Typography>
                <Typography>Source: {dk.source}</Typography>
                {dk.units && <Typography>Units: {dk.units}</Typography>}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScanBrowser;
