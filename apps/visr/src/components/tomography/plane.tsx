export enum Plane {
  X,
  Y,
  Z,
}

/** The last slice along `plane` of a volume shaped [depth, height, width] */
export function maxSliceFor(
  volumeShape: [number, number, number],
  plane: Plane,
): number {
  const sizes: Record<Plane, number> = {
    [Plane.Z]: volumeShape[0],
    [Plane.Y]: volumeShape[1],
    [Plane.X]: volumeShape[2],
  };
  return sizes[plane] - 1;
}
