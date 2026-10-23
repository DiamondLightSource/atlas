import { render, screen } from "@atlas/vitest-conf";
import { Log, type LogEntry } from "./Log";

describe("Log", () => {
  beforeAll(() => {
    Element.prototype.scrollTo = vi.fn();
  });
  describe("renders log entries", () => {
    it("renders multiple log entries in order", () => {
      const logEntries: LogEntry[] = [
        {
          kind: "command",
          message: "print('hello')",
        },
        {
          kind: "result",
          message: "hello",
        },
      ];
      const { container } = render(<Log lines={logEntries} />);

      // more to contrast with empty list test:
      expect(container.querySelectorAll(".MuiTypography-root")).toHaveLength(2);

      const command = screen.getByText(">>> print('hello')");
      const result = screen.getByText("hello");

      expect(command).toBeVisible();
      expect(result).toBeVisible();

      // result follows command in document
      expect(
        command.compareDocumentPosition(result) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("renders an empty log when lines is empty", () => {
      const { container } = render(<Log lines={[]} />);

      expect(container.firstChild).toBeInTheDocument();
      expect(container.querySelectorAll(".MuiTypography-root")).toHaveLength(0);
    });
  });
  describe("command prefixes", () => {
    it("uses >>> for complete commands", () => {
      render(<Log lines={[{ kind: "command", message: "pos" }]} />);
      expect(screen.getByText(">>> pos")).toBeInTheDocument();
    });
    it("uses ... for partial commands", () => {
      const lines: LogEntry[] = [
        { kind: "command", message: "def identity(x):" },
        { kind: "command", message: "    return x", partial: true },
      ];
      render(<Log lines={lines} />);

      expect(screen.getByText(">>> def identity(x):")).toBeInTheDocument();
      expect(
        screen.getByText("...     return x", { normalizer: (text) => text }),
      ).toBeInTheDocument();
    });
    it("does not prefix results or errors", () => {
      const lines: LogEntry[] = [
        { kind: "error", message: "SyntaxError" },
        { kind: "result", message: "3" },
      ];
      render(<Log lines={lines} />);
      expect(screen.getByText("SyntaxError")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});
