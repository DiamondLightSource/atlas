import ndarray, { type NdArray } from "ndarray";
import { assign } from "ndarray-ops";

export default function createArrayFromView<T extends Uint8Array>(
  view: NdArray<T>,
): NdArray<T> {
  const { data, size, shape } = view;
  const array = ndarray(
    (Array.isArray(data)
      ? []
      : new (data.constructor as Uint8ArrayConstructor)(size)) as T,
    shape,
  );
  assign(array, view);
  return array;
}
