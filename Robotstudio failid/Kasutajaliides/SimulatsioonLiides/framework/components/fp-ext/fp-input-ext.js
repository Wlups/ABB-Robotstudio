export class FP_Input_A extends FPComponents.Input_A {
  constructor() {
    super();
    this._border = '1px groove #ccc';
  }

  set border(t) {
    this._border = t;
  }

  get border() {
    return this._border;
  }

  rebuild() {
    let divContainer = document.createElement('div');
    divContainer.className = 'fp-components-input-container';
    let divField = document.createElement('div');
    let pText = document.createElement('p');
    pText.textContent = this._text;
    divField.appendChild(pText);
    divContainer.appendChild(divField);
    divField.onclick = () => {
      if (this._enabled === true) {
        this._root.style.borderColor = 'rgb(0,120,215)';
        /* global fpComponentsKeyboardShow */
        fpComponentsKeyboardShow(
          (result) => {
            this._root.style.borderColor = null;
            if (result !== null) {
              this.text = result;
              if (this._onchange !== null && typeof this._onchange === 'function') {
                this._onchange(this._text);
              }
              this._root.style.border = this._border;
            }
          },
          this._text,
          this._label,
          this._variant,
          this._regex,
          this._validator,
        );
      }
    };
    this._container = divContainer;
    this._root = divField;
    if (this._desc !== null) {
      this._createDesc();
    }
    this._updateClassNames();
    this._anchor.appendChild(divContainer);
  }
}
