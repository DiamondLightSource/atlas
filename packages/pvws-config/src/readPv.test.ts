import { parseNumericPV, parseStringPv } from "./readPv";
import { type DType } from "@diamondlightsource/cs-web-lib";

describe("Test Pv utils", () => {
  it("parse numerical value returns string with correct decimals", () => {
    expect(parseNumericPV(3.1415926)).toEqual("3.14");
    expect(parseNumericPV("1.2", 1, 10)).toEqual("12.0");
    expect(parseNumericPV("not connected")).toEqual("not connected");
    expect(parseNumericPV("undefined")).toEqual("undefined");

    const newDType = "302.345678" as unknown as DType;
    expect(parseNumericPV(newDType)).toEqual("302.35");
  });

  it("parse string value", () => {
    expect(parseStringPv("not connected")).toEqual("not connected");
    expect(parseStringPv(undefined)).toEqual("undefined");

    const newDType = "Open" as unknown as DType;
    expect(parseStringPv(newDType)).toEqual("Open");
    expect(parseStringPv(10)).toEqual("10");
    expect(parseStringPv("Close")).toEqual("Close");
  });
});
