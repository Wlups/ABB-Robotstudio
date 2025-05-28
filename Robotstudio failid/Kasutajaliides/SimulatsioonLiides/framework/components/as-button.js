import {Component_A} from './basic/as-component.js';
import {FP_Button_A} from './fp-ext/fp-button-ext.js';
import {Popup_A} from './as-popup.js';
/**
 * @typedef TComponents.ButtonProps
 * @prop {Function} [onClick] Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [text] Button text
 */

/**
 * Rounded button that triggers a callback when pressed. Additional callbacks can be added with the {@link TComponents.Button#onClick|onClick} method.
 * @class TComponents.Button
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonProps} [props]
 * @property {ButtonProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const btnExecute = new Button(document.querySelector('.btn-container'), {
 *     onClick: () => {
 *       console.log('execute');
 *     },
 *     text: 'Execute',
 *   });
 */
export class Button extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonProps}
     */
    this._props;

    this._btn = new FP_Button_A();

    this._mouseState = '';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Button
   * @returns {TComponents.ButtonProps}
   */
  defaultProps() {
    return {
      tips: '',
      // life cycle
      onCreated: '',
      onMounted: '',

      onClick: '',
      onPointerRelease: '',
      onPointerDown: '',

      icon: null,
      // ⭐ W/H/X/Y/B/R/Z: Component required attributes.
      position: 'static',
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      borderRadius: 16,
      rotation: 0,
      zIndex: 0,
      // Font
      text: 'Button',
      color: '#ffffff',
      // font
      font: {
        fontSize: 12,
        fontFamily: 'Segoe UI',
        style: {
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
        },
      },
      // Background
      backgroundColor: '#3366ff',
      //  Border
      border: '1px solid transparent',
      // Function
      functionality: {type: '', params: '', isHidden: false},
      // Style.
      size: '',
      styleTemplate: '',
    };
  }

  /**
   * Initialization function for the button component.
   * @async
   */
  async onInit() {}

  /**
   * Click event handler.
   * @alias _onClick
   * @memberof TComponents.Button
   * @async
   */
  async _onClick() {
    console.log('button-click', this.enabled);
    if (this.enabled && this._props.onClick) {
      const fn = Component_A.genFuncTemplate(this._props.onClick, this);
      if (typeof fn == 'function') fn();
    }
  }

  /**
   * Pointer down event handler.
   * @alias onPointerDown
   * @memberof TComponents.Button
   * @async
   */
  async _onPointerDown() {
    if (this.enabled && this._props.onPointerDown) {
      const fn = Component_A.genFuncTemplate(this._props.onPointerDown, this);
      if (typeof fn == 'function') fn();
    }
    this._mouseState = 'down';
  }

  /**
   * Pointer up/leave event handler.
   * @alias onPointerRelease
   * @memberof TComponents.Button
   * @async
   */
  async _onPointerRelease() {
    if (this.enabled && this._props.onPointerRelease) {
      const fn = Component_A.genFuncTemplate(this._props.onPointerRelease, this);
      if (typeof fn == 'function' && this._mouseState == 'down') fn();
    }
    this._mouseState = 'up';
  }

  /**
   * Shows the tooltip when mouse enters.
   * @memberof TComponents.Button
   */
  _enterTip() {
    if (!this.enabled) {
      const tips = document.createElement('div');
      tips.classList.add('t-component-tips');
      tips.textContent = this._props.tips;
      this.container.appendChild(tips);
    }
  }

  /**
   * Hides the tooltip when mouse leaves.
   * @memberof TComponents.Button
   */
  _leaveTip() {
    if (!this.enabled) {
      const tips = this.container.querySelectorAll('.t-component-tips');
      if (tips) tips.forEach((tip) => tip.remove());
    }
  }

  /**
   * Adds event listeners for the tooltip.
   * @memberof TComponents.Button
   */
  _addTips() {
    if (this._props.tips) {
      this.addEventListener(this._btn._root, 'mouseenter', this._enterTip.bind(this));
      this.addEventListener(this._btn._root, 'mouseleave', this._leaveTip.bind(this));
    }
  }

  /**
   * Renders the button component.
   * @memberof TComponents.Button
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      if (this._props.labelPos === 'left' || this._props.labelPos === 'right') {
        this.container.classList.add('justify-stretch');
      }

      //Remind:这里看上去每次updateProps之后都会触发一次重新动态计算文本
      //那么对于订阅的变量，会不会循环增加callback？
      //不会，因为每次解析updateProps之后，this._props都会变成纯文本，再次dynamicText的时候，不会触发二次订阅
      //TODO：后续考虑将这个逻辑提到外层去执行，和conditionProcessing一样
      this._btn.text = Component_A.dynamicText(this._props.text, this);
      this._btn.icon = this._props.icon;
      this._btn.borderRadius = this._props.borderRadius;
      this._btn.color = this._props.color;
      this._btn.backgroundColor = this._props.backgroundColor;
      this._btn.border = this._props.border;
      this._btn.font = this._props.font;

      const btnContainer = this.find('.tc-button');
      if (btnContainer) this._btn.attachToElement(btnContainer);

      this.addEventListener(this._btn._root, 'click', this._onClick.bind(this));
      this.addEventListener(this._btn._root, 'pointerdown', this._onPointerDown.bind(this));
      this.addEventListener(this._btn._root, 'pointerup', this._onPointerRelease.bind(this));
      this.addEventListener(this._btn._root, 'pointerleave', this._onPointerRelease.bind(this));

      this._addTips();
    } catch (e) {
      Popup_A.error(e, 'TComponents.Button');
    }
  }

  /**
   * Returns the markup for the button component.
   * @memberof TComponents.Button
   * @returns {string} HTML markup string.
   */
  markup() {
    return /*html*/ `<div class="tc-button"></div>`;
  }

  /**
   * Gets the highlight state of the button.
   * @memberof TComponents.Button
   * @type {boolean}
   * @readonly
   * @returns {boolean} The current highlight state.
   */
  get highlight() {
    return this._btn.highlight;
  }

  /**
   * Sets the highlight state of the button.
   * @memberof TComponents.Button
   * @param {boolean} value - The new highlight state.
   */
  set highlight(value) {
    this._btn.highlight = value;
  }

  /**
   * Gets the icon path.
   * @memberof TComponents.Button
   * @type {string|null}
   */
  get icon() {
    return this.props.icon;
  }

  /**
   * Sets the icon path.
   * @memberof TComponents.Button
   * @param {string|null} s
   */
  set icon(s) {
    this.setProps({icon: s});
  }

  /**
   * Gets the button text.
   * @memberof TComponents.Button
   * @type {string}
   */
  get text() {
    return this._props.text;
  }

  /**
   * Sets the button text.
   * @memberof TComponents.Button
   * @param {string} value
   */
  set text(value) {
    this.setProps({text: value});
  }

  /**
   * Gets the click event handler for the button.
   * @memberof TComponents.Button
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
   * Sets the click event handler for the button.
   * @memberof TComponents.Button
   * @param {function} t - The new click handler function.
   */
  set onClick(t) {
    this.setProps({onClick: t});
  }

  /**
   * Gets the pointer release event handler for the button.
   * @memberof TComponents.Button
   * @type {function|null}
   * @returns {function|null} The current pointer release handler.
   */
  get onPointerRelease() {
    const fn = Component_A.genFuncTemplate(this._props.onPointerRelease, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the pointer release event handler for the button.
   * @memberof TComponents.Button
   * @param {function} t - The new pointer release handler function.
   */
  set onPointerRelease(t) {
    this.setProps({onPointerRelease: t});
  }

  /**
   * Gets the pointer down event handler for the button.
   * @memberof TComponents.Button
   * @type {function|null}
   * @returns {function|null} The current pointer down handler.
   */
  get onPointerDown() {
    const fn = Component_A.genFuncTemplate(this._props.onPointerDown, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the pointer down event handler for the button.
   * @memberof TComponents.Button
   * @param {function} t - The new pointer down handler function.
   */
  set onPointerDown(t) {
    this.setProps({onPointerDown: t});
  }

  /**
   * Gets the tooltip text for the button.
   * @memberof TComponents.Button
   * @type {string}
   * @returns {string} The current tooltip text.
   */
  get tips() {
    return this._props.tips;
  }

  /**
   * Sets the tooltip text for the button.
   * @memberof TComponents.Button
   * @param {string} value - The new tooltip text.
   */
  set tips(value) {
    this.setProps({tips: value});
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Button.loadCssClassFromString(/*css*/ `
.tc-button {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-button .fp-components-button-disabled,
.tc-button .fp-components-button {
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-button > .fp-components-button,
.tc-button > .fp-components-button-disabled {
  min-width: 0px;
  min-height: 0px;
}

.tc-button > .fp-components-button-disabled {
  cursor: not-allowed !important;
}

.tc-button > .fp-components-button:hover,
.tc-button > .fp-components-button-disabled:hover {
  opacity:0.7;
}

.tc-button > .fp-components-button {
  min-width: 0px;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
}

.tc-button  .fp-components-button-text {
  text-overflow: ellipsis;
  flex:none;
  margin:0 4px;
}

.tc-button  .fp-components-button-icon-font {
  margin:0 4px;
}

.tc-button > .fp-components-button:not(.fp-components-button-disabled):hover:not(:active) {
  // background-color: var(--t-color-BLUE-50) !important;
}

.tc-button > .fp-components-button:not(.fp-components-button-disabled):active {
  // background-color: var(--t-color-BLUE-40) !important;
}
  
.tc-button > .fp-components-button-disabled {
  // background-color: var(--t-color-BLUE-30);
  cursor: not-allowed !important;      
}  

.fp-components-button-disabled {
  position: relative;
}

.fp-components-tmp-img {
  height: 90%;
  width: 90%;
  padding: 5%;

  img {
    height: 100%;
    width: 100%;
  }
}
`);
