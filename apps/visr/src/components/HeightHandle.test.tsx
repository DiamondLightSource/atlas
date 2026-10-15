import { fireEvent, render, screen } from "@atlas/vitest-conf";
import HeightHandle from "./HeightHandle";

/** A handle under a box that currently measures `height` pixels */
function setup(height: number, value: number | null = null) {
  const onChange = vi.fn();
  const box = document.createElement("div");
  box.getBoundingClientRect = () => ({ height }) as DOMRect;
  render(
    <HeightHandle
      target={{ current: box }}
      value={value}
      onChange={onChange}
      min={100}
      max={600}
      label="Height of the plots"
    />,
  );
  return { onChange, handle: screen.getByRole("separator") };
}

// jsdom has no PointerEvent, so pointer events would lose their coordinates
class TestPointerEvent extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}

describe("HeightHandle", () => {
  beforeAll(() => vi.stubGlobal("PointerEvent", TestPointerEvent));
  afterAll(() => vi.unstubAllGlobals());

  it("sets the height by how far it is dragged", () => {
    const { onChange, handle } = setup(300);
    handle.setPointerCapture = () => {};
    handle.releasePointerCapture = () => {};
    fireEvent.pointerDown(handle, { clientY: 400, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 450, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(350);
    fireEvent.pointerMove(handle, { clientY: 0, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(100); // no lower than min
    fireEvent.pointerUp(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 500, pointerId: 1 });
    expect(onChange).toHaveBeenCalledTimes(2); // not after letting go
  });

  it("moves with the arrow keys, and Escape or a double click resets it", () => {
    const { onChange, handle } = setup(300, 300);
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith(320);
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(280);
    fireEvent.keyDown(handle, { key: "Escape" });
    expect(onChange).toHaveBeenLastCalledWith(null);
    fireEvent.doubleClick(handle);
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(handle).toHaveAttribute("aria-valuenow", "300");
  });
});
