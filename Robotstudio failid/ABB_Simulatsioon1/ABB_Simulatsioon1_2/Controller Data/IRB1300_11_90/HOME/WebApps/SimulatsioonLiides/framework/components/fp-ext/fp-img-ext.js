export class FP_Image_A {
  constructor() {
    this._anchor = null;
    this._root = null;
    this._enabled = true;
    this._highlight = false;

    this._url = '';
    this._objectFit = '';

    this.onclick = null;
  }

  _updateClassNames() {
    if (this._root !== null) {
      this._root.className = this._enabled === true ? 'fp-components-img' : 'fp-components-img-disabled';
      if (this._highlight) {
        this._root.className += ' fp-components-img-highlight';
      }
    }
  }

  attachToElement(element) {
    this._anchor = element;
    return this.rebuild();
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(e) {
    this._enabled = e ? true : false;
    this._updateClassNames();
  }

  set src(url) {
    this._url = url;
  }

  get src() {
    return this._url;
  }

  set fit(fit) {
    this._objectFit = fit;
  }

  get fit() {
    return this._objectFit;
  }

  get onclick() {
    return this._onclick;
  }

  set onclick(fn) {
    this._onclick = fn;
  }

  rebuild() {
    let img = document.createElement('img');
    img.style.objectFit = this.fit;
    img.setAttribute('src', this.src);
    img.setAttribute('ondragstart', 'return false');

    this._root = img;
    this._updateClassNames();
    this._anchor.appendChild(img);

    if (this._onclick) {
      this._root.onclick = () => {
        this._onclick();
      };
    }
  }
}
