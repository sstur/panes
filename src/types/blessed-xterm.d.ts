declare module 'blessed-xterm' {
  import type { XTermConstructor } from './XTerm';

  const XTerm: XTermConstructor;

  export = XTerm;
}
