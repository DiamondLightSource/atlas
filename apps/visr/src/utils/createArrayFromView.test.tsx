import ndarray from "ndarray";
import createArrayFromView from "./createArrayFromView";

describe("createArrayFromView", () => {
  const volumeData = new Uint8Array([
    0, 1, 2, 3, 224, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    59, 60,
  ]);
  const volumeShape = [3, 4, 5];
  const volume = ndarray(volumeData, volumeShape);

  //this tests that the .pick function works as well as the createArrayFromView test
  it("createArrayFromView returns correct slice - Z, 0", async () => {
    const expectedArray_0_Z_data = new Uint8Array([
      0, 1, 2, 3, 224, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ]);
    const sliceNdarray = createArrayFromView(volume.pick(0, null, null));
    expect(sliceNdarray.size).toEqual(4 * 5);
    expect(sliceNdarray.data).toEqual(expectedArray_0_Z_data);
    expectTypeOf(sliceNdarray).toEqualTypeOf(volume);
  });

  it("createArrayFromView returns correct slice - Z, 1", async () => {
    const expectedArray_0_Z_data = new Uint8Array([
      20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
      38, 39,
    ]);
    const sliceNdarray = createArrayFromView(volume.pick(1, null, null));
    expect(sliceNdarray.size).toEqual(4 * 5);
    expect(sliceNdarray.data).toEqual(expectedArray_0_Z_data);
    expectTypeOf(sliceNdarray).toEqualTypeOf(volume);
  });
});
