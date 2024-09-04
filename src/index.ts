import { App } from './App';
import { parseCliArgs } from './support/parseCliArgs';
import { validateCommands } from './support/validateCommands';

export async function run(args: Array<string>) {
  const init = parseCliArgs(args);
  try {
    await validateCommands(init.commands);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(String(error));
    process.exit(1);
  }
  App.create(init);
}

export { App };
