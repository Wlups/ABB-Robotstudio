import {Base_A} from './as-base.js';

export class Accessors_A extends Base_A {
  constructor(props = {}) {
    super(props);

    /**
     * @type {TComponents.Accessors_A}
     */
    this._props;
  }

  /**
   * Component label text
   * @alias label
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get label() {
    return this._props.label;
  }

  /**
   * Sets the component label text
   * @alias label
   * @memberof TComponents.Accessors_A
   * @param {string} text - The label text to set
   */
  set label(text) {
    this._props.label = text;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get height() {
    return this._props.height;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set height(n) {
    this.setProps({height: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get width() {
    return this._props.width;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set width(n) {
    this.setProps({width: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get top() {
    return this._props.top;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set top(n) {
    this.setProps({top: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get left() {
    return this._props.left;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set left(n) {
    this.setProps({left: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get zIndex() {
    return this._props.zIndex;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set zIndex(n) {
    this.setProps({zIndex: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get borderRadius() {
    return this._props.borderRadius;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set borderRadius(n) {
    this.setProps({borderRadius: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get rotation() {
    return this._props.rotation;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set rotation(n) {
    this.setProps({rotation: n});
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  get fontSize() {
    return this._props.font.fontSize;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set fontSize(n) {
    this.setProps({font: {fontSize: n}});
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get fontFamily() {
    return this._props.font.fontFamily;
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  set fontFamily(s) {
    this.setProps({font: {fontFamily: s}});
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get fontStyle() {
    return this._props.font.style.fontStyle;
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  set fontStyle(s) {
    this.setProps({font: {style: {fontStyle: s}}});
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get fontWeight() {
    return this._props.font.style.fontWeight;
  }

  /**
   * @type {number}
   * @memberof TComponents.Accessors_A
   */
  set fontWeight(n) {
    this.setProps({font: {style: {fontWeight: n}}});
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get textDecoration() {
    return this._props.font.style.textDecoration;
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  set textDecoration(s) {
    this.setProps({font: {style: {textDecoration: s}}});
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get backgroundColor() {
    return this._props.backgroundColor;
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  set backgroundColor(s) {
    this.setProps({backgroundColor: s});
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  get border() {
    return this._props.border;
  }

  /**
   * @type {string}
   * @memberof TComponents.Accessors_A
   */
  set border(s) {
    this.setProps({border: s});
  }

  /**
   * Set the hidden state of the component.
   * @alias hidden
   * @memberof TComponents.Accessors_A
   * @param {boolean} hide - True to hide the component, false to show it.
   */
  set hidden(hide) {
    hide ? this.hide() : this.show();
  }
}
