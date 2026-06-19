import type { Plan } from "@atlas/blueapi";
import { render, screen } from "@atlas/vitest-conf";

import { PlanParameters } from "./PlanParameters";

const mockJsonFormsImpl = vi.fn(() => {
  return <div data-testid="jsonforms-sentinel" />;
});

vi.mock("@jsonforms/react", () => {
  return {
    JsonForms: () => mockJsonFormsImpl(),
  };
});

// mock run plan button which is out of scope of this test
export function RunPlanButton() {
  return <button>Run</button>;
}
vi.mock("./RunPlanButton", () => ({
  RunPlanButton: RunPlanButton,
}));

const plan: Plan = {
  name: "hi_plan",
  description: "Says hi to you",
  schema: {
    properties: { name: { title: "Name", type: "string" } },
  },
};

describe("PlanParameters", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders a plan's name, description, parameters, session, and run button", () => {
    render(<PlanParameters plan={plan} />);

    expect(screen.getByText(plan.name)).toBeInTheDocument();
    expect(screen.getByText(plan.description!)).toBeInTheDocument();
    expect(screen.getByTestId("jsonforms-sentinel")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Instrument Session" }));
    expect(screen.getByRole("button", { name: "Run" }));
  });

  it("renders fallback UI if JSON Forms component fails", async () => {
    // suppress error message in test output
    const errorHandler = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", errorHandler);

    // this time JsonForms will throw
    mockJsonFormsImpl.mockImplementation(() => {
      throw new Error("I can't do it!");
    });

    render(<PlanParameters plan={plan} />);

    expect(screen.getByText("UI unavailable")).toBeInTheDocument();

    window.removeEventListener("error", errorHandler);
  });
});
