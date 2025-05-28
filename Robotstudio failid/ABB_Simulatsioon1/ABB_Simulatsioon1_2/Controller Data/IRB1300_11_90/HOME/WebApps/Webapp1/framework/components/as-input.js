import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {FP_Input_A} from './fp-ext/fp-input-ext.js';

/**
 * @typedef TComponents.InputProps
 * @prop {Function} [onChange] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {boolean} [readOnly] Set to true to use the input field only to display but no to edit values
 * @prop {string} [description] Label to be displayed under the input field when open the keyboard editor
 * @prop {boolean} [useBorder] if true, creates a border around the value
 * @prop {string} [text] Initial value of the input field
 */

/**
 * Input field
 * @class TComponents.Input
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.InputProps} [props] - input field properties (InputProps)
 * @example
 * // index.html
 * ...
 * &lt;div class="input-field"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const inputField = new Input(
 *    document.querySelector('.input-field'),
 *    {label: 'Input field '}
 *  );
 *  await inputField.render();
 */
export class Input extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.InputProps}
     */
    this._props;

    /*
     * If bound to web data, `this._bindData` will have the format: { type: 'webdata', key: 'xxx' }.
     * If bound to digital signal data, `this._bindData` will have the format: { type: 'digitalsignal', key: 'xxxx' }.
     * If bound to rapid data, `this._bindData` will have the format: { type: 'rapiddata', dataType: 'xxx', module: 'xxx', name: 'xxx', task: 'xxx' }.
     */
    this._bindData = null;
    this._inputField = new FP_Input_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Input
   * @returns {TComponents.InputProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // basic properties: X/Y/W/H/B/R/Z
      position: 'static',
      width: 100,
      height: 30,
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // border
      border: '1px groove #ccc',
      // background
      color: 'black',
      backgroundColor: 'rgba(255,255,255,1)',
      // size template
      size: '',
      // font
      font: {
        fontSize: 12,
        fontFamily: 'Segoe UI',
      },
      // Special properties.
      readOnly: false,
      useBorder: true,
      regex: {
        label: 'no regex',
        value: '',
      },
      // Input variable binding properties.
      text: 'Input here',
      inputVar: {
        type: Component_A.INPUTVAR_TYPE.ANY, // Component_A.INPUTVAR_TYPE
        func: Component_A.INPUTVAR_FUNC.CUSTOM, // Component_A.INPUTVAR_FUNC
        value: 'Input here', // string
        isHidden: false,
      },
      onChange: '',
      // Special properties.
      keyboardHelperDesc: 'No description',
    };
  }

  /**
   * @async
   * @memberof TComponents.Input
   */
  async onInit() {}

  /**
   * @memberof TComponents.Input
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      this._inputField.attachToElement(this.find('.tc-input'));

      if (this._props.inputVar.func == 'sync') {
        this._bindData = Component_A.getBindData(this._props.inputVar.value);
      }

      this._props.readOnly || (this._inputField.onchange = this._cbOnChange.bind(this));

      this._props.onChange && this._onChange(this._props.onChange);

      // Set input default style.
      this._inputField.border = this._props.border;

      const fpCoreEl = this.container.querySelector('.fp-components-input');
      if (Component_A._isHTMLElement(fpCoreEl)) {
        fpCoreEl.style.border = this._props.useBorder ? this._props.border : 'none !important';
        fpCoreEl.style.borderRadius = `${this._props.borderRadius}px`;
        fpCoreEl.style.backgroundColor = `${this._props.backgroundColor}`;
        fpCoreEl.style.color = `${this._props.color}`;

        // Set the behavior of the input component.
        if (this._props.readOnly) {
          fpCoreEl.onclick = null;
        }
      }

      const pElem = this.container.querySelector('p');
      if (Component_A._isHTMLElement(pElem)) {
        pElem.style.fontSize = `${this._props.font.fontSize}px`;
        pElem.style.fontFamily = `${this._props.font.fontFamily}`;
      }

      this._inputField.text = Component_A.dynamicText(this._props.text, this);

      // Avoid new RegExp('')!
      if (typeof this._props.regex.value == 'string' && this._props.regex.value !== '')
        this._inputField.regex = new RegExp(this._props.regex.value);

      if (Object.prototype.toString.call(this._props.regex.value) === '[object RegExp]') {
        this._inputField.regex = this._props.regex.value;
      }

      this._inputField.label = Component_A.dynamicText(this._props.keyboardHelperDesc, this);
    } catch (e) {
      Popup_A.error(e, 'TComponents.Input');
    }
  }

  /**
   * @memberof TComponents.Input
   * @returns {string}
   */
  markup() {
    return /*html*/ `<div class="tc-input"></div>`;
  }

  /**
   * Adds a callback function that will be called when the RAPID variable value changes
   * @alias onChange
   * @memberof TComponents.Input
   * @param {Function} func
   */
  _onChange(func) {
    this.cleanEvent('change');
    const fn = Component_A.genFuncTemplate(func, this);
    if (typeof fn == 'function') this.on('change', fn);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onChange() onChange}
   * @alias cbOnChange
   * @memberof TComponents.Input
   * @param   {any}  value
   * @private
   * @async
   */
  async _cbOnChange(value) {
    this.text = value;
  }

  /**
   * A callback function that will execute whenever the user is altering one or more characters in the keyboard’s editable field.
   * The function signature should be:
   * <br>&emsp; function (val)
   * The val argument will be the current value (string) as it is being edited by the user. The callback function should return true when the value is acceptable and false when not acceptable.
   * Default value is null.
   * Can be used in combination with the regex argument.
   * Note that if the text of the input field is set programmatically using the text attribute, this input restriction does not apply.
   * @alias validator
   * @type {Function}
   * @memberof TComponents.Input
   */
  get validator() {
    return this._inputField.validator;
  }

  /**
   * Sets a callback function to validate the input value. This function accepts the current input value (a string)
   * and returns a boolean (`true` if the input is valid, `false` if it is invalid).
   * The validation function will be triggered whenever the user types in the input field.
   * Note that if the input value is programmatically set (e.g., via the `text` attribute),
   * this validation will not be applied.
   *
   * @param {Function} func - A validation function that takes the current input value (string) as an argument
   *                           and returns a boolean indicating whether the input is valid (`true`) or not (`false`).
   * @memberof TComponents.Input
   */
  set validator(func) {
    const fn = Component_A.genFuncTemplate(func, this);
    if (fn) this._inputField.validator = func;
  }

  /**
   * This attribute represents the text content of the input field.
   * It can be read to get the current content. Setting it will programmatically
   * update the content and will not trigger the onchange callback function
   * to be called.
   * @alias text
   * @type {string}
   * @memberof TComponents.Input
   */
  get text() {
    return this._props.text;
  }

  /**
   * @private
   */
  set text(text) {
    (async () => {
      this.setProps({
        text: text,
      });
      await this.syncInputData(text);
      this.trigger('change', text);
    })();
  }

  /**
   * This attribute represents the value of the input field.
   * It is used to interact with the input field programmatically and triggers the
   * onchange callback function when the value is set.
   *
   * The `get` method retrieves the current value of the input field.
   * The `set` method sets a new value to the input field, synchronizes the input data asynchronously,
   * and triggers the 'change' event.
   *
   * @alias value
   * @type {string}
   * @memberof TComponents.Input
   */
  get value() {
    return this._inputField.text;
  }

  /**
   * Sets the value of the input field. This operation is asynchronous and ensures
   * the input field's data is synchronized before triggering the 'change' event.
   *
   * @param {string} t - The new value to be set in the input field.
   * @returns {void}
   */
  set value(t) {
    // (async () => {
    //   await this.syncInputData(t);
    //   this.trigger('change', t);
    // })();
    this.text = t;
  }

  /**
   * Descriptive label string that will be visible below the editor field
   * on the keyboard when the input field is being edited.
   * Should describe the value that the user is editing, preferably
   * including any input limitations.
   * @alias description
   * @type {string}
   * @memberof TComponents.Input
   */
  get keyboardHelperDesc() {
    return this._props.keyboardHelperDesc;
  }

  /**
   * @private
   */
  set keyboardHelperDesc(text) {
    this.setProps({
      keyboardHelperDesc: text,
    });
  }

  /**
   * Type: Regular expression object
   * Standard JavaScript regular expression object used for validating and allowing the input.
   * Example:
   * <br>&emsp;myInput.regex = /^-?[0-9]+(\.[0-9]+)?$/;
   * will only allow input of floating-point numbers or integers.
   * Default value is null.
   * Can be used in combination with the validator argument.
   * Note that if the text of the input field is set programmatically using the text attribute, this input restriction does not apply.
   * @alias regex
   * @type {RegExp}
   * @memberof TComponents.Input
   */
  get regex() {
    return this._props.regex.value;
  }

  /**
   * @private
   */
  set regex(regexp) {
    this.setProps({
      regex: {
        value: regexp,
      },
    });
  }

  /**
   * @alias useBorder
   * @type {boolean}
   * @memberof TComponents.Input
   */
  get useBorder() {
    return this._props.useBorder;
  }

  /**
   * @private
   */
  set useBorder(b) {
    this.setProps({useBorder: b});
  }

  /**
   * Gets the `onChange` event handler.
   * This returns the function associated with the `onChange` event or `undefined` if no valid handler is set.
   *
   * @returns {Function|undefined} A function to handle input changes or `undefined` if no valid handler is set.
   * @memberof TComponents.Input
   */
  get onChange() {
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    if (typeof fn === 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the `onChange` event handler for the input field.
   * The handler can either be a string representing a function to be executed or a function itself.
   * The handler will be invoked with the `args` parameter, which includes the current value of the input.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * Input_1.onChange = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * Input_1.onChange = (...args) => { console.log(args); }
   * ```
   *
   * @param {string|Function} t - A string representing a function to be executed or a function itself to handle the `onChange` event.
   * @memberof TComponents.Input
   */
  set onChange(t) {
    this.setProps({onChange: t});
  }

  /**
   * A getter for `inputVar` property.
   * This property provides access to the `inputVar` configuration object.
   *
   * @type {Object}
   * @memberof TComponents.Input
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
   * @memberof TComponents.Input
   */
  set inputVar(t) {
    this.setProps({inputVar: t});
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Input.loadCssClassFromString(/*css*/ `
.tc-input {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}
 
.tc-input .fp-components-input-container {
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-input .fp-components-input-container .fp-components-input {
  height: 100%;
  width: 100%;
}

.tc-input .fp-components-input-disabled {
  cursor: not-allowed !important;
}

.tc-input .fp-components-input:hover {
  opacity:0.7;
}
`);
