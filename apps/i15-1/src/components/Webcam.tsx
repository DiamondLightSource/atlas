import { Webcam, newRelativePosition } from "@diamondlightsource/cs-web-lib";
import { Box } from "@mui/material";
import { useParsedPvConnection, type ParsePvProps } from "@atlas/pvws-config";

type WebcamStreamProps = {
  label: string;
  sourceUrl?: string;
  sourcePv?: string;
  size?: string;
};

export function WebcamStreamFromUrl(props: WebcamStreamProps) {
  const relativePos = newRelativePosition("0", "0", props.size, props.size);

  return (
    <Box sx={{ ml: 5 }}>
      {props.label}
      <Webcam name={props.label} url={props.sourceUrl} position={relativePos} />
    </Box>
  );
}

export function WebcamStreamFromPv(props: WebcamStreamProps) {
  let sourceUrl = "";
  const pvProps: ParsePvProps = {
    label: props.label,
    pv: props.sourcePv ? props.sourcePv : "undefined",
    parseByeArr: true,
  };
  const parsedPv = useParsedPvConnection(pvProps);
  if (parsedPv === "undefined") {
    console.log(`pv source for webcam (${props.sourcePv}) was undefined`);
  } else if (parsedPv === "not connected") {
    console.log(`pv source for webcam (${props.sourcePv}) was not connected`);
  } else {
    sourceUrl = parsedPv;
  }

  return (
    <WebcamStreamFromUrl
      label={props.label}
      sourceUrl={sourceUrl}
      size={props.size}
    />
  );
}
