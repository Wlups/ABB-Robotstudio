import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {FP_Switch_A} from './fp-ext/fp-switch-ext.js';

/**
 * @typedef {Object} TComponents.SwitchProps
 * @property {Function} [onChange] - Function to be called when button is pressed
 */

/**
 * Switch element. Additional callbacks can be added with the {@link TComponents.Switch#onChange|onChange} method.
 * @class TComponents.Switch
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SwitchProps} [props]
 * @property {TComponents.SwitchProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="switch-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const switch = new Switch_A(document.querySelector('.switch-container'), {
 *   onChange: () => {
 *     console.log('switch was toggled');
 *   },
 *   label: 'Toggle',
 * });
 * await switch.render();
 */
export class Switch extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SwitchProps}
     */
    this._props;

    this._switch = new FP_Switch_A();

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
   * @memberof TComponents.Switch
   * @returns {TComponents.SwitchProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // X/Y/W/H/B/R
      position: 'static',
      width: 50,
      height: 25,
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // Input variable binding properties.
      text: '0',
      inputVar: {
        type: 'bool', // 'any' | 'string' | 'num' | 'bool'
        func: 'custom', // 'custom' | 'sync'
        value: '0', // string
        isHidden: false,
      },
      onChange: '',
      // Special properties.
      readOnly: false,
    };
  }

  /**
   * Initializes the switch component.
   * @memberof TComponents.Switch
   */
  onInit() {
    this._switch.onchange = this._cbOnChange.bind(this);
  }

  /**
   * Renders the switch component.
   * @memberof TComponents.Switch
   */
  onRender() {
    try {
      this.removeAllEventListeners();
      this._switch.attachToElement(this.find('.tc-switch'));

      if (this._props.inputVar.func == 'sync') {
        this._bindData = Component_A.getBindData(this._props.inputVar.value);
      }

      this.text = Component_A.dynamicText(this._props.text, this);
    } catch (e) {
      Popup_A.error(e, 'TComponents.Switch');
    }
  }

  /**
   * Generates the markup for the switch component.
   * @memberof TComponents.Switch
   * @returns {string} HTML markup string
   */
  markup() {
    return /*html*/ `<div class="tc-switch"></div>`;
  }

  /**
   * Callback function which is called when the button is pressed, it triggers any function registered with {@link TComponents.Switch#onChange|onChange}.
   * @alias _cbOnChange
   * @memberof TComponents.Switch
   * @param {any} value
   * @private
   * @async
   */
  async _cbOnChange(value) {
    let tempVal = value;
    const flag = await this.syncInputData(tempVal);
    if (!flag) {
      // Restore to the previous state.
      tempVal = !tempVal;
      this.active = tempVal;
    }
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    fn && fn(tempVal);
  }

  /**
   * @type {string|boolean|number}
   * @memberof TComponents.Switch
   */
  get text() {
    return this._props.text;
  }

  /**
   * @type {string|boolean|number}
   * @memberof TComponents.Switch
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
        //
      }
    } else {
      const err = new Error('Invalid text data.');
      Popup_A.error(err, 'TComponents.Switch');
      this.active = false;
    }
  }

  /**
   * Switch status: true if active, false otherwise
   * @alias active
   * @type {boolean}
   * @memberof TComponents.Switch
   * @private
   */
  get active() {
    const status = this._switch.active;
    return status;
  }

  /**
   * @private
   */
  set active(value) {
    this._switch.active = value;
  }

  /**
   * Gets the pointer release event handler.
   * @memberof TComponents.Switch
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
   * @memberof TComponents.Switch
   * @param {function} t - The new pointer release handler function.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * Switch_1.onChange = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * Switch_1.onChange = (...args) => { console.log(args); }
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
Switch.loadCssClassFromString(/*css*/ `
.tc-switch {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-switch .fp-components-switch-container-disabled,
.tc-switch .fp-components-switch-container,
.tc-switch .fp-components-switch-button {
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-switch .fp-components-switch-button-disabled{
  cursor:not-allowed !important;
}
.tc-switch .fp-components-switch-button:hover {
  opacity:0.7;
}


.tc-switch .fp-components-switch-button {
  border-radius: 50% / 100%;
}

.tc-switch .fp-components-switch-button .fp-components-switch-button-knob {
  height: 100%;
  width: 50%;
  border-radius: 100%;
  margin: 0px;
  margin-left: 0%;
}

.tc-switch .fp-components-switch-button-active .fp-components-switch-button-knob {
  margin-left: 50%;
}
`);
