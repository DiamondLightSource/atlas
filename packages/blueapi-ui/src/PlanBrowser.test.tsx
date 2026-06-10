import type { Plan } from "@atlas/blueapi";
import { render, screen, userEvent } from "@atlas/vitest-conf";
import { PlanBrowser } from "./PlanBrowser";

const plans: Plan[] = [
  { name: "Plan 1", schema: {}, description: "" },
  { name: "Plan 2", schema: {}, description: "" },
  { name: "Plan 3", schema: {}, description: "" },
];

const renderPlan = (plan: Plan) => (
  <div data-testid="plan-view">{plan.name}</div>
);

function renderBrowser() {
  return render(<PlanBrowser plans={plans} renderPlan={renderPlan} />);
}

describe("PlanBrowser", () => {
  it("shows a placeholder before initial plan selection", () => {
    renderBrowser();

    expect(screen.getByText("Select a plan")).toBeInTheDocument();
    expect(
      screen.getByText("Choose from the list on the left to see details."),
    ).toBeInTheDocument();
  });

  it("does not invoke renderPlan before selection", () => {
    const mockRender = vi.fn();
    render(<PlanBrowser plans={plans} renderPlan={mockRender} />);
    expect(mockRender).not.toBeCalled();
  });

  it("renders plan details when a plan is selected", async () => {
    renderBrowser();

    const selectedPlan = screen.getByRole("button", { name: "Plan 2" });
    const user = userEvent.setup();
    await user.click(selectedPlan);

    // placeholder disappears...
    expect(screen.queryByText("Select a plan")).not.toBeInTheDocument();

    // ...plan details appear
    const planDetails = screen.getByTestId("plan-view");
    expect(planDetails).toBeInTheDocument();
    expect(planDetails).toHaveTextContent("Plan 2");
  });

  it("renders plan details with every selection", async () => {
    renderBrowser();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Plan 3" }));

    const planDetails = screen.getByTestId("plan-view");
    expect(planDetails).toBeInTheDocument();
    expect(planDetails).toHaveTextContent("Plan 3");

    await user.click(screen.getByRole("button", { name: "Plan 1" }));
    expect(planDetails).toHaveTextContent("Plan 1");
  });

  it("persists plan details through search/filtering", async () => {
    renderBrowser();
    const user = userEvent.setup();

    // select plan 1
    await user.click(screen.getByRole("button", { name: "Plan 1" }));

    // plan 1 details appear
    const planDetails = screen.getByTestId("plan-view");
    expect(planDetails).toHaveTextContent("Plan 1");

    // search for a different plan
    const searchbox = screen.getByRole("textbox", { name: /search plans/i });
    await user.type(searchbox, "Plan 3");

    // but user has not selected it, so plan 1 details remain
    expect(planDetails).toHaveTextContent("Plan 1");
  });
});
