import type { Command } from '../types/Command';

export function parseArgs(args: Array<string>) {
  const commands: Array<Command> = [];
  for (let arg of args) {
    const isHidden = arg.endsWith('!');
    if (isHidden) {
      arg = arg.slice(0, -1);
    }
    let title = '';
    const npmScript = arg.replace(/\[(.*?)\]$/, (_, str) => {
      title = str;
      return '';
    });
    commands.push({
      title: title || npmScript,
      npmScript,
      initiallyVisible: !isHidden,
    });
  }
  return commands;
}
