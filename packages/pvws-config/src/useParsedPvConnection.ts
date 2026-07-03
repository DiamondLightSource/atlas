import {
  parseNumericPV,
  parseByteArrPV,
  parseStringPv,
  ReadPvRawValue,
} from "./readPv";
import type { ParsePvProps } from "./types";

export function useParsedPvConnection(props: ParsePvProps): string {
  const rawValue = ReadPvRawValue({ label: props.label, pv: props.pv });
  const numericPv = props.parseNumeric ? props.parseNumeric : false;
  const byeArrPv = props.parseByeArr ? props.parseByeArr : false;
  let returnValue;
  if (rawValue === "not connected") {
    returnValue = "not connected";
  } else if (!rawValue) {
    console.error("Parsed value was undefined");
    returnValue = "undefined";
  } else {
    if (numericPv) {
      returnValue = parseNumericPV(rawValue, props.decimals, props.scaleFactor);
    } else if (byeArrPv) {
      returnValue = parseByteArrPV(rawValue);
    } else {
      returnValue = parseStringPv(rawValue);
    }
  }

  // If it's a Dtype cast to string
  if (typeof returnValue !== "string" || typeof returnValue !== "number") {
    returnValue = returnValue.toString();
  }

  console.log(
    `fetched parsed value ${returnValue} for PV: ${props.pv} labeled ${props.label}`,
  );
  return returnValue;
}
