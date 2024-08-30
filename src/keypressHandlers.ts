import type { App } from './App';
import type { TerminalPane } from './types/TerminalPane';

type KeypressHandler<HandlerArgs extends Array<unknown>> = {
  keys: Array<string>;
  handler: (...args: HandlerArgs) => void;
  passThrough: boolean;
};

export const screenKeypressHandlers: Array<KeypressHandler<[app: App]>> = [
  {
    keys: ['M-left', 'M-b'],
    handler: (app) => {
      app.incFocusedTerminal(-1);
    },
    passThrough: false,
  },
  {
    keys: ['M-right', 'M-f'],
    handler: (app) => {
      app.incFocusedTerminal(1);
    },
    passThrough: false,
  },
  {
    keys: ['M-1', '\u00a1'],
    handler: (app) => {
      app.toggleVisibilityForPane(0);
    },
    passThrough: false,
  },
  {
    keys: ['M-2', '\u2122'],
    handler: (app) => {
      app.toggleVisibilityForPane(1);
    },
    passThrough: false,
  },
  {
    keys: ['M-3', '\u00a3'],
    handler: (app) => {
      app.toggleVisibilityForPane(2);
    },
    passThrough: false,
  },
  {
    keys: ['M-4', '\u00a2'],
    handler: (app) => {
      app.toggleVisibilityForPane(3);
    },
    passThrough: false,
  },
  {
    keys: ['M-5', '\u221e'],
    handler: (app) => {
      app.toggleVisibilityForPane(4);
    },
    passThrough: false,
  },
  {
    keys: ['M-6', '\u00a7'],
    handler: (app) => {
      app.toggleVisibilityForPane(5);
    },
    passThrough: false,
  },
  {
    keys: ['M-7', '\u00b6'],
    handler: (app) => {
      app.toggleVisibilityForPane(6);
    },
    passThrough: false,
  },
  {
    keys: ['M-8', '\u2022'],
    handler: (app) => {
      app.toggleVisibilityForPane(7);
    },
    passThrough: false,
  },
  {
    keys: ['M-9', '\u00aa'],
    handler: (app) => {
      app.toggleVisibilityForPane(8);
    },
    passThrough: false,
  },
  {
    keys: ['M-0', '\u00ba'],
    handler: (app) => {
      app.toggleVisibilityForPane(9);
    },
    passThrough: false,
  },
];

export const terminalKeypressHandlers: Array<
  KeypressHandler<[app: App, terminal: TerminalPane]>
> = [
  {
    keys: ['pagedown'],
    handler: (app, { terminal }) => {
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
    handler: (app, { terminal }) => {
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
    handler: (app, { terminal }) => {
      terminal.term.clear();
    },
    passThrough: false,
  },
];
