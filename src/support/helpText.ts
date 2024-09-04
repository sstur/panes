export const helpText = `
Usage:
  npx panes script-1 script-2

Note: Each script must exist in package.json in the current directory.

Specify a title for a script by enclosing it in square brackets:
  npx panes 'frontend[My Frontend]' 'backend[My Backend]'

Add a trailing ! to make a script be hidden by default:
  npx panes 'frontend[My Frontend]' 'backend[My Backend]!'

Options:
  -h, --help  Show help
`.trim();
