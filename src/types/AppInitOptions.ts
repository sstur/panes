import type { Command } from './Command';

export type AppInitOptions = {
  displayHelp?: boolean;
  commands: Array<Command>;
};
