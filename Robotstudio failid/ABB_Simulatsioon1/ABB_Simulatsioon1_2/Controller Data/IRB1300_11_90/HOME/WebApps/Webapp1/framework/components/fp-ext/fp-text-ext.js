export class FP_Text_A {
  constructor() {
    this._anchor = null;
    this._root = null;
    this._divText = null;
    this._icon = null;
    this._enabled = true;
    this._text = '';
    this._highlight = false;
    this._color = '#000000';
    this._backgroundColor = '#ffffff';
    this._textType = 'body';
    this._borderRadius = 16;
    this._font = {
      font: {
        fontSize: 12,
        fontFamily: '',
        style: {
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
        },
        textAlign: 'left',
      },
    };
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

  get parent() {
    return this._anchor;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(e) {
    this._enabled = e ? true : false;
    this._updateClassNames();
  }

  get text() {
    return this._text;
  }

  set text(t) {
    this._text = t;
    if (this._divText !== null) {
      this._divText.textContent = t;
    }
  }

  get font() {
    return this._font;
  }

  set font(t) {
    this._font = t;
  }

  get textType() {
    return this._textType;
  }

  set textType(t) {
    this._textType = t;
  }

  get highlight() {
    return this._highlight;
  }

  set highlight(h) {
    this._highlight = h ? true : false;
    this._updateClassNames();
  }

  get borderRadius() {
    return this._borderRadius;
  }

  set borderRadius(t) {
    this._borderRadius = t;
  }

  _urlEncode(url) {
    const urlItems = url.split('/');
    const escapedItems = [];
    for (const item of urlItems) {
      escapedItems.push(encodeURIComponent(item));
    }
    return escapedItems.join('/');
  }

  _updateClassNames() {
    if (this._root !== null) {
      this._root.className = this._enabled === true ? 'fp-components-text' : 'fp-components-text-disabled';
      if (this._highlight) {
        this._root.className += ' fp-components-text-highlight';
      }
    }
  }

  attachToId(nodeId) {
    let element = document.getElementById(nodeId);
    if (element === null) {
      return false;
    }

    return this.attachToElement(element);
  }

  attachToElement(element) {
    this._anchor = element;
    return this.rebuild();
  }

  rebuild() {
    let divWrap = document.createElement('div');
    let divText = document.createElement('span');
    divText.className = 'fp-components-text-content';

    if (typeof this._text == 'number') {
      divText.innerHTML = this._text;
    } else {
      divText.innerHTML = this._text.replace(/\n/g, '<br>');
    }

    const alignMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    };

    divWrap.style.cssText = `
        border-radius: ${this.borderRadius}px;
        line-height: ${this.fontSize * 1.5}px;
        background-color: ${this.backgroundColor};
        font-family: ${this.font.fontFamily};
        font-size: ${this.font.fontSize}px;
        font-style: ${this.font.style.fontStyle};
        font-weight: ${this.font.style.fontWeight};
        text-decoration: ${this.font.style.textDecoration};
        color: ${this.color};
        justify-content: ${alignMap[this.font.textAlign]}`;

    divWrap.appendChild(divText);
    this._root = divWrap;
    this._divText = divText;

    this._updateClassNames();
    this._anchor.appendChild(divWrap);
  }
}
