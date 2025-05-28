import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {FP_Checkbox_A} from './fp-ext/fp-checkbox-ext.js';

export class Checkbox_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
    this._props;
    this._bindData;
    this._checkbox = new FP_Checkbox_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Checkbox_A
   */
  defaultProps() {
    return {
      // lifecycle
      onCreated: '',
      onMounted: '',
      onChange: '',
      // X/Y/W/H/B/R
      position: 'static',
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // description text label
      text: '',
      // selected value.
      value: null,
      selectedIndex: 0,
      // font and color
      color: '#000000',
      font: {
        fontSize: 12,
        fontFamily: 'Segoe UI',
        style: {
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
        },
      },
      // Bind input variable.
      inputVar: {
        type: Component_A.INPUTVAR_TYPE.BOOL,
        func: Component_A.INPUTVAR_FUNC.CUSTOM,
        value: 0,
        isHidden: false,
      },
      // state properites
      enabled: true,
      checked: false,
    };
  }

  /**
   * Initializes the component and sets up click event handling.
   * @alias onInit
   * @memberof TComponents.Checkbox_A
   * @async
   */
  onInit() {
    /*
     * If bound to web data, `this._bindData` will have the format: { type: 'webdata', key: 'xxx' }.
     * If bound to digital signal data, `this._bindData` will have the format: { type: 'digitalsignal', key: 'xxxx' }.
     * If bound to rapid data, `this._bindData` will have the format: { type: 'rapiddata', dataType: 'xxx', module: 'xxx', name: 'xxx', task: 'xxx' }.
     */
    this._bindData = null;
  }

  /**
   * Renders the component on the screen and applies the necessary styles and event listeners.
   * @alias onRender
   * @memberof TComponents.Checkbox_A
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      const checkBoxContainer = this.find('.tc-checkbox-a');
      if (checkBoxContainer) {
        this._checkbox.desc = this._props.text;
        this._checkbox.checked = this._props.checked;
        this._checkbox.enabled = this._props.enabled;
        this._checkbox.font = this._props.font;
        this._checkbox.color = this._props.color;
        if (this._props.inputVar && this._props.inputVar.func == Component_A.INPUTVAR_FUNC.SYNC) {
          this._bindData = Component_A.getBindData(this._props.inputVar.value);
        }
        this._checkbox.onclick = this._onChange.bind(this);
        this._checkbox.attachToElement(checkBoxContainer);
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Checkbox_A');
    }
  }

  /**
   * Returns the HTML markup for the component.
   * @alias markup
   * @memberof TComponents.Checkbox_A
   * @returns {string} The HTML markup for the component.
   */
  markup() {
    return /*html*/ `<div class="tc-checkbox-a"></div>`;
  }

  /**
   * Adds a callback function that will be called when the checkbox state is changed.
   * @alias _onChange
   * @memberof TComponents.Checkbox_A
   */
  async _onChange() {
    try {
      if (this._props.enabled) {
        const flag = await this.syncInputData();
        if (!flag) {
          // Restore to the previous state.
          this._checkbox.checked = !this._checkbox.checked;
          return;
        }
        this._props.checked = this._checkbox.checked;
        const fn = Component_A.genFuncTemplate(this._props.onChange, this);
        fn && fn();
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Checkbox_A');
    }
  }

  /**
   * Get and set the checked state for the component.
   * @memberof TComponents.Checkbox_A
   * @param {string} value - The checked state variable.
   */
  get checked() {
    return this._props.checked;
  }

  set checked(t) {
    this.setProps({checked: t});
  }

  /**
   * Gets the `onChange` event handler.
   * This returns the function associated with the `onChange` event or `undefined` if no valid handler is set.
   *
   * @returns {Function|undefined} A function to handle checkbox checked state changes or `undefined` if no valid handler is set.
   * @memberof TComponents.Checkbox_A
   */
  get onChange() {
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the `onChange` event handler for the checkbox component.
   * The handler can either be a string representing a function to be executed or a function itself.
   * The handler will be invoked with the `args` parameter, which includes the current value.
   *
   * Example 1: Using a string as the handler:
   * ```js
   * Checkbox_1.onChange = "console.log(args);"
   * ```
   * Example 2: Using a function as the handler:
   * ```js
   * Checkbox_1.onChange = (...args) => { console.log(args); }
   * ```
   *
   * @param {string|Function} t - A string representing a function to be executed or a function itself to handle the `onChange` event.
   * @memberof TComponents.Checkbox_A
   */
  set onChange(t) {
    this.setProps({onChange: t});
  }

  /**
   * Sets the description text label for the checkbox.
   * @memberof TComponents.Checkbox_A
   * @param {string} value - The new description text label.
   */
  get text() {
    return this._props.text;
  }

  set text(t) {
    this.setProps({text: t});
  }

  /**
   * Sets the check box binding value.
   * @memberof TComponents.Checkbox_A
   * @param {string} t - The new value binded by check box.
   */

  get value() {
    return this._props.value;
  }

  set value(t) {
    this._props.value = t;
  }

  /**
   * Sets the check box binding index.
   * @memberof TComponents.Checkbox_A
   * @param {number} t - The new index binded by check box.
   */
  get selectedIndex() {
    return this._props.selectedIndex;
  }

  set selectedIndex(t) {
    this.this._props.selectedIndex = t;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Checkbox_A.loadCssClassFromString(/*css*/ `
.tc-checkbox-a {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
  display:flex;
}

.tc-checkbox-a .fp-components-checkbox-root-disabled,
.tc-checkbox-a .fp-components-checkbox-root {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.tc-checkbox-a .fp-components-checkbox-disabled {
  cursor: not-allowed !important;
  border-color:var(--fp-color-BLACK-OPACITY-30);
}

.tc-checkbox-a .fp-components-checkbox:hover {
  opacity:0.7;
}

.tc-checkbox-a .fp-components-checkbox-desc {
  font-size: 14px;
  color: inherit;
  white-space: nowrap;
  margin-left: 10px;
}
`);
