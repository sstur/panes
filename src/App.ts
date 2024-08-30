import type { Widgets } from 'blessed';

import {
  screenKeypressHandlers,
  terminalKeypressHandlers,
} from './keypressHandlers';
import { StatefulApp } from './StatefulApp';
import { blessed } from './support/blessed';
import { XTerm } from './support/blessed-xterm';
import { layoutsByPaneCount } from './support/layouts';
import { parseArgs } from './support/parseArgs';
import type { Command } from './types/Command';
import type { TerminalPane } from './types/TerminalPane';

const isMac = process.platform === 'darwin';

const altKey = isMac ? 'opt' : 'alt';

type State = {
  focusedIndex: number;
  terminalPanes: Array<TerminalPane>;
  shuttingDown: boolean;
};

const maxNumWindows = Object.keys(layoutsByPaneCount).length;

const screenIgnoreKeys = screenKeypressHandlers.flatMap(
  ({ keys, passThrough }) => (passThrough ? [] : keys),
);
const terminalIgnoreKeys = terminalKeypressHandlers.flatMap(
  ({ keys, passThrough }) => (passThrough ? [] : keys),
);

export class App extends StatefulApp<State> {
  screen: Widgets.Screen;
  topBox: Widgets.BoxElement;
  layoutBox: Widgets.BoxElement;

  constructor(args: Array<string>) {
    const terminalPanes: Array<TerminalPane> = [];
    const initialState: State = {
      focusedIndex: 0,
      terminalPanes,
      shuttingDown: false,
    };

    super(initialState, () => {
      this.ensureConsistentState();
      this.update();
    });

    const commands = parseArgs(args);
    if (commands.length === 0) {
      // TODO: Display usage
      // eslint-disable-next-line no-console
      console.error('No commands provided');
      process.exit(1);
    }

    const screen = blessed.screen({
      title: 'Dev Server',
      smartCSR: true,
      autoPadding: false,
      warnings: false,
    });

    const topBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 1,
      content: '', // Will be populated later
      tags: true, // Enable tags to allow inline styling
    });

    const bottomBox = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      content: `Press ^q to quit | ${altKey}-1, ${altKey}-2, … to toggle panes | ${altKey}-left/${altKey}-right to focus next/prev | ^k to clear pane`,
    });

    const layoutBox = blessed.box({
      top: 1,
      left: 0,
      width: '100%',
      height: `100%-2`,
      style: {
        bg: 'black',
      },
    });

    screen.append(topBox);
    screen.append(bottomBox);
    screen.append(layoutBox);

    for (const command of commands) {
      const terminalPane = this.launchTerminal(command);
      terminalPanes.push(terminalPane);
      layoutBox.append(terminalPane.terminal);
    }

    for (const { keys, handler } of screenKeypressHandlers) {
      screen.key(keys, () => handler(this));
    }

    screen.key(['C-q'], () => {
      this.exit(0);
    });

    this.screen = screen;
    this.topBox = topBox;
    this.layoutBox = layoutBox;
    this.ensureConsistentState();
    this.update();
  }

  launchTerminal(command: Command) {
    const { title, npmScript, initiallyVisible } = command;
    const terminal = new XTerm({
      shell: 'npm',
      args: ['run', npmScript],
      env: process.env,
      cwd: process.cwd(),
      cursorType: 'block',
      border: 'line',
      scrollback: 1000,
      // Don't pass through the keystrokes we're handling here
      ignoreKeys: [...screenIgnoreKeys, ...terminalIgnoreKeys],
      style: {
        fg: 'default',
        bg: 'default',
        label: { fg: 'grey' },
        border: { fg: 'gray' },
        focus: {
          label: { fg: 'default' },
          border: { fg: 'default' },
        },
        scrolling: {
          border: { fg: 'red' },
        },
      },
      label: title,
      // The dimensions here don't really matter since they will be overwritten by .update()
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });

    const terminalPane: TerminalPane = {
      title,
      terminal,
      isRunning: true,
      isVisible: initiallyVisible,
    };

    for (const { keys, handler } of terminalKeypressHandlers) {
      terminal.key(keys, () => {
        handler(this, terminalPane);
      });
    }

    // If the process in this pane has already exited the user can press q or ctrl+c to exit completely
    terminal.key(['C-c', 'q'], () => {
      if (!terminalPane.isRunning) {
        this.exit(0);
      }
    });

    terminal.on('exit', (code: number) => {
      terminalPane.isRunning = false;
      terminal.term.writeln('');
      terminal.term.writeln('Exited with status ' + code);
      terminal.term.writeln('Press r to restart.');
      terminal.term.writeln('Press q to quit.');
    });

    return terminalPane;
  }

  // This runs before update() to ensure the state is consistent before rendering.
  // IMPORTANT: Do not call setState from within here.
  private ensureConsistentState() {
    const { terminalPanes, focusedIndex } = this.state;
    const visibleTerminalPanes = terminalPanes.filter(
      ({ isVisible }) => isVisible,
    );
    const focusedTerminalPane = terminalPanes[focusedIndex];
    if (!focusedTerminalPane || !focusedTerminalPane.isVisible) {
      const firstVisible = visibleTerminalPanes[0];
      if (firstVisible) {
        // Intentionally not using setState here
        this.state.focusedIndex = terminalPanes.indexOf(firstVisible);
      }
    }
    if (visibleTerminalPanes.length > maxNumWindows) {
      const panesToHide = visibleTerminalPanes.slice(maxNumWindows);
      for (const pane of panesToHide) {
        pane.isVisible = false;
      }
    }
  }

  private update() {
    const { terminalPanes, focusedIndex } = this.state;

    const headerTitles = terminalPanes.map(({ title, isVisible }, index) => {
      const tabName = `(${index + 1}) ${title}`;
      const style = isVisible ? `{white-fg}{underline}` : `{gray-fg}`;
      return `${style}${tabName}{/}`;
    });
    this.topBox.setContent(headerTitles.join(' | '));

    for (const terminalPane of terminalPanes) {
      if (terminalPane.isVisible) {
        terminalPane.terminal.show();
      } else {
        terminalPane.terminal.hide();
      }
    }

    const visibleTerminalPanes = terminalPanes.filter(
      ({ isVisible }) => isVisible,
    );
    const numVisibleTerminals = visibleTerminalPanes.length;
    const layouts = layoutsByPaneCount[numVisibleTerminals] ?? [];
    for (const [layoutIndex, { terminal }] of visibleTerminalPanes.entries()) {
      const layout = layouts[layoutIndex];
      if (layout) {
        terminal.left = layout.left;
        terminal.top = layout.top;
        terminal.width = layout.width;
        terminal.height = layout.height;
        terminal.show();
      }
    }

    terminalPanes[focusedIndex]?.terminal.focus();
  }

  incFocusedTerminal(num: number) {
    const { terminalPanes, focusedIndex } = this.state;
    const focusedTerminal = terminalPanes[focusedIndex];
    if (!focusedTerminal) {
      return;
    }
    const shownTerminals = terminalPanes.filter(({ isVisible }) => isVisible);
    if (!shownTerminals.length) {
      return;
    }
    let shownIndex = shownTerminals.indexOf(focusedTerminal);
    if (shownIndex === -1) {
      shownIndex = 0;
    }
    shownIndex =
      (shownIndex + shownTerminals.length + num) % shownTerminals.length;
    const shownTerminal = shownTerminals[shownIndex];
    if (!shownTerminal) {
      return;
    }
    this.setState({ focusedIndex: terminalPanes.indexOf(shownTerminal) });
  }

  // TODO: Ensure no more than maximum are showing
  toggleVisibilityForPane(index: number) {
    const { terminalPanes } = this.state;
    const terminalPane = terminalPanes[index];
    if (!terminalPane) {
      return;
    }
    if (terminalPane.isVisible) {
      terminalPane.isVisible = false;
    } else {
      const visibleTerminalPanes = terminalPanes.filter(
        ({ isVisible }) => isVisible,
      );
      if (visibleTerminalPanes.length >= maxNumWindows) {
        const lastPane = visibleTerminalPanes.pop();
        if (lastPane) {
          lastPane.isVisible = false;
        }
      }
      terminalPane.isVisible = true;
    }
    this.setState({ terminalPanes });
  }

  exit(status: number) {
    // TODO: Attempt to gracefully shut down all processes?
    this.screen.destroy();
    process.exit(status);
  }

  static create(args: Array<string>) {
    return new App(args);
  }
}
