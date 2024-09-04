import { readFile } from 'fs/promises';
import { resolve } from 'path';

import type { Command } from '../types/Command';

const packageJsonPath = resolve(process.cwd(), 'package.json');

export async function validateCommands(commands: Array<Command>) {
  const rawJson = await readFile(packageJsonPath, 'utf-8');
  const packageJson = toObject(JSON.parse(rawJson));
  const scripts = toObject(packageJson.scripts);
  for (const { parts } of commands) {
    if (parts.length === 3) {
      const [npm, run, script] = parts;
      if (npm === 'npm' && run === 'run' && script) {
        if (Object.hasOwn(scripts, script)) {
          continue;
        }
      }
    }
    throw new Error(`Invalid command: ${parts.join(' ')}`);
  }
}

function toObject(value: unknown): Record<string, unknown> {
  return Object(value);
}
