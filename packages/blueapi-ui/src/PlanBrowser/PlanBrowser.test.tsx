import type { Plan, PlansResponse } from "@atlas/blueapi";
import { render, screen, userEvent } from "@atlas/vitest-conf";
import { PlanBrowser } from "./PlanBrowser";
import { usePlans } from "@atlas/blueapi-query";
import { PlanParameters } from "./PlanParameters";
import { useMediaQuery } from "@mui/material";

// mock usePlans hook
vi.mock("@atlas/blueapi-query");
const usePlansMock = vi.mocked(usePlans);
const plansResponse: PlansResponse = {
  plans: [
    { name: "Plan 1", schema: {}, description: "" },
    { name: "Plan 2", schema: {}, description: "" },
    { name: "Plan 3", schema: {}, description: "" },
  ],
};
usePlansMock.mockReturnValue({ data: plansResponse } as any);

// mock JSONForms
const renderPlan = ({ plan }: { plan: Plan }) => (
  <div data-testid="plan-view">{plan.name}</div>
);

vi.mock("./PlanParameters");
const paramsComponentMock = vi.mocked(PlanParameters);
paramsComponentMock.mockImplementation(renderPlan);

// render component under test
function renderBrowser() {
  return render(<PlanBrowser />);
}

vi.mock("@mui/material", async () => {
  const actual =
    await vi.importActual<typeof import("@mui/material")>("@mui/material");

  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

const mockedUseMediaQuery = vi.mocked(useMediaQuery);

describe("PlanBrowser", () => {
  describe("Full layout", () => {
    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue(true);
    });

    it("shows a placeholder before initial plan selection and list of plans", () => {
      renderBrowser();

      expect(screen.getByText("Select a plan")).toBeInTheDocument();
      expect(
        screen.getByText("Choose from the list to see details."),
      ).toBeInTheDocument();
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

  describe("Compact layout", () => {
    beforeEach(() => {
      mockedUseMediaQuery.mockReturnValue(false);
    });

    it("shows a placeholder before initial plan selection and 'View plans' button", () => {
      renderBrowser();

      expect(screen.getByText("View plans")).toBeInTheDocument();
      expect(
        screen.getByText("Choose from the list to see details."),
      ).toBeInTheDocument();
    });

    it("opens drawer with plans list when 'View plans' button is clicked", async () => {
      renderBrowser();
      const user = userEvent.setup();
      const button = screen.getByRole("button", { name: "View plans" });
      await user.click(button);
      plansResponse.plans.forEach(plan =>
        expect(screen.getByText(plan.name)).toBeVisible(),
      );
    });
  });
});
