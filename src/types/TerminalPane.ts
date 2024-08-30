import type { XTerm } from 'blessed-xterm';

export type TerminalPane = {
  title: string;
  terminal: XTerm;
  isRunning: boolean;
  isVisible: boolean;
};
