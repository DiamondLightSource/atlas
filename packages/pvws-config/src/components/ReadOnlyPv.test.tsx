import { DefaultPvBox } from "./ReadOnlyPv";
import { render, screen } from "@atlas/vitest-conf";

describe("DefaultPvBox", () => {
  it("box is rendered and visible", () => {
    render(<DefaultPvBox label="val" value="10" />);

    expect(screen.getByText("val", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
