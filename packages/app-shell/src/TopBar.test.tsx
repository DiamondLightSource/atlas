import { render, screen, userEvent } from "@atlas/vitest-conf";
import { TopBar } from "./TopBar";

vi.mock("@diamondlightsource/sci-react-ui", async () => {
  const actual = await vi.importActual<any>("@diamondlightsource/sci-react-ui");

  return {
    ...actual,
    ColourSchemeButton: () => <button aria-label="Colour scheme switcher" />,
  };
});

describe("TopBar", () => {
  const barProps = {
    title: "Test application",
    open: true,
    setOpen: vi.fn(),
  };

  it("Shows menu icon", () => {
    render(<TopBar {...barProps} />);
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });

  it("Menu button calls setOpen function when clicked", async () => {
    render(<TopBar {...barProps} />);
    const menu = screen.getByRole("button", { name: /menu/i });

    const user = userEvent.setup();
    await user.click(menu);

    expect(barProps.setOpen).toHaveBeenCalledWith(!barProps.open);
  });

  it("Shows title", () => {
    render(<TopBar {...barProps} />);
    expect(screen.getByText(barProps.title)).toBeVisible();
  });

  it("Includes colour scheme switcher", () => {
    render(<TopBar {...barProps} />);
    expect(
      screen.getByRole("button", { name: /Colour scheme switcher/i }),
    ).toBeVisible();
  });
});
