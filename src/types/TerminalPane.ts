import type { Command } from './Command';
import type { XTerm } from './XTerm';

export type TerminalPane = {
  command: Command;
  terminal: XTerm;
  isRunning: boolean;
  isVisible: boolean;
};
