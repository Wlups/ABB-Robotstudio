import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {FP_Digital_A} from './fp-ext/fp-digital-ext.js';

/**
 * Digital LED component that displays a digital signal and triggers callbacks when the signal changes or the component is clicked.
 * @class TComponents.DigitalLed
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - The parent HTML element for the component.
 * @param {TComponents.SignalIndicatorProps} [props={}] - The properties for the Digital LED component.
 * @property {TComponents.SignalIndicatorProps} _props - The properties object for the Digital LED component.
 * @example
 * const digitalLed = new TComponents.DigitalLed(document.body, {
 *   text: '1',
 *   onClick: () => console.log('Clicked!'),
 * });
 */
export class DigitalLed extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SignalIndicatorProps}
     */
    this._props;

    this._dig = new FP_Digital_A();

    /*
     * If bound to web data, `this._bindData` will have the format: { type: 'webdata', key: 'xxx' }.
     * If bound to digital signal data, `this._bindData` will have the format: { type: 'digitalsignal', key: 'xxxx' }.
     * If bound to rapid data, `this._bindData` will have the format: { type: 'rapiddata', dataType: 'xxx', module: 'xxx', name: 'xxx', task: 'xxx' }.
     */
    this._bindData = null;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.DigitalLed
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // X/Y/W/H/B/R
      position: 'static',
      width: 40,
      height: 40,
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // background
      color: '#f0f0f0',
      // size template
      size: '',
      // font
      font: {
        fontSize: 20,
        fontFamily: 'Segoe UI',
      },
      // Input variable binding properties.
      text: '0',
      inputVar: {
        type: Component_A.INPUTVAR_TYPE.BOOL,
        func: Component_A.INPUTVAR_FUNC.CUSTOM,
        value: '0', // string
        isHidden: false,
      },
      onChange: '',
      // Special properties.
      onClick: '',
      readOnly: false,
    };
  }

  /**
   * Initializes the component and sets up click event handling.
   * @alias onInit
   * @memberof TComponents.DigitalLed
   * @async
   */
  async onInit() {
    this._dig.onclick = this._cbOnClick.bind(this);
  }

  /**
   * Renders the component on the screen and applies the necessary styles and event listeners.
   * @alias onRender
   * @memberof TComponents.DigitalLed
   */
  onRender() {
    try {
      this.removeAllEventListeners();
      this._dig.attachToElement(this.find('.tc-digital-container'));

      if (this._props.inputVar.func == Component_A.INPUTVAR_FUNC.SYNC) {
        this._bindData = Component_A.getBindData(this._props.inputVar.value);
      }

      if (this._props.onChange) {
        const fn = Component_A.genFuncTemplate(this._props.onChange, this);
        if (fn) this._onChange(fn);
      }

      if (this._props.onClick) {
        const fn = Component_A.genFuncTemplate(this._props.onClick, this);
        if (fn) this._onChange(fn);
      }

      this.text = Component_A.dynamicText(this._props.text, this);

      const digitalEl = this.find('.fp-components-digital-a');
      if (Component_A._isHTMLElement(digitalEl)) {
        digitalEl.style.color = `${this._props.color}`;
        digitalEl.style.fontSize = `${this._props.font.fontSize}px`;
        digitalEl.style.fontFamily = `${this._props.font.fontFamily}`;
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.DigitalLed');
    }
  }

  /**
   * Returns the HTML markup for the component.
   * @alias markup
   * @memberof TComponents.DigitalLed
   * @returns {string} The HTML markup for the component.
   */
  markup() {
    return /*html*/ `
          <div class="tc-digital-container flex"></div>
        `;
  }

  /**
   * Gets the text value of the digital LED.
   * @alias text
   * @memberof TComponents.DigitalLed
   * @returns {string} The text value of the digital LED.
   */
  get text() {
    return this._props.text;
  }

  /**
   * Sets the text value of the digital LED and updates the active state accordingly.
   * @alias text
   * @memberof TComponents.DigitalLed
   * @param {string|boolean|number} t - The text value to set.
   */
  set text(t) {
    if (typeof t === 'boolean') {
      this.active = t;
    } else if (typeof t === 'number') {
      this.active = t === 1;
    } else if (typeof t === 'string') {
      const lowerCaseText = t.trim().toLowerCase();
      if (lowerCaseText === '1' || lowerCaseText === 'true') {
        this.active = true;
      } else if (lowerCaseText === '0' || lowerCaseText === 'false') {
        this.active = false;
      } else {
        return;
      }
    } else {
      const err = new Error('Invalid text data.');
      Popup_A.error(err, 'TComponents.DigitalLed');
      this.active = false;
    }
  }

  /**
   * Set this attribute to true to make the digital indicator activated (1), or false to deactivate it (0).
   * @alias active
   * @type {boolean}
   * @memberof TComponents.DigitalLed
   */
  get active() {
    return this._dig.active;
  }

  /**
   * @protected
   */
  set active(value) {
    if (value != this.active && this.enabled) this.trigger('change', value);
    this._dig.active = value;
  }

  /**
   * Adds a callback function to be called when the signal changes its state.
   * @alias _onChange
   * @memberof TComponents.DigitalLed
   * @param {Function} func - The callback function to be called when the signal changes.
   */
  _onChange(func) {
    this.cleanEvent('change');
    this.on('change', func);
  }

  /**
   * Adds a callback function to the component. This will be called after the indicator is pressed and released.
   * @alias _onClick
   * @memberof TComponents.DigitalLed
   * @param {Function} func - The callback function to be called when the indicator is pressed.
   */
  _onClick(func) {
    this.cleanEvent('click');
    this.on('click', func);
  }

  /**
   * Callback function which is called when the indicator is pressed, it triggers any function registered with {@link TComponents.Digital_A.onClick|onClick}.
   * @alias _cbOnClick
   * @memberof TComponents.DigitalLed
   * @async
   * @private
   */
  async _cbOnClick() {
    if (this._props.readOnly || !this.enabled) return;
    const value = this.active ? false : true;

    const flag = await this.syncInputData(value);
    if (!flag) return;

    // Updates to bound variables are done through subscriptions
    if (this.inputVar.func == Component_A.INPUTVAR_FUNC.CUSTOM) this.active = value;

    this.trigger('click', value);
  }

  /**
   * A getter for `inputVar` property.
   * This property provides access to the `inputVar` configuration object.
   *
   * @type {Object}
   * @memberof TComponents.DigitalLed
   * @returns {Object} The current `inputVar` configuration object.
   */
  get inputVar() {
    return this._props.inputVar;
  }

  /**
   * A setter for `inputVar` property.
   * This property is used to set the `inputVar` configuration.
   * If the configuration is invalid or doesn't meet the expected conditions,
   * an exception will be triggered in the input component.
   *
   * **Note:** Invalid `inputVar` configurations may cause the input component to throw an error.
   *
   * @param {Object} t - The new `inputVar` configuration object. It should contain a valid `type`, `func`, and `value` as per the component's requirements.
   * @throws {Error} If the `inputVar` object does not have valid `type` or `func`, or if the `value` is not of type `string`, an exception will be thrown.
   * @memberof TComponents.DigitalLed
   */
  set inputVar(t) {
    this.setProps({inputVar: t});
  }

  /**
   * Gets the click event handler.
   * @memberof TComponents.DigitalLed
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
   * @memberof TComponents.DigitalLed
   * @param {function} t - The new click handler function.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * DigitalLed.onClick = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * DigitalLed.onClick = (...args) => { console.log(args); }
   */
  set onClick(t) {
    this.setProps({onClick: t});
  }

  /**
   * Gets the pointer release event handler.
   * @memberof TComponents.DigitalLed
   * @type {function|null}
   * @returns {function|null} The current pointer release handler.
   */
  get onChange() {
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the pointer release event handler.
   * @memberof TComponents.DigitalLed
   * @param {function} t - The new pointer release handler function.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * DigitalLed.onChange = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * DigitalLed.onChange = (...args) => { console.log(args); }
   */
  set onChange(t) {
    this.setProps({onChange: t});
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
DigitalLed.loadCssClassFromString(`
.tc-digital-container {
  width: inherit;
  height: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
  align-items: center;
  justify-content: center;
}

.tc-digital-container .fp-components-digital-a-disabled,
.tc-digital-container .fp-components-digital-a-container {
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
  justify-content: center;
}

.tc-digital-container .fp-components-digital-a-disabled {
  cursor: not-allowed !important;
}

.tc-digital-container .fp-components-digital-a:hover {
  opacity:0.7;
}

.tc-digital-container .fp-components-digital-a {
  display: flex;
  height: calc(100% - 12px);
  width: calc(100% - 12px);
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
`);
