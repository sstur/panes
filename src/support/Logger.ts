export class Logger {
  private _log: Array<Array<unknown>>;

  constructor() {
    this._log = [];
  }

  log(...args: Array<unknown>) {
    this._log.push(args);
  }

  dump() {
    for (const args of this._log) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
    this._log.length = 0;
  }
}
