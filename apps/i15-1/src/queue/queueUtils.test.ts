import { describe, it, expect } from "vitest";
import { calculateNewPosition } from "./queueUtils";

describe("calculateNewPosition", () => {
  it.each([
    // oldPosition, oldIndex, targetIndex, expectedNewPosition
    [1, 1, 3, 3],
    [3, 3, 1, 1],
    [1, 2, 6, 5],
    [3, 7, 5, 1],
    [3, 8, 2, 0],
  ])(
    "returns %s when oldPosition=%s, oldIndex=%s, targetIndex=%s",
    (oldPosition, oldIndex, targetIndex, expectedNewPosition) => {
      const result = calculateNewPosition(oldPosition, oldIndex, targetIndex);

      expect(result).toBe(expectedNewPosition);
    },
  );
});
