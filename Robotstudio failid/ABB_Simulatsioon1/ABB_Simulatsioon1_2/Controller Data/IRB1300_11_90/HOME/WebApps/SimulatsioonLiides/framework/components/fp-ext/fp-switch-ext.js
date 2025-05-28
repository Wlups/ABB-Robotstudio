export class FP_Switch_A extends FPComponents.Switch_A {
  constructor() {
    super();
  }

  get active() {
    return this._active;
  }

  set active(active) {
    if (this._root !== null) {
      if (active) {
        this._root.className = 'fp-components-switch-button fp-components-switch-button-active';
      } else {
        this._root.className = 'fp-components-switch-button';
      }
      if (!this._enabled) {
        this._root.className += ' fp-components-switch-button-disabled';
      }
    }
    this._active = active;
  }

  get scale() {
    return this._scale;
  }

  set scale(s) {
    this._scale = s;
  }

  handleClick() {
    console.log('Switch clicked!', this.enabled);

    if (this.enabled && this._onchange != null) {
      if (this._active === true) {
        this.active = false;
      } else {
        this.active = true;
      }
      this._onchange(this._active);
    }
  }

  rebuild() {
    if (this._anchor != null) {
      let divContainer = document.createElement('div');
      divContainer.className = 'fp-components-switch-container';

      let divOuter = document.createElement('div');
      divOuter.className = 'fp-components-switch-button-outer';

      let divKnob = document.createElement('div');
      divKnob.className = 'fp-components-switch-button-knob';

      divOuter.appendChild(divKnob);

      divContainer.onclick = () => this.handleClick();
      divContainer.appendChild(divOuter);

      this._container = divContainer;
      this._root = divOuter;
      this._knob = divKnob;

      if (this._desc !== null) {
        this._createDesc();
      }

      this._anchor.appendChild(this._container);

      this.active = this._active;
    }
  }
}
