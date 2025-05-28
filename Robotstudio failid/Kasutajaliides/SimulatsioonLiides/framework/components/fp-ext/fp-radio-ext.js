export class FP_Radio_A extends FPComponents.Radio_A {
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
  _createDesc() {
    let divdesc = document.createElement('span');
    divdesc.className = 'fp-components-radio-desc';
    divdesc.textContent = this._desc;
    divdesc.style.cssText = `
        color:${this.color};
        font-family:${this.font.fontFamily};
        font-size: ${this.font.fontSize}px;
        font-weight:${this.font.style.fontWeight};
        font-style: ${this.font.style.fontStyle};
        text-decoration: ${this.font.style.textDecoration};
    `;
    this._container.appendChild(divdesc);
    this._descDiv = divdesc;
  }
}
