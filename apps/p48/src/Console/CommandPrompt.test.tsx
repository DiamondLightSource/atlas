import { render, screen, userEvent } from "@atlas/vitest-conf";
import { CommandPrompt } from "./CommandPrompt";
import {
  DiamondDSTheme,
  ThemeProvider,
} from "@diamondlightsource/sci-react-ui";

const { mockComplete, mockDismiss, mockState } = vi.hoisted(() => ({
  mockComplete: vi.fn(),
  mockDismiss: vi.fn(),
  mockState: {
    completion: null as null | {
      matches: string[];
      cursorStart: number;
      cursorEnd: number;
    },
  },
}));

vi.mock("./usePythonCompletion", () => ({
  usePythonCompletion: () => ({
    completion: mockState.completion,
    complete: mockComplete,
    dismiss: mockDismiss,
  }),
}));

describe("CommandPrompt", () => {
  describe("rendering and initial state", () => {
    const renderPrompt = () => {
      render(
        <CommandPrompt
          placeholder="Enter command..."
          onSubmit={() => {}}
          interrupt={() => {}}
          kernel={null}
        />,
      );
    };
    it("renders the input with the supplied placeholder", () => {
      renderPrompt();
      expect(
        screen.getByPlaceholderText("Enter command..."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Run command/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Interrupt/i }),
      ).toBeInTheDocument();
    });
    it("defaults to 'ready' state", () => {
      renderPrompt();
      const submitButton = screen.getByRole("button", { name: /Run command/i });
      expect(submitButton).toBeVisible();
      expect(submitButton).toBeEnabled();

      const interruptButton = screen.getByRole("button", {
        name: /Interrupt/i,
      });
      expect(interruptButton).toBeInTheDocument();
      expect(interruptButton).toBeDisabled();
    });

    it("shows disabled prompt and submit and enabled interrupt when evaluating", () => {
      render(
        <CommandPrompt
          placeholder="Enter command..."
          onSubmit={() => {}}
          interrupt={() => {}}
          kernel={null}
          status="evaluating"
        />,
      );

      const prompt = screen.getByRole("textbox", { name: /python command/i });
      expect(prompt).toBeDisabled();

      const submitButton = screen.getByRole("button", { name: /Run command/i });
      expect(submitButton).toBeDisabled();

      const interruptButton = screen.getByRole("button", {
        name: /Interrupt/i,
      });
      expect(interruptButton).toBeEnabled();
    });

    it("disables prompt and both buttons in 'unavailable' state", () => {
      render(
        <CommandPrompt
          placeholder=""
          onSubmit={() => {}}
          interrupt={() => {}}
          kernel={null}
          status="unavailable"
        />,
      );

      const prompt = screen.getByRole("textbox", { name: /python command/i });
      const submitButton = screen.getByRole("button", { name: /Run command/i });
      const interruptButton = screen.getByRole("button", {
        name: /Interrupt/i,
      });

      expect(prompt).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(interruptButton).toBeDisabled();
    });
  });
  describe("command submission/interruption", () => {
    const onSubmit = vi.fn();
    const interrupt = vi.fn();
    const user = userEvent.setup();
    const renderCommandPrompt = () => {
      return render(
        <CommandPrompt
          placeholder=""
          onSubmit={onSubmit}
          interrupt={interrupt}
          kernel={null}
        />,
      );
    };
    it("submits input contents on submit button", async () => {
      renderCommandPrompt();
      const input = screen.getByRole("textbox", { name: /python command/i });
      const submit = screen.getByRole("button", { name: /run command/i });
      await user.type(input, "print('hi')");
      await user.click(submit);

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith("print('hi')");
      expect(input).toHaveValue("");
    });

    it("submits input contents on Enter", async () => {
      renderCommandPrompt();
      const input = screen.getByRole("textbox", { name: /python command/i });
      await user.type(input, "print('hi')");
      await user.keyboard("{Enter}");

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith("print('hi')");
      expect(input).toHaveValue("");
    });
    it("invokes interrupt function with the interrupt button", async () => {
      render(
        <CommandPrompt
          placeholder=""
          onSubmit={onSubmit}
          interrupt={interrupt}
          status="evaluating"
          kernel={null}
        />,
      );
      const interruptButton = screen.getByRole("button", {
        name: /interrupt/i,
      });

      await user.click(interruptButton);
      expect(interrupt).toHaveBeenCalledOnce();
    });
  });
  describe("keyboard behaviour", () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    beforeEach(() => {
      render(
        <CommandPrompt
          placeholder=""
          onSubmit={onSubmit}
          interrupt={vi.fn()}
          kernel={null}
        />,
      );
    });
    const getPrompt = () =>
      screen.getByRole("textbox", { name: /python command/i });
    it("adds whitespace on Tab key", async () => {
      const prompt = getPrompt();
      await user.click(prompt);
      await user.keyboard("{Tab}");
      // it has not shifted focus...
      expect(prompt).toHaveFocus();
      await user.keyboard("{Enter}");
      // ...just added whitespace to the prompt
      expect(onSubmit).toHaveBeenCalledWith("    ");
    });
    it("shifts focus on Escape", async () => {
      // For a11y, escape acts as an escape hatch
      const prompt = getPrompt();
      await user.click(prompt);
      await user.keyboard("{Escape}");
      expect(prompt).not.toHaveFocus();
    });

    it("scrolls through command history on up/down arrows", async () => {
      const prompt = getPrompt();
      await user.type(prompt, "cmd 1");
      await user.keyboard("{Enter}");
      await user.type(prompt, "cmd 2");
      await user.keyboard("{Enter}");
      expect(prompt).toHaveValue("");
      await user.keyboard("{ArrowUp}");
      expect(prompt).toHaveValue("cmd 2");
      await user.keyboard("{ArrowUp}");
      expect(prompt).toHaveValue("cmd 1");
      await user.keyboard("{ArrowDown}");
      expect(prompt).toHaveValue("cmd 2");
    });
    it("prompts autocomplete on Ctrl+space", async () => {
      const prompt = getPrompt();
      const command = "partial_";
      await user.type(prompt, command);
      await user.keyboard("{Control>}{ }{/Control}");
      expect(mockComplete).toHaveBeenCalledWith(command, command.length);
    });
  });
  describe("autocomplete integration", () => {
    // in these tests, the autocomplete menu is always open because matches exist
    beforeEach(() => {
      vi.clearAllMocks();
      mockState.completion = {
        matches: ["print", "printf", "property"],
        cursorStart: 0,
        cursorEnd: 3,
      };
    });

    /** The autocomplete suggestions */
    const getOptions = () => screen.getAllByRole("option");

    const renderPrompt = () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      const result = render(
        <ThemeProvider theme={DiamondDSTheme}>
          <CommandPrompt
            placeholder=""
            onSubmit={onSubmit}
            interrupt={vi.fn()}
            kernel={null}
          />
        </ThemeProvider>,
      );
      const prompt = screen.getByRole("textbox", { name: /python command/i });
      return { prompt, user, result };
    };

    it("shows the matches, with the first selected", () => {
      renderPrompt();
      expect(getOptions().map((o) => o.textContent)).toEqual([
        "print",
        "printf",
        "property",
      ]);
      expect(getOptions()[0]).toHaveAttribute("aria-selected", "true");
    });

    it("moves selection with arrow keys, wrapping at both ends", async () => {
      const { prompt, user } = renderPrompt();
      await user.click(prompt);
      await user.keyboard("{ArrowDown}");
      expect(getOptions()[1]).toHaveAttribute("aria-selected", "true");

      await user.keyboard("{ArrowUp}");
      await user.keyboard("{ArrowUp}");
      expect(getOptions()[2]).toHaveAttribute("aria-selected", "true");
    });

    it("doesn't scroll command history while the autocomplete menu is open", async () => {
      // we assert that arrow keys don't touch the input value
      const { prompt, user } = renderPrompt();
      await user.type(prompt, "pr");
      await user.keyboard("{ArrowDown}");
      expect(prompt).toHaveValue("pr");
    });

    it.each(["{Enter}", "{Tab}"])(
      "%s accepts the selected match",
      async (key) => {
        const { prompt, user } = renderPrompt();
        await user.type(prompt, "pr");
        await user.keyboard(key);
        expect(prompt).toHaveValue("print");
      },
    );

    it("dismisses menu on Escape and keeps focus in the prompt", async () => {
      const { prompt, user } = renderPrompt();
      await user.type(prompt, "pr");
      await user.keyboard("{Escape}");
      expect(mockDismiss).toHaveBeenCalledOnce();
      expect(prompt).toHaveFocus(); // unlike the no-menu escape hatch
    });

    it("accepts a match on click without losing input focus", async () => {
      const { prompt, user } = renderPrompt();
      await user.type(prompt, "pr");
      await user.click(screen.getByRole("option", { name: "property" }));
      expect(prompt).toHaveValue("property");
      expect(mockDismiss).toHaveBeenCalledOnce();
      expect(prompt).toHaveFocus();
    });

    it("resets selection to the first match when the user types", async () => {
      const { prompt, user } = renderPrompt();
      await user.type(prompt, "pr");
      await user.keyboard("{ArrowDown}");
      await user.type(prompt, "i");
      expect(getOptions()[0]).toHaveAttribute("aria-selected", "true");
    });
  });
});
