import { render, screen } from "@atlas/vitest-conf";
import { StatusBar } from "./StatusBar";

describe("StatusBar", () => {
  it("shows open/close button when panel control given", () => {
    render(
      <StatusBar
        panelControl={{
          panelOpen: true,
          setPanelOpen: () => {},
        }}
      />,
    );

    const button = screen.getByRole("button", { name: /open\/close panel/i });
    expect(button).toBeInTheDocument();
  });

  it("does not show open/close button no panel control given", () => {
    render(<StatusBar />);

    const button = screen.queryByRole("button", { name: /open\/close panel/i });
    expect(button).not.toBeInTheDocument();
  });
});
