export function calculateNewPosition(
  oldPosition: number, // Position in queue
  oldIndex: number, // Row index in table
  targetIndex: number,
): number {
  const newPosition = Math.max(oldPosition + (targetIndex - oldIndex), 0);

  return newPosition;
}

export function positionFromName(name: string): string {
  const parts = name.split("_");
  return "Puck " + parts[1] + " | Pin " + parts[2];
}
