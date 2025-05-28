export class FP_Digital_A extends FPComponents.Digital_A {
  constructor() {
    super();
    this._enabled = true;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(e) {
    this._enabled = e ? true : false;
    this._updateClassNames();
  }

  _updateClassNames() {
    if (this._root !== null) {
      this._root.className = 'fp-components-digital-a';
      if (this._active) {
        this._root.className += ' fp-components-digital-a-active';
      }
      if (!this._enabled) {
        this._root.className += ' fp-components-digital-a-disabled';
      }
      if (this._highlight) {
        this._root.className += ' fp-components-digital-a-highlight';
      }
    }
  }
}
