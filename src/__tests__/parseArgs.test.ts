import { parseArgs } from '../support/parseArgs';

describe('parseArgs', () => {
  it('should handle empty input', () => {
    const result = parseArgs([]);
    expect(result).toEqual([]);
  });

  it('should parse a simple npm script', () => {
    const result = parseArgs(['test']);
    expect(result).toEqual([
      { title: 'test', npmScript: 'test', initiallyVisible: true },
    ]);
  });

  it('should parse with initially hidden indicator', () => {
    const result = parseArgs(['test!']);
    expect(result).toEqual([
      { title: 'test', npmScript: 'test', initiallyVisible: false },
    ]);
  });

  it('should parse a script with a custom title', () => {
    const result = parseArgs(['dev:mobile[Mobile Dev]']);
    expect(result).toEqual([
      { title: 'Mobile Dev', npmScript: 'dev:mobile', initiallyVisible: true },
    ]);
  });

  it('should parse multiple scripts', () => {
    const result = parseArgs(['test', 'dev:mobile[Mobile Dev]!', 'foo!']);
    expect(result).toEqual([
      { title: 'test', npmScript: 'test', initiallyVisible: true },
      { title: 'Mobile Dev', npmScript: 'dev:mobile', initiallyVisible: false },
      { title: 'foo', npmScript: 'foo', initiallyVisible: false },
    ]);
  });
});
