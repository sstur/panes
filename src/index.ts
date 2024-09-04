import { App } from './App';
import { parseCliArgs } from './support/parseCliArgs';

export function run(args: Array<string>) {
  const init = parseCliArgs(args);
  App.create(init);
}

export { App };
