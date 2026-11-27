import { render, screen, userEvent } from "@atlas/vitest-conf";
import { GlobalPanel } from "./GlobalPanel";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";

describe("GlobalPanel", () => {
  const children = [
    { label: "Console", content: <div>This is a console</div> },
    { label: "Live controls", content: <div>These are live controls</div> },
  ];
  const close = vi.fn();
  const renderPanel = () => {
    return render(
      <ThemeProvider theme={DiamondDSTheme}>
        <GlobalPanel children={children} close={close} />
      </ThemeProvider>,
    );
  };
  it("renders a tab for each child", () => {
    renderPanel();
    children.forEach((child) => {
      const tab = screen.getByRole("tab", { name: child.label });
      expect(tab).toBeVisible();
    });
  });
  it("shows child content on tabpanel when clicking on corresponding tab", async () => {
    renderPanel();
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Live controls" }));
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("These are live controls");
  });
  it("renders a button that invokes close function", async () => {
    renderPanel();

    const closeButton = screen.getByRole("button", { name: /close panel/i });
    expect(closeButton).toBeVisible();
    const user = userEvent.setup();
    await user.click(closeButton);
    expect(close).toHaveBeenCalledOnce();
  });
});
