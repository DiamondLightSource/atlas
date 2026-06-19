export function calculateNewPosition(
  oldPosition: number, // Position in queue
  oldIndex: number, // Row index in table
  targetIndex: number,
): number {
  const newPosition = Math.max(oldPosition + (targetIndex - oldIndex), 0);

  return newPosition;
}
