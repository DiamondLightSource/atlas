import ndarray, { type NdArray } from "ndarray";
import { assign } from "ndarray-ops";

//copied (and simplified) from h5web: https://github.com/silx-kit/h5web/blob/a8cceed504b8ab57d426319db56b8b8dab309e3f/packages/shared/src/vis-utils.ts#L103
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
