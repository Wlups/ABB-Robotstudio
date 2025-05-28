import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {FP_Slider_A} from './fp-ext/fp-slider-ext.js';
import {getDecimalPlaces} from './utils/utils.js';

/**
 * @typedef {Object} TComponents.FP_Slider_A
 */

/**
 * Slider element. Additional callbacks can be added with the {@link TComponents.Slider#onChange|onChange} method.
 * @class TComponents.Slider
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SliderProps} [props]
 * @property {TComponents.SliderProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="slider-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const slider = new Slider(document.querySelector('.slider-container'),{
 *   });
 */
export class Slider extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SliderProps}
     */
    this._props;

    this._slider = new FP_Slider_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Slider
   * @returns {TComponents.SliderProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',

      onPointerRelease: '',
      onPointerDown: '',
      // X/Y/W/H/B/R
      position: 'static',
      width: 200,
      height: 80,
      top: 0,
      left: 0,
      borderRadius: 16,
      rotation: 0,
      zIndex: 0,
      //label font color
      color: '#000000',
      //label font style
      font: {
        fontSize: 14,
        fontFamily: 'Segoe UI',
        style: {
          fontStyle: 'normal',
          fontWeight: 'bold',
          textDecoration: 'none',
        },
      },
      // range value font style
      rangeValueColor: '#0000008e',
      rangeValueFont: {
        fontSize: 12,
        fontFamily: 'Segoe UI',
        style: {
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
        },
      },
      // Background
      backgroundColor: '#ffffff',
      //  Border
      border: '1px solid transparent',
      // label
      displayLabel: true,
      descrLabel: 'Label',
      // value
      displayValue: true,
      value: 30,
      min: 0,
      max: 100,
      enabled: true,
      // range track
      activeColor: '#3366ff',
      inactiveColor: '#d3d3d3',
      displayTicks: true,
      tickStep: 10,
    };
  }

  /**
   * Initializes the Slider component.
   * @memberof TComponents.Slider
   */
  onInit() {}

  /**
   * Renders the slider component.
   * @memberof TComponents.Slider
   */
  onRender() {
    try {
      this.removeAllEventListeners();
      console.log('onrender', this._props);

      //background color and radius
      this._slider._backgroundColor = this._props.backgroundColor;
      this._slider._border = this._props.border;
      this._slider._borderRadius = this._props.borderRadius;

      // width
      this._slider._width = this._props.width - 28;

      //label
      this._slider._displayLabel = this._props.displayLabel;
      this._slider._label = Component_A.dynamicText(this._props.descrLabel, this);
      this._slider._labelFont = this._props.font;
      this._slider._labelColor = this._props.color;

      //value
      this._slider._displayValue = this._props.displayValue;
      this._slider._value = this._props.value;

      // range
      this._slider._activeColor = this._props.activeColor;
      this._slider._inactiveColor = this._props.inactiveColor;
      this._slider._displayTicks = this._props.displayTicks;
      this._slider._tickStep = this._props.tickStep;
      this._slider._numberOfDecimals = getDecimalPlaces(this._props.tickStep);
      this._slider._max = this._props.max;
      this._slider._min = this._props.min;

      // range value color
      this._slider._rangeValueFont = this._props.rangeValueFont;
      this._slider._rangeValueColor = this._props.rangeValueColor;

      // enable status
      this._slider.enabled = this.enabled;

      //onPointerRelease
      this._slider.onrelease = this._onPointerRelease.bind(this);
      this._slider.ondrag = this._onPointerDown.bind(this);

      const sliderContainer = this.find('.tc-slider');
      if (sliderContainer) this._slider.attachToElement(sliderContainer);
    } catch (e) {
      Popup_A.error(e, 'TComponents.Slider');
    }
  }

  /**
   * Generates the markup for the slider component.
   * @memberof TComponents.Slider
   * @returns {string} HTML markup string
   */
  markup() {
    return /*html*/ `
    <div class="tc-slider"></div>
    `;
  }

  /**
   * Pointer up/leave event handler.
   * @alias onPointerRelease
   * @memberof TComponents.Slider
   * @async
   */
  async _onPointerRelease(value) {
    if (this.enabled && this._props.onPointerRelease) {
      this._slider.value = value;
      this._props.value = value;

      const fn = Component_A.genFuncTemplate(this._props.onPointerRelease, this);
      if (typeof fn == 'function') fn(value);
    }
  }

  /**
   * Pointer down event handler.
   * @alias onPointerDown
   * @memberof TComponents.Slider
   * @async
   */
  async _onPointerDown(value) {
    if (this.enabled && this._props.onPointerDown) {
      const fn = Component_A.genFuncTemplate(this._props.onPointerDown, this);
      if (typeof fn == 'function') fn(value);
    }
  }

  /**
   * Gets the pointer release event handler for the slider.
   * @memberof TComponents.Slider
   * @type {function|null}
   * @returns {function|null} The current pointer release handler.
   */
  get onPointerRelease() {
    const fn = Component_A.genFuncTemplate(this._props.onPointerRelease, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the pointer release event handler for the slider.
   * @memberof TComponents.Slider
   * @param {function} t - The new pointer release handler function.
   */
  set onPointerRelease(t) {
    this.setProps({onPointerRelease: t});
  }

  /**
   * Sets the pointer down event handler for the slider.
   * @memberof TComponents.Slider
   * @param {function} t - The new pointer down handler function.
   */
  set onPointerDown(t) {
    this.setProps({onPointerDown: t});
  }

  /**
   * Sets the value of the slider.
   * @param {number} v - The value.
   * @memberof TComponents.Slider
   */
  set value(v) {
    // check validity
    if (v > this.max || v < this.min) {
      console.log(v, this.max, this.min);
      const err = new Error('Incorrect value.');
      Popup_A.error(err, 'TComponents.VarSlider');
      return;
    }
    this.once('render', () => {
      this._onPointerRelease(v);
    });
    this.setProps({
      value: v,
    });
  }

  /**
   * Gets the value of the slider.
   * @returns {string} The value of the slider.
   * @memberof TComponents.Slider
   */
  get value() {
    return this._slider.value;
  }

  /**
   * Get the max value of the slider range.
   * @returns {number} The max value of the slider range.
   * @memberof TComponents.Slider
   */
  get max() {
    return this._props.max;
  }

  /**
   * Set the max value of the slidr
   * @param {number} v the max
   * @memberof TComponents.Slider
   */
  set max(v) {
    if (v <= this.min || v < this.value) {
      console.log(v, this.max, this.min);
      const err = new Error('Incorrect value. the max need greater then the min and value');
      Popup_A.error(err, 'TComponents.Slider');
      return;
    }
    this.setProps({
      max: v,
    });
  }
  /**
   * Get the min value of the slider range.
   * @returns {number} The min value of the slider range.
   * @memberof TComponents.Slider
   */
  get min() {
    return this._props.min;
  }
  /**
   * Set the min value of the slider range.
   * @param {number} e - The min state to set.
   * @memberof TComponents.Slider
   */
  set min(v) {
    // check validity
    if (v >= this.max || v > this.value) {
      console.log(v, this.max, this.min);
      const err = new Error('Incorrect value. the min need less then the max and value');
      Popup_A.error(err, 'TComponents.Slider');
      return;
    }
    this.setProps({
      min: v,
    });
  }

  /**
   * Get if display description label.
   * @returns {boolean} True if description label shall display.
   * @memberof TComponents.Slider
   */
  get displayLabel() {
    return this._props.displayLabel;
  }
  /**
   * Set if display description label.
   * @param {boolean} b - True if description label shall display.
   * @memberof TComponents.Slider
   */
  set displayLabel(b) {
    this.setProps({
      displayLabel: b,
    });
  }
  /**
   * Get if display value label.
   * @returns {boolean} True if value label shall display.
   * @memberof TComponents.Slider
   */
  get displayValue() {
    return this._props.displayValue;
  }
  /**
   * Set if display value label.
   * @param {boolean} b - True if value label shall display.
   * @memberof TComponents.Slider
   */
  set displayValue(b) {
    this.setProps({
      displayValue: b,
    });
  }
  /**
   * Get the content of description label.
   * @returns {string} The text content of description label.
   * @memberof TComponents.Slider
   */
  get descrLabel() {
    return this._props.descrLabel;
  }
  /**
   * Set the content of description label.
   * @param {string} c - The text content of description label
   * @memberof TComponents.Slider
   */
  set descrLabel(c) {
    this.setProps({
      descrLabel: c,
    });
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Slider.loadCssClassFromString(/*css*/ `
.tc-slider {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-slider .fp-components-slider {
    max-width: 100%;
    box-sizing: border-box;
    max-height:100%;
}

.tc-slider .fp-components-slider-disabled{
  cursor:not-allowed !important;
}
.tc-slider .fp-components-slider:hover{
  opacity:0.7;
}


.tc-slider .fp-components-slider__range-wrapper {
    position: relative;
    height: 4px;
    width: 2px;
    background-position-x: -1px;
    border-radius:4px;
    background-image: linear-gradient(to right, white 1px, lightgrey 1px);   
 }
.tc-slider .fp-components-slider__track {
    height: 4px;
    top: 50%;
    position: absolute;
    transform: translate(0%, -50%);
    pointer-events: none;
    background-color:transparent;
 }
.tc-slider .fp-components-slider__tick{
    width: 2px;
    height: 4px;
    position: absolute;
    background-color: transparent;
    transform: translate(-50%, -50%);
    top:50%;
    pointer-events: none;
}
.tc-slider  .fp-components-slider__track--active {
    background-color: var(--fp-color-BLUE-60);
    pointer-events: inherit;
    border-radius:4px;
 }
`);
