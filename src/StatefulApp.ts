export class StatefulApp<State extends Record<string, unknown>> {
  private _state: State;
  private _onUpdate: (oldState: State, newState: State) => void;

  constructor(
    initialState: State,
    onUpdate: (oldState: State, newState: State) => void,
  ) {
    this._state = initialState;
    this._onUpdate = onUpdate;
  }

  get state() {
    return this._state;
  }

  setState(updates: Partial<State>) {
    const oldState = this._state;
    const newState = { ...oldState, ...updates };
    this._state = newState;
    this._onUpdate(oldState, newState);
  }
}
