import {Component_A} from './basic/as-component.js';
import {imgDefaultPng} from './style/img/images.js';
import {FP_Image_A} from './fp-ext/fp-img-ext.js';
import {Popup_A} from './as-popup.js';

/**
 * Image component that can display an image with specific styles and handle events.
 * @class TComponents.Image
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ImageProps} [props]
 * @property {TComponents.ImageProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="img-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const imgComponent = new Image(document.querySelector('.img-container'), {
 *   imgSrc: 'path/to/image.png',
 *   imgStyle: { objectFit: 'cover' },
 *   onClick: () => {
 *     console.log('Image clicked');
 *   }
 * });
 */
export class Image extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {FP_Image_A}
     * @private
     */
    this._img = new FP_Image_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Image
   * @returns {TComponents.ImageProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',

      // imgObj: {label: imgDefaultPng, value: 'default'},
      imgSrc: imgDefaultPng,
      imgStyle: {objectFit: 'fill'},
      // imgFillStyle: 'fill',
      onClick: '',
      // ⭐ W/H/X/Y/B/R/Z: Component required attributes.
      position: 'static',
      width: 146,
      height: 106,
      top: 0,
      left: 0,
      zIndex: 0,
    };
  }

  /**
   * Generates the HTML markup for the component.
   * @alias markup
   * @memberof TComponents.Image
   * @returns {string} The HTML markup string
   */
  markup() {
    return /*html*/ `<div class="tc-img"></div>`;
  }

  /**
   * Handles the rendering process of the component, including setting up event listeners and applying image properties.
   * @alias onRender
   * @memberof TComponents.Image
   */
  onRender() {
    this.removeAllEventListeners();

    this._img.src = this._evalImgSrc();
    this._img.fit = this._props.imgStyle.objectFit;

    if (this._props.onClick) {
      const fn = Component_A.genFuncTemplate(this._props.onClick, this);
      if (fn) this._img.onclick = fn;
    }

    const imgContainer = this.find('.tc-img');
    if (imgContainer) this._img.attachToElement(imgContainer);
  }

  /**
   * Evaluates and retrieves the source of the image.
   * If the `imgSrc` property references a global variable, it returns the value of that variable.
   * Otherwise, it returns the original `imgSrc` property value.
   *
   * @returns {string} The evaluated image source.
   * @memberof TComponents.Image
   */
  _evalImgSrc() {
    try {
      const imgSrc = window[this._props.imgSrc];
      if (typeof imgSrc == 'string') return imgSrc;
      else return this._props.imgSrc;
    } catch (e) {
      Popup_A.error(e, 'TComponents.Image');
    }
  }

  /**
   * Gets the source of the image.
   * @type {string}
   * @memberof TComponents.Image
   */
  get imgSrc() {
    return this._props.imgSrc;
  }

  /**
   * Sets the source of the image.
   * @param {string} s - The source URL of the image
   * @memberof TComponents.Image
   */
  set imgSrc(s) {
    this.setProps({imgSrc: s});
  }

  /**
   * Gets the style of the image.
   * @type {Object}
   * @memberof TComponents.Image
   */
  get imgStyle() {
    return this._props.imgStyle;
  }

  /**
   * Sets the style of the image.
   * @param {Object} s - The style object for the image
   * @memberof TComponents.Image
   */
  set imgStyle(s) {
    this.setProps({imgStyle: s});
  }

  /**
   * Gets the click event handler.
   * @memberof TComponents.Image
   * @type {function|null}
   * @readonly
   * @returns {function|null} The current click handler.
   */
  get onClick() {
    const fn = Component_A.genFuncTemplate(this._props.onClick, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the click event handler.
   * @memberof TComponents.Image
   * @param {function} t - The new click handler function.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * Image_1.onClick = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * Image_1.onClick = (...args) => { console.log(args); }
   */
  set onClick(t) {
    this.setProps({onClick: t});
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Image.loadCssClassFromString(`
  .tc-img {
    height: inherit;
    width: inherit;
    min-width: 0px;
    min-height: 0px;
    padding: 0px;
    margin: 0px;
    display:grid;
  }
   
  .tc-img:not(.float) {
    min-width: 0px;
    min-height: 0px;
  }



   
  .tc-img .fp-components-img-disabled,
  .tc-img .fp-components-img {
    height: 100%;
    width: 100%;
    padding: 0px;
    margin: 0px;
    min-width: 0px;
    min-height: 0px;
  }
  .tc-img .fp-components-img-disabled{
    cursor: not-allowed !important;
  }
  .tc-img .fp-components-img:hover{
    opacity:0.7;
  }




  `);
