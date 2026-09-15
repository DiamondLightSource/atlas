import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import type { TiledSearchData } from "../../utils/types";
import { getStatusIcon } from "../common/getStatusIcon";

const ScanList = ({
  data,
  setId,
}: {
  data: TiledSearchData[];
  setId: (id: string) => void;
}) => (
  <Stack
    direction="column"
    spacing={1}
    overflow="auto"
    sx={{ width: "100%", height: "100%" }}
  >
    {data.map((scan) => {
      // if (scan.attributes.metadata.start.scan_file)
      const date = new Date(scan.attributes.metadata.start.time * 1000);
      return (
        <Card key={scan.id} sx={{ width: "100%", overflow: "visible" }}>
          <CardActionArea onClick={() => setId(scan.id)}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                {getStatusIcon("complete")}
                <Typography>
                  {scan.attributes.metadata.start.scan_file}
                </Typography>
              </Stack>
              <Typography>
                Plan: {scan.attributes.metadata.start.plan_name}
              </Typography>
              <Typography>
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      );
    })}
  </Stack>
);

export default ScanList;
