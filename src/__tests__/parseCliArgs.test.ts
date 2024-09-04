import { parseCliArgs } from '../support/parseCliArgs';

describe('parseArgs', () => {
  it('should handle empty input', () => {
    const { commands } = parseCliArgs([]);
    expect(commands).toEqual([]);
  });

  it('should parse a simple npm script', () => {
    const { commands } = parseCliArgs(['test']);
    expect(commands).toEqual([
      { title: 'test', parts: ['npm', 'run', 'test'], initiallyVisible: true },
    ]);
  });

  it('should parse with initially hidden indicator', () => {
    const { commands } = parseCliArgs(['test!']);
    expect(commands).toEqual([
      { title: 'test', parts: ['npm', 'run', 'test'], initiallyVisible: false },
    ]);
  });

  it('should parse a script with a custom title', () => {
    const { commands } = parseCliArgs(['dev:mobile[Mobile Dev]']);
    expect(commands).toEqual([
      {
        title: 'Mobile Dev',
        parts: ['npm', 'run', 'dev:mobile'],
        initiallyVisible: true,
      },
    ]);
  });

  it('should parse multiple scripts', () => {
    const { commands } = parseCliArgs([
      'test',
      'dev:mobile[Mobile Dev]!',
      'foo!',
    ]);
    expect(commands).toEqual([
      { title: 'test', parts: ['npm', 'run', 'test'], initiallyVisible: true },
      {
        title: 'Mobile Dev',
        parts: ['npm', 'run', 'dev:mobile'],
        initiallyVisible: false,
      },
      { title: 'foo', parts: ['npm', 'run', 'foo'], initiallyVisible: false },
    ]);
  });
});
