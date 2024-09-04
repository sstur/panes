import type { Widgets } from 'blessed';
import type { IPty } from 'node-pty';
import type XTermJS from 'xterm';

interface BasicStyle {
  fg?: string;
  bg?: string;
}

interface XTermOptions extends Widgets.BoxOptions {
  shell?: string;
  args?: Array<string>;
  env?: Record<string, string | undefined>;
  cwd?: string;
  cursorType?: 'block' | 'underline' | 'line';
  scrollback?: number | 'none';
  controlKey?: string;
  ignoreKeys?: Array<string>;
  mousePassthrough?: boolean;
  style?: BasicStyle & {
    label?: BasicStyle;
    border?: BasicStyle;
    focus?: {
      label?: BasicStyle;
      border?: BasicStyle;
    };
    scrolling?: {
      label?: BasicStyle;
      border?: BasicStyle;
    };
  };
}

export interface XTerm extends Widgets.BoxElement {
  options: XTermOptions;
  term: XTermJS;
  pty: IPty | null;
  scrolling: boolean;

  get width(): number;
  set width(width: number | string);

  get height(): number;
  set height(height: number | string);

  injectInput(input: string): void;
  write(output: string): void;
  spawn(shell: string, args: Array<string>, cwd?: string, env?: object): void;
  terminate(): void;
  kill(): void;
}

export interface XTermConstructor {
  new (options?: XTermOptions): XTerm;
}
