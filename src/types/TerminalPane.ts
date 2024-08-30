import type { XTerm } from '../support/blessed-xterm';

export type TerminalPane = {
  title: string;
  terminal: XTerm;
  isRunning: boolean;
  isVisible: boolean;
};
