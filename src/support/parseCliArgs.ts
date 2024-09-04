import type { AppInitOptions } from '../types/AppInitOptions';

export function parseCliArgs(args: Array<string>): AppInitOptions {
  const options: AppInitOptions = {
    commands: [],
  };
  const { commands } = options;
  const remainingArgs = args.slice(0);
  while (remainingArgs.length > 0) {
    let arg = remainingArgs.shift() ?? '';
    if (arg === '-h' || arg === '--help') {
      options.displayHelp = true;
      continue;
    }
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
      parts: ['npm', 'run', npmScript],
      initiallyVisible: !isHidden,
    });
  }
  return options;
}
