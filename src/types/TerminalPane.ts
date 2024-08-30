import type { XTerm } from '../support/blessed-xterm';
import type { Command } from './Command';

export type TerminalPane = {
  command: Command;
  terminal: XTerm;
  isRunning: boolean;
  isVisible: boolean;
};
