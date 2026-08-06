import {
  dTypeGetDoubleValue,
  dTypeCoerceString,
  useConnection,
  dTypeByteArrToString,
  dTypeGetArrayValue,
} from "@diamondlightsource/cs-web-lib";
import { type RawValue } from "./types";

export function ReadPvRawValue({
  label,
  pv,
}: {
  label: string;
  pv: string;
}): RawValue {
  const [_effectivePvName, connected, _readonly, latestValue] = useConnection(
    label,
    pv,
  );
  const rawValue: RawValue = connected ? latestValue : "not connected";
  return rawValue;
}

export function parseStringPv(value: RawValue): string {
  let displayValue: string;
  if (value != "not connected" && value != undefined) {
    const stringVal = dTypeCoerceString(value);
    displayValue = stringVal ? stringVal.toString() : "undefined";
  } else if (value === "not connected") {
    displayValue = "not connected";
  } else {
    displayValue = "undefined";
  }
  return displayValue;
}

function scaleAndApprox(
  value: number,
  decimals: number,
  scale: number,
): string {
  return (value * scale).toFixed(decimals);
}

export function parseNumericPV(
  value: RawValue,
  decimals?: number,
  scaleFactor?: number,
): string {
  let displayValue: string;
  const decimalsToUse = decimals ? decimals : 2;
  const scaleToUse = scaleFactor ? scaleFactor : 1;
  if (value != "not connected" && value != undefined) {
    const numValue = dTypeGetDoubleValue(value);
    if (!numValue) {
      displayValue = "undefined";
    } else {
      displayValue = scaleAndApprox(numValue, decimalsToUse, scaleToUse);
    }
  } else if (value === "not connected") {
    displayValue = "not connected";
  } else {
    displayValue = "undefined";
  }
  return displayValue;
}

export function parseByteArrPV(value: RawValue): string {
  let displayValue: string;
  if (value != "not connected" && value != undefined) {
    const arrValue = dTypeGetArrayValue(value);
    displayValue = arrValue ? dTypeByteArrToString(arrValue) : "undefined";
  } else if (value == "not connected") {
    displayValue = "not connected";
  } else {
    displayValue = "undefined";
  }
  return displayValue;
}
