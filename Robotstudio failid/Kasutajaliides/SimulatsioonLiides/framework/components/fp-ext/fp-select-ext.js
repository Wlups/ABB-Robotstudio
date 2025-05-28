export class FP_Select_A {
  constructor() {
    this._anchor = null;
    this._root = null;
    this._enabled = true;
    this._highlight = false;
    this._options = [];
    this._helperText = 'This is a selector';
    this._placeHolder = 'Please select...';
    this._label = 'label';
    this._props = {};
  }

  get props() {
    return this._props;
  }

  set props(t) {
    this._props = t;
  }

  get items() {
    return this._options;
  }

  set items(array) {
    this._options = array;
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

  get highlight() {
    return this._highlight;
  }

  set highlight(h) {
    this._highlight = h ? true : false;
    this._updateClassNames();
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
      this._root.className = this._enabled === true ? 'fp-components-select' : 'fp-components-select-disabled';
      if (this._highlight) {
        this._root.className += ' fp-components-select-highlight';
      }
      this._root.disabled = !this._enabled;
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
    const select = document.createElement('select');
    select.style.cssText = `
        color:${this._props.color};
        font-family: ${this._props.font.fontFamily};
        font-size: ${this._props.font.fontSize}px;
        font-weight: ${this._props.font.style.fontWeight};
        font-style: ${this._props.font.style.fontStyle};
        text-decoration: ${this._props.font.style.textDecoration};
        text-align: ${this._props.font.textAlign};
        border: ${this._props.border};
        border-radius: ${this._props.borderRadius}px;
    `;

    this.items.forEach((option, index) => {
      let op = document.createElement('option');
      op.text = typeof option.text == 'string' ? option.text : 'option1';
      if (!op.text) op.innerHTML = '&nbsp;';
      op.value = typeof option.value == 'string' ? option.value : 'value1';
      op.selected = index === this._props.selectedIndex;
      select.appendChild(op);
    });

    this._root = select;

    this._updateClassNames();
    this._anchor.appendChild(this._root);
  }
}
