import { render, screen } from "@atlas/vitest-conf";
import { MemoryRouter } from "react-router-dom";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";
import P99Navbar from "./P99Navbar";

describe("P99Navbar", () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  const renderComponent = async () => {
    const queryClient = new QueryClient();
    render(
      <ThemeProvider theme={DiamondDSTheme} defaultMode="light">
        <MemoryRouter>
          <P99Navbar />
        </MemoryRouter>
      </ThemeProvider>,
    );
  };

  it("renders the Navbar with all of the nav buttons", async () => {
    await renderComponent();

    expect(screen.getByText("Home", { selector: "nav a" })).toBeInTheDocument();
    expect(
      screen.getByText("Plans", { selector: "nav a" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Workflows", { selector: "nav a" }),
    ).toBeInTheDocument();
  });

  it("displays the logged in user", async () => {
    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText("abc123456")).toBeVisible();
    });
  });
});
