import { describe, it, expect } from "vitest";

import type { TaskWithPosition } from "../../generated/queue";
import { prependLatestFailedTask } from "./queueService";

describe("prependLatestFailedTask", () => {
  it("prepends latest failed task", () => {
    const result = prependLatestFailedTask(
      [{ id: "queued", status: "Queued" } as TaskWithPosition],
      { id: "failed", status: "Error" } as TaskWithPosition,
    );

    expect(result.map((t) => t.id)).toEqual(["failed", "queued"]);
  });

  it("does not prepend successful task", () => {
    const result = prependLatestFailedTask(
      [{ id: "queued", status: "Queued" } as TaskWithPosition],
      { id: "done", status: "Complete" } as TaskWithPosition,
    );

    expect(result.map((t) => t.id)).toEqual(["queued"]);
  });
});
