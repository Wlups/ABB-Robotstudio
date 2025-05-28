export class FP_Button_A extends FPComponents.Button_A {
  constructor() {
    super();
    this._borderRadius = 16;
    this._border = '1px solid transparent';
    this._color = '#ffffff';
    this._backgroundColor = '#3366ff';
    this._icon = '';
    this._font = {
      fontSize: 12,
      fontFamily: '',
      style: {
        fontStyle: 'normal',
        fontWeight: 'normal',
        textDecoration: 'none',
      },
    };
  }

  get icon() {
    return this._icon;
  }

  set icon(t) {
    this._icon = t;
  }

  get border() {
    return this._border;
  }

  set border(string) {
    this._border = string;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(string) {
    this._backgroundColor = string;
  }

  get color() {
    return this._color;
  }

  set color(string) {
    this._color = string;
  }

  get borderRadius() {
    return this._borderRadius;
  }

  set borderRadius(t) {
    this._borderRadius = t;
  }

  get font() {
    return this._font;
  }

  set font(t) {
    this._font = t;
  }

  _addIcon() {
    if (this._root && this.icon) {
      if (this.icon.startsWith('abb-icon')) {
        this._divIcon = document.createElement('i');
        this._divIcon.className = `fp-components-button-icon-font ${this.icon}`;
        this._root.prepend(this._divIcon);

        this._divIcon.style.cssText = `
          color:${this.color};
          font-size: ${this.font.fontSize}px;
          font-weight:${this.font.style.fontWeight};
        `;
      } else {
        this._divIcon = document.createElement('div');
        this._divIcon.style.backgroundImage = `url("${this._urlEncode(this._icon)}")`;
        this._divIcon.className = 'fp-components-button-icon-image';
        this._root.prepend(this._divIcon);
      }
    }
  }

  rebuild() {
    let divButton = document.createElement('div');
    divButton.style.cssText = `
          border-radius:${this.borderRadius}px;
          color:${this.color};
          border:${this.border};
          background-color:${this.backgroundColor};
          font-family:${this.font.fontFamily};
          font-size: ${this.font.fontSize}px;
          font-weight:${this.font.style.fontWeight};
          font-style: ${this.font.style.fontStyle};
          text-decoration: ${this.font.style.textDecoration};
        `;

    if (this.text !== '') {
      let divText = document.createElement('span');
      divText.className = 'fp-components-button-text';
      divText.textContent = this.text;
      divButton.appendChild(divText);
      this._divText = divText;
    }

    // state error.
    // divButton.onclick = () => {
    //   if (this._onclick !== null && this._enabled === true) {
    //     this._onclick();
    //   }
    // };

    this._root = divButton;

    if (this._icon) {
      this._addIcon();
    }

    this._updateClassNames();
    this._anchor.appendChild(divButton);
  }
}
