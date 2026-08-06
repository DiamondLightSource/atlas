import type { Visit } from "@diamondlightsource/sci-react-ui";
import { visitTextToVisit } from "./common";

describe("visitTextToVisit", () => {
  it("returns Visit for correct input", () => {
    expect(visitTextToVisit("ab12345-1")).toEqual({
      proposalCode: "ab",
      proposalNumber: 12345,
      number: 1,
    } as Visit);
  });

  it("returns null for incorrect input", () => {
    expect(visitTextToVisit("a12345-2")).toEqual(null);
  });
});
