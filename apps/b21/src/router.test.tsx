import { describe, expect, it, vi } from "vitest";

const createRouter = vi.fn();

vi.mock("@atlas/app-shell", () => ({
  createRouter,
  SystemControls: () => null,
}));

vi.mock("@atlas/blueapi-ui", () => ({
  PlanBrowser: () => null,
}));

describe("router", () => {
  it("creates the router with the expected title and navigation", async () => {
    await import("./router");

    expect(createRouter).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "b21",
        navigation: [
          {
            sections: [
              expect.objectContaining({
                name: "Acquisition",
                path: "acquisition",
                isProtected: true,
                pages: [
                  expect.objectContaining({
                    name: "Plans",
                  }),
                ],
              }),
            ],
          },
        ],
      }),
    );
  });
});
