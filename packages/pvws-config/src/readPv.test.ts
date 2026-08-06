import { parseNumericPV, parseStringPv, parseByteArrPV } from "./readPv";
import { newDType, type NumberArray } from "@diamondlightsource/cs-web-lib";

describe("Test Pv utils", () => {
  it("parse numerical value returns string with correct decimals", () => {
    expect(parseNumericPV(undefined)).toEqual("undefined");
    expect(parseNumericPV("not connected")).toEqual("not connected");

    let testNumericDType = newDType({ doubleValue: 302.345678 });
    expect(parseNumericPV(testNumericDType)).toEqual("302.35");

    let testRoundedDType = newDType({ doubleValue: 3.1415926 });
    expect(parseNumericPV(testRoundedDType, 4, 1)).toEqual("3.1416");

    let testScaledDType = newDType({ doubleValue: 1.2 });
    expect(parseNumericPV(testScaledDType, 1, 10)).toEqual("12.0");
  });

  it("parse string value", () => {
    expect(parseStringPv(undefined)).toEqual("undefined");
    expect(parseStringPv("not connected")).toEqual("not connected");

    let testOpenDType = newDType({ stringValue: "Open" });
    expect(parseStringPv(testOpenDType)).toEqual("Open");

    let testCoercedStringDType = newDType({ doubleValue: 10 });
    expect(parseStringPv(testCoercedStringDType)).toEqual("10");

    let testCloseDType = newDType({ stringValue: "Close" });
    expect(parseStringPv(testCloseDType)).toEqual("Close");
  });

  it("parses byte array values to a string", () => {
    expect(parseByteArrPV(undefined)).toEqual("undefined");
    expect(parseByteArrPV("not connected")).toEqual("not connected");

    let testArray: NumberArray = new Float64Array([
      84, 101, 115, 116, 65, 114, 114, 97, 121,
    ]);
    let testArrayDType = newDType({ arrayValue: testArray });
    expect(parseByteArrPV(testArrayDType)).toEqual("TestArray");
  });
});
