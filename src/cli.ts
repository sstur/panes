import os from 'os';
import blessed from 'blessed';
import XTerm from 'blessed-xterm';

import { layoutsByPaneCount } from './support/layouts';
import { parseArgs } from './support/parseArgs';
import type { KeypressHandler } from './types/KeypressHandler';

const isMac = os.platform() === 'darwin';

const altKey = isMac ? 'opt' : 'alt';

const commands = parseArgs(process.argv.slice(2));

if (commands.length === 0) {
  // TODO: Display usage
  // eslint-disable-next-line no-console
  console.error('No commands provided');
  process.exit(1);
}

const maxNumWindows = Object.keys(layoutsByPaneCount).length;

const state = {
  focusedIndex: 0,
  shownTerminalIndexes: new Set(
    commands.flatMap(({ initiallyVisible }, index) =>
      initiallyVisible ? [index] : [],
    ),
  ),
  shuttingDown: false,
};

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

const screenKeypressHandlers = [
  {
    keys: ['M-left', 'M-b'],
    handler: () => {
      incFocusedTerminal(-1);
      terminals[state.focusedIndex]?.focus();
    },
    passThrough: false,
  },
  {
    keys: ['M-right', 'M-f'],
    handler: () => {
      incFocusedTerminal(1);
      terminals[state.focusedIndex]?.focus();
    },
    passThrough: false,
  },
  {
    keys: ['M-1', '\u00a1'],
    handler: () => {
      toggleVisibilityForPane(0);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-2', '\u2122'],
    handler: () => {
      toggleVisibilityForPane(1);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-3', '\u00a3'],
    handler: () => {
      toggleVisibilityForPane(2);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-4', '\u00a2'],
    handler: () => {
      toggleVisibilityForPane(3);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-5', '\u221e'],
    handler: () => {
      toggleVisibilityForPane(4);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-6', '\u00a7'],
    handler: () => {
      toggleVisibilityForPane(5);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-7', '\u00b6'],
    handler: () => {
      toggleVisibilityForPane(6);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-8', '\u2022'],
    handler: () => {
      toggleVisibilityForPane(7);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-9', '\u00aa'],
    handler: () => {
      toggleVisibilityForPane(8);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
  {
    keys: ['M-0', '\u00ba'],
    handler: () => {
      toggleVisibilityForPane(9);
      updateLayoutAndRender();
    },
    passThrough: false,
  },
];

const terminalKeypressHandlers: Array<KeypressHandler<[terminal: XTerm]>> = [
  {
    keys: ['pagedown'],
    handler: (terminal) => {
      if (!terminal.scrolling) {
        terminal.scroll(0);
      }
      const n = Math.max(1, Math.floor(terminal.height * 0.1));
      terminal.scroll(+n);
      if (Math.ceil(terminal.getScrollPerc()) === 100) {
        terminal.resetScroll();
      }
    },
    passThrough: false,
  },
  {
    keys: ['pageup'],
    handler: (terminal) => {
      if (!terminal.scrolling) {
        terminal.scroll(0);
      }
      const n = Math.max(1, Math.floor(terminal.height * 0.1));
      terminal.scroll(-n);
      if (Math.ceil(terminal.getScrollPerc()) === 100) {
        terminal.resetScroll();
      }
    },
    passThrough: false,
  },
  {
    keys: ['C-k'],
    handler: (terminal) => {
      terminal.term.clear();
    },
    passThrough: false,
  },
];

const screenIgnoreKeys = screenKeypressHandlers.flatMap(
  ({ keys, passThrough }) => (passThrough ? [] : keys),
);
const terminalIgnoreKeys = terminalKeypressHandlers.flatMap(
  ({ keys, passThrough }) => (passThrough ? [] : keys),
);

const terminals = commands.map(({ title, npmScript }) => {
  return new XTerm({
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
    left: 0,
    top: 0,
    width: screen.width,
    height: screen.height,
    label: title,
  });
});

for (const [index, terminal] of terminals.entries()) {
  let isRunning = true;

  for (const { keys, handler } of terminalKeypressHandlers) {
    terminal.key(keys, () => {
      handler(terminal);
    });
  }

  terminal.key('C-c', () => {
    // If this terminal has already finished and we press ctrl+c again, exit the whole thing
    if (!isRunning) {
      exit(0);
    }
  });

  terminal.on('exit', (code: number) => {
    isRunning = false;
    terminal.term.writeln('');
    terminal.term.writeln('Exited with status ' + code);
    terminal.term.writeln('Press ctrl+q to quit.');
    if (state.shuttingDown) {
      return;
    }
    state.shuttingDown = true;
    for (const [otherIndex, otherTerminal] of terminals.entries()) {
      if (otherIndex !== index) {
        otherTerminal.pty?.kill('SIGTERM');
      }
    }
  });

  layoutBox.append(terminal);
}

screen.append(topBox);
screen.append(bottomBox);
screen.append(layoutBox);

for (const { keys, handler } of screenKeypressHandlers) {
  screen.key(keys, handler);
}

screen.key(['C-q'], () => {
  exit(0);
});

updateLayoutAndRender();

function getHeaderText() {
  return commands
    .map(({ title }, index) => {
      const tabName = `(${index + 1}) ${title}`;
      const isToggled = state.shownTerminalIndexes.has(index);
      const style = isToggled ? `{white-fg}{underline}` : `{gray-fg}`;
      return `${style}${tabName}{/}`;
    })
    .join(' | ');
}

function incFocusedTerminal(num: number) {
  const focusedTerminal = terminals[state.focusedIndex];
  if (!focusedTerminal) {
    return;
  }
  const shownTerminals = getShownTerminals();
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
  state.focusedIndex = terminals.indexOf(shownTerminal);
}

function exit(status: number) {
  screen.destroy();
  process.exit(status);
}

function updateLayoutAndRender() {
  for (const terminal of terminals) {
    terminal.hide();
  }
  const terminalsToShow = terminals.filter((_, i) =>
    state.shownTerminalIndexes.has(i),
  );
  const numTerminals = terminalsToShow.length;
  const layouts = layoutsByPaneCount[numTerminals] ?? [];
  for (const [layoutIndex, terminal] of terminalsToShow.entries()) {
    const layout = layouts[layoutIndex];
    if (layout) {
      terminal.left = layout.left;
      terminal.top = layout.top;
      terminal.width = layout.width;
      terminal.height = layout.height;
      terminal.show();
    }
  }
  // Ensure that one of the visible terminals is focused
  incFocusedTerminal(0);
  terminals[state.focusedIndex]?.focus();
  topBox.setContent(getHeaderText());
  screen.render();
}

function getShownTerminals() {
  return terminals.filter((_, i) => state.shownTerminalIndexes.has(i));
}

function toggleVisibilityForPane(index: number) {
  if (index < 0 || index >= commands.length) {
    return;
  }
  const shownTerminalIndexes = state.shownTerminalIndexes;
  if (shownTerminalIndexes.has(index)) {
    shownTerminalIndexes.delete(index);
  } else {
    const existing = Array.from(shownTerminalIndexes);
    // Here we'll clear and reconstruct the set ensuring that the one we want makes it in, possibly taking the place of another
    shownTerminalIndexes.clear();
    shownTerminalIndexes.add(index);
    for (const i of existing) {
      if (shownTerminalIndexes.size < maxNumWindows) {
        shownTerminalIndexes.add(i);
      }
    }
  }
}
