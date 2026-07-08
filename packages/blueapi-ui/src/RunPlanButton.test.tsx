import * as React from "react";
import { render, screen, within, userEvent } from "@atlas/vitest-conf";
import { RunPlanButton } from "./RunPlanButton";

// This doesn't actually mock the functions, and complains about
// `useQueryClient`, and then `useBlueapi`
// vi.mock("@/atlas/blueapi-query/tasks/useSubmitTask", () => {
//   return {
//     useSubmitTask: vi.fn(),
//   };
// });

// vi.mock("@/atlas/blueapi-query/tasks/useSetActiveTask", () => {
//   return {
//     useSetActiveTask: vi.fn(),
//   };
// });

// This doesn't actually mock the functions, and complains about
// `useQueryClient`, and then `useBlueapi`
// const useSubmitTask = vi.fn();
// const useSetActiveTask = vi.fn();

describe("RunPlanButton", () => {
  it("renders default button with Run Plan", () => {
    render(
      <RunPlanButton
        name="test_plan"
        params={[]}
        instrumentSession="cm12345-1"
      />,
    );

    expect(screen.getByText("Run Plan"));
  });
});
