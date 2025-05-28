import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {Button} from './as-button.js';
import {Input} from './as-input.js';

/**
 * @typedef {Object} TComponents.VarIncrDecrProps
 * @property {string} [module] - Module to search for variables.
 * @property {string} [variable] - Rapid variable to subscribe to.
 * @property {boolean} [readOnly] - If true, variable value is displayed and can only be modified with the increment and decrement buttons. If false, the value can also be directly modified.
 * @property {number} [steps] - Increments/decrements steps applied at a button click (default = 1).
 * @property {string} [label] - Label text.
 */

/**
 * Component connected to a variable together with increment and decrement buttons.
 * @class TComponents.VarIncrDecr_A
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.VarIncrDecrProps} [props] - Properties of the component
 * @property {TComponents.VarIncrDecrProps} _props - Properties of the component
 * @property {Object|null} _bindData - Data binding information
 * @example
 * // index.html
 * ...
 * &lt;div class="var-incr-decr"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const varIncrDecrInd = new TComponents.VarIncrDecr_A(document.querySelector('.var-incr-decr'), {
 *    module: this._module,
 *    variable: this._variable,
 *    readOnly: true,
 *    steps: 5,
 *    label: 'VarIncrDecr_A (readonly)',
 *  });
 * await varIncrDecrInd.render();
 */
export class VarIncrDecr extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.VarIncrDecrProps}
     */
    this._props;

    /**
     * If bound to web data, `this._bindData` will have the format: { type: 'webdata', key: 'xxx' }.
     * If bound to digital signal data, `this._bindData` will have the format: { type: 'digitalsignal', key: 'xxxx' }.
     * If bound to rapid data, `this._bindData` will have the format: { type: 'rapiddata', dataType: 'xxx', module: 'xxx', name: 'xxx', task: 'xxx' }.
     * @type {Object|null}
     */
    this._bindData = null;
  }

  /**
   * Gets the text property.
   * @returns {string}
   */
  get text() {
    return this.child.var.text;
  }

  /**
   * Sets the text property.
   * @param {string} text - The new text value
   * @private
   */
  set text(text) {
    this.child.var.text = text;
  }

  /**
   * Gets the useBorder property.
   * @returns {boolean}
   */
  get useBorder() {
    return this._props.useBorder;
  }

  /**
   * Sets the useBorder property.
   * @param {boolean} b - The new useBorder value
   */
  set useBorder(b) {
    this.setProps({useBorder: b});
  }

  /**
   * Gets the minimum value.
   * @returns {number|null}
   */
  get minValue() {
    return this._props.numRange.min;
  }

  /**
   * Sets the minimum value.
   * @param {number} n - The new minimum value
   */
  set minValue(n) {
    this.setProps({
      numRange: {
        min: n,
      },
    });
  }

  /**
   * Gets the maximum value.
   * @returns {number|null}
   */
  get maxValue() {
    return this._props.numRange.max;
  }

  /**
   * Sets the maximum value.
   * @param {number} n - The new maximum value
   */
  set maxValue(n) {
    this.setProps({
      numRange: {
        max: n,
      },
    });
  }

  /**
   * Gets the step value.
   * @returns {number|string}
   */
  get step() {
    return this._props.step;
  }

  /**
   * Sets the step value.
   * @param {number|string} n - The new step value
   */
  set step(n) {
    this.setProps({
      step: n,
    });
  }

  /**
   * Gets the keyboard helper description.
   * @returns {string}
   */
  get keyboardHelperDesc() {
    return this._props.keyboardHelperDesc;
  }

  /**
   * Sets the keyboard helper description.
   * @param {string} s - The new keyboard helper description
   */
  set keyboardHelperDesc(s) {
    this.setProps({
      keyboardHelperDesc: s,
    });
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.VarIncrDecr_A
   * @returns {TComponents.VarIncrDecrProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // basic properties: X/Y/W/H/B/R/Z
      position: 'static',
      width: 120,
      height: 30,
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // border
      border: '1px groove #ccc',
      // color
      color: 'black',
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
        label: 'Number',
        value: '^-?[0-9]+(\\.[0-9]+)?$',
      },
      // Input variable binding properties.
      text: '0',
      inputVar: {
        type: 'num', // 'any' | 'string' | 'num' | 'bool'
        func: 'custom', // 'custom' | 'sync'
        value: '0', // string
        isHidden: false,
      },
      onChange: '',
      // Special properties.
      keyboardHelperDesc: 'No description',
      step: '1',
      numRange: {
        min: null,
        max: null,
      },
    };
  }

  /**
   * Initialize the component.
   * @async
   */
  async onInit() {}

  /**
   * Handler for change events.
   * @param {*} value - The new value
   */
  _onChange(value) {
    this._props.text = value;
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    fn && fn(value);
  }

  /**
   * Maps the internal components.
   * @returns {Object} The mapped components
   */
  mapComponents() {
    const varIns = new Input(this.find('.tc-varincrdecr-var'), {
      height: 30,
      width: 60,
      border: 'none',
      onChange: this.cbOnChange.bind(this),
      keyboardHelperDesc: this._props.keyboardHelperDesc,
      text: Component_A.dynamicText(this._props.text, this),
      regex: this._props.regex,
      font: this._props.font,
    });
    varIns.enabled = this.enabled;

    const incrValueIns = new Button(this.find('.tc-varincrdecr-incr'), {
      height: 30,
      width: 30,
      backgroundColor: '#ccc',
      onClick: this.cbIncr.bind(this),
      text: '+',
      color: 'black',
      border: 'none',
      borderRadius: 0,
    });
    incrValueIns.enabled = this.enabled;

    const decrValueIns = new Button(this.find('.tc-varincrdecr-decr'), {
      height: 30,
      width: 30,
      backgroundColor: '#ccc',
      onClick: this.cbDecr.bind(this),
      text: '-',
      color: 'black',
      border: 'none',
      borderRadius: 0,
    });
    decrValueIns.enabled = this.enabled;

    // Bind on-change event.
    // varIns.cbOnChange = this.cbOnChange.bind(this);
    varIns.on('render', () => {
      varIns.container.style.cssText = '';
      varIns.find('.fp-components-input').style.cssText = `color: ${this._props.color};`;
    });

    return {
      var: varIns,
      incrValue: incrValueIns,
      decrValue: decrValueIns,
    };
  }

  /**
   * Renders the component.
   * @async
   */
  async onRender() {
    try {
      this.removeAllEventListeners();

      // Bind user custom onchange event.
      // if (this._props.onChange) {
      //   const fn = Component_A.genFuncTemplate(this._props.onChange, this);
      //   if (typeof fn == 'function') this._onChange(fn);
      // }

      if (this._props.inputVar.func == Component_A.INPUTVAR_FUNC.SYNC) {
        // Parse bind data value.
        this._bindData = Component_A.getBindData(this._props.inputVar.value);
      }

      // Render children component.
      await this.child.var.render();
      await this.child.incrValue.render();
      await this.child.decrValue.render();

      const fpWrapEl = this.find('.fp-components-varincrdecr');
      if (Component_A._isHTMLElement(fpWrapEl)) {
        fpWrapEl.style.border = this._props.useBorder ? this._props.border : 'none';
        fpWrapEl.style.boxSizing = 'border-box';
        fpWrapEl.style.borderRadius = `${this._props.borderRadius}px`;
      }

      // render tc-item style.
      this._renderChildComponent();
    } catch (e) {
      Popup_A.error(e, 'TComponents.VarIncrDecr');
    }
  }

  /**
   * Returns the HTML markup for the component.
   * @returns {string} The HTML markup
   */
  markup() {
    return /*html*/ `
    <div class="tc-varincrdecr">
      <div class="fp-components-varincrdecr">
        <div class="tc-varincrdecr-decr tc-item"></div>
        <div class="tc-varincrdecr-var tc-item"></div>
        <div class="tc-varincrdecr-incr tc-item"></div>
      </div>
    </div>
    `;
  }

  /**
   * Adjusts the layout of the component responsively.
   */
  _renderChildComponent() {
    // Force remove the child component's width and height.
    this.child.var.container.classList.add('tc-varincrdecr-input');
    this.child.var.container.style.cssText = '';

    this.child.incrValue.container.classList.add('tc-varincrdecr-button');
    this.child.incrValue.container.style.cssText = `0px ${this._props.borderRadius}px ${this._props.borderRadius}px 0px`;

    this.child.decrValue.container.classList.add('tc-varincrdecr-button');
    this.child.decrValue.container.style.cssText = `${this._props.borderRadius}px 0px 0px ${this._props.borderRadius}px`;

    const fontEls = this.all('.fp-components-button-text');
    for (let index = 0; index < fontEls.length; index++) {
      const el = fontEls[index];
      el.style.fontSize = `${this._props.font.fontSize}px`;
      el.style.fontFamily = this._props.font.fontFamily;
      el.style.color = this._props.color;
    }

    const varFont = this.find('.fp-components-input');
    if (Component_A._isHTMLElement(varFont)) {
      varFont.style.fontSize = `${this._props.font.fontSize}px`;
      varFont.style.fontFamily = this._props.font.fontFamily;
      varFont.style.color = this._props.color;
    }
  }

  /**
   * Callback function which is called when the button is pressed, it triggers any function registered with {@link onChange() onChange}
   * @alias cbOnChange
   * @memberof TComponents.VarIncrDecr_A
   * @param   {any}  value - The new value
   * @private
   * @async
   */
  async cbOnChange(value) {
    const numValue = Number(value);

    if (this._props.numRange.max != null && numValue > this._props.numRange.max) {
      const e = new Error(`The value cannot exceed the maximum value. Maximum value: ${this._props.numRange.max}`);
      Popup_A.error(e, 'VarIncrDecr_A');
      this.child.var.text = this._props.numRange.max;
      return;
    }

    if (this._props.numRange.min != null && numValue < this._props.numRange.min) {
      const e = new Error(
        `The value cannot be less than the minimum value. Minimum value is ${this._props.numRange.min}`,
      );
      Popup_A.error(e, 'VarIncrDecr_A');
      this.child.var.text = this._props.numRange.min;
      return;
    }

    await this.syncInputData(value);
    this._onChange(value);
  }

  /**
   * Callback function to update variable when increment button is clicked.
   * @alias cbIncr
   * @memberof TComponents.VarIncrDecr_A
   * @async
   * @private
   */
  async cbIncr() {
    try {
      const value = Number(this.child.var.text);
      if (isNaN(value)) {
        const e = new Error('Number value parse error!');
        Popup_A.error(e, 'VarIncrDecr_A');
        return;
      }

      const incrValue = value + Number(this._props.step);
      if (this._props.numRange.max != null && incrValue > this._props.numRange.max) {
        const e = new Error(`The value cannot exceed the maximum value. Maximum value: ${this._props.numRange.max}`);
        Popup_A.error(e, 'VarIncrDecr_A');
        return;
      }

      this.child.var.text = incrValue;
      // await this.syncInputData(incrValue);
      // this._onChange(incrValue);
    } catch (e) {
      Popup_A.error(e, 'VarIncrDecr_A');
    }
  }

  /**
   * Callback function to update variable when decrement button is clicked.
   * @alias cbDecr
   * @memberof TComponents.VarIncrDecr_A
   * @async
   * @private
   */
  async cbDecr() {
    try {
      const value = Number(this.child.var.text);
      if (isNaN(value)) {
        const e = new Error('Number value parse error!');
        Popup_A.error(e, 'VarIncrDecr_A');
        return;
      }

      const decrValue = value - Number(this._props.step);
      if (this._props.numRange.min != null && decrValue < this._props.numRange.min) {
        const e = new Error(
          `The value cannot be less than the minimum value. Minimum value is ${this._props.numRange.min}`,
        );
        Popup_A.error(e, 'VarIncrDecr_A');
        return;
      }

      this.child.var.text = decrValue;
      // this.child.var.container.style.cssText = '';
      // await this.syncInputData(decrValue);
      // this._onChange(decrValue);
    } catch (e) {
      Popup_A.error(e);
    }
  }

  /**
   * Gets the pointer release event handler.
   * @memberof TComponents.VarIncrDecr_A
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
   * @memberof TComponents.VarIncrDecr_A
   * @param {function} t - The new pointer release handler function.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * VarIncrDecr_1.onChange = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * VarIncrDecr_1.onChange = (...args) => { console.log(args); }
   */
  set onChange(t) {
    this.setProps({onChange: t});
  }

  /**
   * Gets the maximum value in the number range.
   * @memberof TComponents.VarIncrDecr_A
   * @returns {number} The current maximum value.
   */
  get max() {
    return this._props.numRange.max;
  }

  /**
   * Sets the maximum value in the number range.
   * @memberof TComponents.VarIncrDecr_A
   * @param {number} t - The new maximum value.
   */
  set max(t) {
    if (typeof t === 'number') {
      const numRange = {
        min: this._props.numRange.min,
        max: t,
      };
      this.setProps({numRange: numRange});
    }
  }

  /**
   * Gets the minimum value in the number range.
   * @memberof TComponents.VarIncrDecr_A
   * @returns {number} The current minimum value.
   */
  get min() {
    return this._props.numRange.min;
  }

  /**
   * Sets the minimum value in the number range.
   * @memberof TComponents.VarIncrDecr_A
   * @param {number} t - The new minimum value.
   */
  set min(t) {
    if (typeof t === 'number') {
      const numRange = {
        min: t,
        max: this._props.numRange.max,
      };
      this.setProps({numRange: numRange});
    }
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
VarIncrDecr.loadCssClassFromString(/*css*/ `
.tc-varincrdecr {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}
 
.tc-varincrdecr .fp-components-varincrdecr-disabled,
.tc-varincrdecr .fp-components-varincrdecr {
  height: 100%;
  width: 100%;
  padding: 0px;
  margin: 0px;
  min-width: 0px;
  min-height: 0px;
  display: flex;
  flex-direction: row;
  border: 1px groove #ccc;
}

.tc-varincrdecr .fp-components-varincrdecr-disabled{
  cursor:not-allowed !important;
}
.tc-varincrdecr .fp-components-varincrdecr:hover{
  opacity:0.7;
}

.tc-varincrdecr .fp-components-button,
.tc-varincrdecr .fp-components-button-disabled {
  border: none;
  border-radius: 0px;
  padding: 0px;
  min-width: 30px;
}
 
.tc-varincrdecr .fp-components-input {
  border: none;
  border-radius: 0px;
  min-height: 0px;
  justify-content: center;
}
 
.tc-varincrdecr .tc-container-row {
  align-items: center;
  height: 100%;
  width: 100%;
}
 
.tc-varincrdecr .fp-components-button-text {
  font-weight: bold;
  font-size: 18px;
  line-height: 15px;
}
 
.tc-varincrdecr .tc-item {
  padding: 0px;
}
 
.tc-varincrdecr .tc-item > .t-component {
  height: 100%;
  width: 100%;
}
 
.tc-varincrdecr .tc-varincrdecr-incr,
.tc-varincrdecr .tc-varincrdecr-decr {
  height: 100%;
  width: 25%;
}
 
.tc-varincrdecr .tc-varincrdecr-var {
  height: 100%;
  width: 50%;
}
 
.tc-varincrdecr .tc-varincrdecr-button,
.tc-varincrdecr .tc-button,
.tc-varincrdecr .fp-components-button,
.tc-varincrdecr .tc-varincrdecr-input,
.tc-varincrdecr .tc-input {
  height: 100%;
  width: 100%;
}
 
.tc-varincrdecr .fp-components-input-container {
  height: 100%;
  width: 100%;
  padding-top: 0px;
  padding-bottom: 0px;
}
 
.tc-varincrdecr .fp-components-input {
  display: flex;
  align-items: center;
}
 
`);
