import { act, render, screen } from "@atlas/vitest-conf";
import Dashboard from "./Dashboard";
import { UserAuthProvider } from "../context/userAuth/UserAuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

describe("Dashboard", () => {
  it("renders the correct input", async () => {
    act(() =>
      render(
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <UserAuthProvider>
              <Dashboard />
            </UserAuthProvider>
          </QueryClientProvider>
        </MemoryRouter>,
      ),
    );
    expect(screen.getByText("Welcome to P99!")).toBeInTheDocument();

    const loginButton = screen.getByRole("button", {name: "Login"});
    expect(loginButton).toBeInTheDocument();

    const plansButton = screen.getByRole("link", {name: "Plans"});
    expect(plansButton).toBeInTheDocument();
    expect(plansButton).toHaveAttribute("href", "/Acquisition/Plans")

    const workflowsButton = screen.getByRole("link", {name: "Workflows"});
    expect(workflowsButton).toBeInTheDocument();
    expect(workflowsButton).toHaveAttribute("href", "/Workflows/Workflows")
  });
});
