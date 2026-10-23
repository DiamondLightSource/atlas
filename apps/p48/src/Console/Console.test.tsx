import { render, screen, userEvent, waitFor } from "@atlas/vitest-conf";
import { Console } from "./Console";

const mocks = vi.hoisted(() => ({
  command: "print('hello')",
  kernel: {
    requestIsComplete: vi.fn(),
    interrupt: vi.fn(),
    shutdown: vi.fn(),
  },
  startKernel: vi.fn(),
  executeCode: vi.fn(),
}));

vi.mock("./kernelclient", () => ({
  makeKernelManager: vi.fn(() => ({})),
  startKernel: mocks.startKernel,
  executeCode: mocks.executeCode,
}));

// mock CommandPrompt as a button showing the status,
// and which submits mocks.command

vi.mock("./CommandPrompt", () => ({
  CommandPrompt: ({
    onSubmit,
    status,
  }: {
    onSubmit: (input: string) => void;
    status: string;
  }) => (
    <button onClick={() => onSubmit(mocks.command)}>Submit ({status})</button>
  ),
}));

// history is simply kind: message, where kind can be command, result, error
vi.mock("./Log", () => ({
  Log: ({
    lines,
  }: {
    lines: { kind: string; message: string; partial?: boolean }[];
  }) => (
    <div data-testid="log">
      {lines.map((line, index) => {
        const prefix =
          line.kind === "command" ? (line.partial ? "... " : ">>> ") : "";
        const msg = `${prefix}${line.kind}: ${line.message}`;
        return <div key={index}>{msg}</div>;
      })}
    </div>
  ),
}));

describe("Console", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.command = "print('hello')";

    // the status in the reply could be complete, unknown, invalid, incomplete
    mocks.kernel.requestIsComplete.mockResolvedValue({
      content: { status: "complete" },
    });

    mocks.startKernel.mockResolvedValue(mocks.kernel);

    mocks.executeCode.mockImplementation(async (_kernel, _command, onChunk) => {
      onChunk({ kind: "result", text: "hello" });
    });
  });

  async function waitForKernelConnection() {
    await waitFor(() => {
      expect(mocks.startKernel).toHaveBeenCalledWith(
        expect.anything(),
        "python3",
      );
    });
  }

  async function submitCommand(command?: string) {
    if (command !== undefined) {
      mocks.command = command;
    }
    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.click(submitButton);
  }
  it("executes a complete command and logs its result", async () => {
    render(<Console />);

    await waitForKernelConnection();

    await submitCommand();

    await waitFor(() => {
      expect(mocks.kernel.requestIsComplete).toHaveBeenCalledWith({
        code: "print('hello')",
      });
      expect(mocks.executeCode).toHaveBeenCalledWith(
        mocks.kernel,
        "print('hello')",
        expect.any(Function),
      );
    });

    expect(
      screen.queryByText(">>> command: print('hello')"),
    ).toBeInTheDocument();
    expect(screen.queryByText("result: hello")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /submit \(ready\)/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not execute incomplete commands", async () => {
    const command = "def hi():";
    mocks.kernel.requestIsComplete.mockResolvedValue({
      content: { status: "incomplete" },
    });

    render(<Console />);

    await waitForKernelConnection();

    await submitCommand(command);

    await waitFor(() => {
      expect(mocks.kernel.requestIsComplete).toHaveBeenCalledWith({
        code: command,
      });
      expect(mocks.executeCode).not.toHaveBeenCalled();
    });

    // but we still log it:
    expect(screen.getByText(`>>> command: ${command}`)).toBeInTheDocument();
  });

  // careful with the whitespace in this test...
  // it's Python whaddyouwant?
  it("constructs multiline commands", async () => {
    render(<Console />);
    await waitForKernelConnection();

    mocks.kernel.requestIsComplete.mockResolvedValue({
      content: { status: "incomplete" },
    });

    await submitCommand("def hi():");
    await submitCommand("    print('hello')");
    mocks.kernel.requestIsComplete.mockResolvedValue({
      content: { status: "complete" },
    });
    await submitCommand("");

    await waitFor(() => {
      expect(mocks.kernel.requestIsComplete).toHaveBeenCalledTimes(3);
      expect(mocks.executeCode).toHaveBeenCalledExactlyOnceWith(
        mocks.kernel,
        `def hi():
    print('hello')
`,
        expect.any(Function),
      );
    });
  });

  it("logs commands as partial correctly", async () => {
    /* 
    in the history you'd expect to see something like 
    >>> for x in range(5):
    ...     print(x)
    ...
    {stdout}
    so you'd want to mark the second and third commands
    (the third being empty) as partial, so that they render
    with a different prompt icon
    */
    render(<Console />);
    await waitForKernelConnection();

    mocks.kernel.requestIsComplete.mockResolvedValue({
      content: { status: "incomplete" },
    });
    await submitCommand("for x in range(5):");
    await submitCommand("    print(x)");
    mocks.kernel.requestIsComplete.mockResolvedValue({
      content: { status: "complete" },
    });
    await submitCommand("");
    expect(screen.getByText(">>> command: for x in range(5):"));
    expect(
      screen.getByText("... command:     print(x)", {
        normalizer: (text) => text,
      }),
    );
    expect(screen.getByText("... command:"));
  });

  it("handles execution errors accordingly", async () => {
    render(<Console />);

    const errorMessage = "NameError: name 'hi' is not defined";
    mocks.executeCode.mockImplementation(async (_kernel, _command, onChunk) => {
      onChunk({ kind: "error", text: errorMessage });
    });

    await waitForKernelConnection();
    await submitCommand("hi");

    expect(screen.getByText(">>> command: hi"));
    expect(screen.getByText(`error: ${errorMessage}`));
  });
});
