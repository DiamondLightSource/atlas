import { act, renderHook } from "@atlas/vitest-conf";
import type { Kernel } from "@jupyterlab/services";
import { usePythonCompletion } from "./usePythonCompletion";

describe("usePythonCompletion", () => {
  const requestComplete = vi.fn();
  const kernel = {
    requestComplete,
  } as unknown as Kernel.IKernelConnection;

  const renderIt = () => {
    return renderHook(({ kernel }) => usePythonCompletion(kernel), {
      initialProps: { kernel: kernel },
    });
  };
  describe("basic behaviour", () => {
    it("has null initial completion", () => {
      const { result } = renderIt();
      expect(result.current.completion).toBeNull();
    });

    it("calls kernel.requestComplete on complete() with code and cursor position", async () => {
      const { result } = renderIt();
      await act(async () => {
        await result.current.complete("pri", 2);
      });
      expect(kernel.requestComplete).toHaveBeenCalledWith({
        code: "pri",
        cursor_pos: 2,
      });
    });

    it("holds matches and cursor positions in completion when status: 'ok'", async () => {
      requestComplete.mockResolvedValue({
        content: {
          status: "ok",
          matches: ["print", "printf", "property"],
          cursor_start: 0,
          cursor_end: 2,
        },
      });

      const { result } = renderIt();
      await act(async () => {
        await result.current.complete("pri", 2);
      });
      const completion = result.current.completion;
      expect(completion?.matches).toEqual(["print", "printf", "property"]);
      expect(completion?.cursorStart).toEqual(0);
      expect(completion?.cursorEnd).toEqual(2);
    });

    it("returns null completion when reply has status: 'error'", async () => {
      requestComplete.mockResolvedValue({
        content: {
          status: "error",
        },
      });
      const { result } = renderIt();
      await act(async () => {
        await result.current.complete("d", 1);
      });
      expect(result.current.completion).toBeNull();
    });

    it("can return an ok response with no matches", async () => {
      requestComplete.mockResolvedValue({
        content: {
          status: "ok",
          matches: [],
          cursor_start: 0,
          cursor_end: 5,
        },
      });
      const { result } = renderIt();
      await act(async () => {
        await result.current.complete("zzzzz", 5);
      });
      const completion = result.current.completion;
      expect(completion).not.toBeNull();
      expect(completion?.matches).toEqual([]);
    });
  });

  describe("early exits", () => {
    it("returns null without making requests if kernel is null", async () => {
      const { result } = renderHook(
        ({ kernel }) => usePythonCompletion(kernel),
        {
          initialProps: {
            kernel: null,
          },
        },
      );
      await act(async () => {
        await result.current.complete("d", 1);
      });

      expect(result.current.completion).toBeNull();
      // and no npe which would occur if the request is made
    });

    it("does not make request when code is empty", async () => {
      const { result } = renderIt();
      await act(async () => {
        await result.current.complete("", 0);
      });
      expect(result.current.completion).toBeNull();
      expect(requestComplete).not.toHaveBeenCalled();
    });
  });

  describe("race handling", () => {
    /**
     * Holds a promise plus the two functions that settle it.
     *
     * The promise stays pending until our tests call `resolve(...)`
     * or `reject(...)`.
     */
    const deferred = <T,>() => {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };

    const okReply = (matches: string[]) => ({
      content: { status: "ok", matches, cursor_start: 0, cursor_end: 1 },
    });
    it("returns newest results even if older request resolves later", async () => {
      // The kernel's replies, settled via `resolve(...)`
      const older = deferred<ReturnType<typeof okReply>>();
      const newer = deferred<ReturnType<typeof okReply>>();

      // each call gets a different promise, in call order
      requestComplete
        .mockReturnValueOnce(older.promise)
        .mockReturnValueOnce(newer.promise);

      const { result } = renderIt();

      // represent the `complete(...)` function finishing
      let firstCall!: Promise<void>;
      let secondCall!: Promise<void>;

      act(() => {
        // each call runs synchronously up the its first await
        firstCall = result.current.complete("p", 1);
        secondCall = result.current.complete("pr", 2);
      });

      // the newer request replies first...
      await act(async () => {
        // kernel replies...
        newer.resolve(okReply(["print"]));
        // and the corresponding complete(...) returns
        await secondCall;
      });

      expect(result.current.completion?.matches).toEqual(["print"]);

      // ...then the stale one arrives late and must be ignored
      await act(async () => {
        older.resolve(okReply(["pass", "pow"]));
        await firstCall;
      });

      expect(result.current.completion?.matches).toEqual(["print"]);
    });

    it("does not clear completion on rejected later request", async () => {
      const older = deferred<unknown>();
      const newer = deferred<unknown>();

      requestComplete
        .mockReturnValueOnce(older.promise)
        .mockReturnValueOnce(newer.promise);

      const { result } = renderIt();

      let first!: Promise<void>, second!: Promise<void>;

      act(() => {
        first = result.current.complete("p", 1);
        second = result.current.complete("pr", 2);
      });

      await act(async () => {
        newer.resolve(okReply(["print"]));
        await second;
      });

      await act(async () => {
        older.reject(new Error());
        await first;
      });

      expect(result.current.completion?.matches).toEqual(["print"]);
    });

    it("cancels in flight request on dismiss", async () => {
      const pending = deferred<unknown>();
      requestComplete.mockReturnValueOnce(pending.promise);
      const { result } = renderIt();

      let call!: Promise<void>;
      act(() => {
        call = result.current.complete("pr", 2);
      });

      act(() => {
        result.current.dismiss();
      });

      await act(async () => {
        pending.resolve(okReply(["print"]));
        await call;
      });

      expect(result.current.completion).toBeNull();
    });
    it("clears existing completion on dismiss", async () => {
      requestComplete.mockResolvedValueOnce(okReply(["print"]));
      const { result } = renderIt();
      await act(async () => {
        await result.current.complete("pr", 2);
      });
      expect(result.current.completion?.matches).toEqual(["print"]);
      act(() => {
        result.current.dismiss();
      });
      expect(result.current.completion).toBeNull();
    });
    it("ignores late resolution on kernel change", async () => {
      const { result, rerender } = renderIt();
      const reqA = deferred<unknown>();

      requestComplete.mockResolvedValueOnce(reqA.promise);

      let call!: Promise<void>;
      act(() => {
        call = result.current.complete("pr", 2);
      });

      const kernelB = {
        requestComplete: vi.fn(),
      } as unknown as Kernel.IKernelConnection;

      // rerender with kernel B before the first request is resolved
      rerender({ kernel: kernelB });

      await act(async () => {
        reqA.resolve(okReply(["print"]));
        await call;
      });

      // original call has resolved, but completion cleared
      expect(result.current.completion).toBeNull();
    });
  });
});
