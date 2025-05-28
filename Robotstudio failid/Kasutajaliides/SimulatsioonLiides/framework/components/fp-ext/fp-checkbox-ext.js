export class FP_Checkbox_A extends FPComponents.Checkbox_A {
  constructor() {
    super();
    this._color = '#ffffff';
    this._backgroundColor = '#3366ff';
    this._font = {
      fontSize: 12,
      fontFamily: 'Segoe UI',
      style: {
        fontStyle: 'normal',
        fontWeight: 'normal',
        textDecoration: 'none',
      },
    };
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(e) {
    this._enabled = e ? true : false;
    this._updateClassNames();
  }

  get checked() {
    return this._checked;
  }

  set checked(c) {
    this._checked = c ? true : false;
    this._updateClassNames();
  }

  get font() {
    return this._font;
  }

  set font(t) {
    this._font = t;
  }

  get color() {
    return this._color;
  }

  set color(t) {
    this._color = t;
  }

  _createDesc(parent) {
    const divdesc = document.createElement('div');
    divdesc.className = 'fp-components-checkbox-desc';
    divdesc.textContent = this._desc;
    divdesc.style.cssText = `
        color:${this._color};
        font-family:${this._font.fontFamily};
        font-size: ${this._font.fontSize}px;
        font-weight:${this._font.style.fontWeight};
        font-style: ${this._font.style.fontStyle};
        text-decoration: ${this._font.style.textDecoration};`;
    parent.appendChild(divdesc);
    this._descDiv = divdesc;
  }
}
