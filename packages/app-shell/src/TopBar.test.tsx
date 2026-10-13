import { render, screen, userEvent } from "@atlas/vitest-conf";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import { TopBar } from "./TopBar";
import { AuthContextProvider, type AuthProvider } from "@atlas/auth";
import { testAuthProvider } from "./TestUtils";

vi.mock("@diamondlightsource/sci-react-ui", async () => {
  const actual = await vi.importActual<any>("@diamondlightsource/sci-react-ui");

  return {
    ...actual,
    ColourSchemeButton: () => <button aria-label="Colour scheme switcher" />,
  };
});

// mock instrument session view which is out of scope of this test
export function InstrumentSessionView() {
  return <button>cm12345-1</button>;
}
vi.mock("./context/instrumentSession/InstrumentSessionView", () => ({
  InstrumentSessionView: InstrumentSessionView,
}));

function renderTopBar(barProps: {
  title: string;
  open: boolean;
  setOpen: () => void;
}) {
  return render(
    <ThemeProvider theme={DiamondDSTheme} defaultMode="light">
      <AuthContextProvider provider={testAuthProvider}>
        <TopBar {...barProps} />
      </AuthContextProvider>
    </ThemeProvider>,
  );
}

describe("TopBar", () => {
  const barProps = {
    title: "Test application",
    open: true,
    setOpen: vi.fn(),
  };

  it("Shows menu icon", async () => {
    renderTopBar(barProps);
    expect(
      await screen.findByRole("button", { name: /menu/i }),
    ).toBeInTheDocument();
  });

  it("Menu button calls setOpen function when clicked", async () => {
    renderTopBar(barProps);
    const menu = await screen.findByRole("button", { name: /menu/i });

    const user = userEvent.setup();
    await user.click(menu);

    expect(barProps.setOpen).toHaveBeenCalledWith(!barProps.open);
  });

  it("Shows title", async () => {
    renderTopBar(barProps);
    expect(await screen.findByText(barProps.title)).toBeVisible();
  });

  it("Shows a user / login button", async () => {
    renderTopBar(barProps);
    expect(
      await screen.findByRole("button", { name: /User Avatar/i }),
    ).toBeVisible();
  });

  it("Includes colour scheme switcher", async () => {
    renderTopBar(barProps);
    expect(
      await screen.findByRole("button", { name: /Colour scheme switcher/i }),
    ).toBeVisible();
  });
});
