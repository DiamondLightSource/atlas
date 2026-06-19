import { useConnection, type DType } from "@diamondlightsource/cs-web-lib";
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

export function parseStringPv(value: RawValue | string | number): string {
  let displayValue: string;
  if (value != "not connected" && value != undefined) {
    if (typeof value === "string" || typeof value === "number") {
      displayValue = value.toString();
    } else {
      const stringVal = (value as DType).value.stringValue
        ? (value as DType).value.stringValue
        : value;
      displayValue = stringVal ? stringVal.toString() : "undefined";
    }
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
  value: RawValue | string | number,
  decimals?: number,
  scaleFactor?: number,
): string {
  let displayValue: string;
  const decimalsToUse = decimals ? decimals : 2;
  const scaleToUse = scaleFactor ? scaleFactor : 1;
  if (value != "not connected" && value != undefined) {
    if (typeof value === "number") {
      displayValue = scaleAndApprox(Number(value), decimalsToUse, scaleToUse);
    } else if (typeof value === "string") {
      displayValue =
        value === "undefined"
          ? "undefined"
          : scaleAndApprox(parseFloat(value), decimalsToUse, scaleToUse);
    } else {
      const numValue = (value as DType).value.doubleValue;
      if (!numValue) {
        displayValue = "undefined";
      } else {
        displayValue = scaleAndApprox(numValue, decimalsToUse, scaleToUse);
      }
    }
  } else if (value === "not connected") {
    displayValue = "not connected";
  } else {
    displayValue = "undefined";
  }
  return displayValue;
}
