import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {FP_Radio_A} from './fp-ext/fp-radio-ext.js';
import {formatOptionsString} from './utils/utils.js';

/**
 * @typedef {Object} TComponents.FP_Radio_A
 * @property {Function} [onChange] - Function to be called when a radio is clicked
 */

/**
 * Switch element. Additional callbacks can be added with the {@link TComponents.Radio#onChange|onChange} method.
 * @class TComponents.Radio
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SwitchProps} [props]
 * @property {TComponents.SwitchProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="radio-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const radio = new Radio(document.querySelector('.radio-container'), {
 *     optionItems: 'Option 1|value1;Option 2|value2;Option 3|value3',
 *     selectedIndex: 0,
 *   });
 */
export class Radio extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.RadioProps}
     */
    this._props;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Radio
   * @returns {TComponents.RadioProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      onChange: '',
      // X/Y/W/H/B/R
      position: 'static',
      width: 210,
      height: 25,
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // Function
      functionality: {
        types: [],
        params: [
          {type: '', variablePath: '', isHidden: false},
          {type: 'num', variablePath: '', isHidden: false},
        ],
      },
      // layout
      // layout: {
      //   isHorizontal: true,
      //   itemWidth: 0,
      // },
      // font color
      color: '#000000',
      // font style
      font: {
        fontSize: 12,
        fontFamily: 'Segoe UI',
        style: {
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
        },
      },
      // Data
      value: '',
      selectedIndex: -1,
      optionItems: `text1|value1;text2|value2;text3|value3`,
    };
  }

  /**+
   * Initializes the radio component.
   * @memberof TComponents.Radio
   */
  onInit() {}

  /**
   * Maps the internal components.
   * @returns {Object} The mapped components
   */
  mapComponents() {
    // Special case, the `this.child` within the lifecycle is only initialized once during construction and will not be dynamically added or removed afterward.
    // Here, we will use external properties to control the dynamic addition and removal of `child`. Therefore, to ensure that it is assigned each time, `this.child` must be set to null once.
    // This code is reflected in the `initChildrenComponents` function of `Component_A`.
    const child = [];
    this.child = [];
    let items = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Radio');
    for (let i = 0; i < items.length; i++) {
      let radio = new FP_Radio_A();
      radio._desc = items[i].text;
      radio.props = this._props;
      radio.font = this._props.font;
      radio.color = this._props.color;
      radio.checked = this._props.selectedIndex == i ? true : false;
      radio.onclick = this._onChange.bind(this, i);
      radio.enabled = this.enabled;
      child.push(radio);
    }
    return child;
  }

  /**
   * Renders the radio component.
   * @memberof TComponents.Radio
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      const radioContainer = this.find('.fp-components-radio-group');
      if (radioContainer) {
        // radioContainer.style.gap = `10px`;
        radioContainer.classList.add('horizontal-layout');
      }

      for (let i = 0; i < this.child.length; i++) {
        this.child[i].attachToElement(radioContainer);
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Radio');
    }
  }

  /**
   * Generates the markup for the radio component.
   * @memberof TComponents.Radio
   * @returns {string} HTML markup string
   */
  markup() {
    return /*html*/ `
    <div class="tc-radio">
      <div class="fp-components-radio-group"></div>
    </div>
    `;
  }

  /**
   * Callback function which is called when the button is pressed, it triggers any function registered with {@link TComponents.Radio#onChange|onChange}.
   * @alias _onChange
   * @memberof TComponents.Radio
   * @param {Number} index - The index of the clicked radio component.
   * @private
   * @async
   */
  async _onChange(index) {
    if (this.enabled) {
      const fn = Component_A.genFuncTemplate(this._props.onChange, this);
      // clear check status for other radio components
      for (let i = 0; i < this.child.length; i++) {
        if (i != index) this.child[i].checked = false;
      }
      this.selectedIndex = index;
      fn && fn(index);
    }
  }

  /**
   * @type {string|boolean|number}
   * @memberof TComponents.Radio
   */
  get text() {
    return this._props.text;
  }

  /**
   * Gets the pointer release event handler.
   * @memberof TComponents.Radio
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
   * @memberof TComponents.Radio
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

  /**
   * Gets the index of the currently selected option.
   * @returns {number} The index of the selected option.
   * @memberof TComponents.Radio
   */
  get selectedIndex() {
    return this._props.selectedIndex;
  }

  /**
   * Sets the index of the selected option.
   * @param {number} v - The index to set as selected.
   * @memberof TComponents.Radio
   */
  set selectedIndex(v) {
    this.setProps({selectedIndex: v});
  }

  /**
   * Gets the formatted option items.
   * @returns {Array<Object>} The formatted option items.
   * @memberof TComponents.Radio
   */
  get optionItems() {
    const data = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Radio');
    for (let i = 0; i < data.length; i++) {
      data[i].text = data[i].text.replace(/^\n+/, '');
    }
    return data;
  }

  /**
   * Sets the option items from a formatted string.
   * @param {string} itemsString - The formatted string of option items.
   * @memberof TComponents.Radio
   */
  set optionItems(itemsString) {
    this.setProps({
      optionItems: itemsString,
    });
  }

  /**
   * Gets the value of the currently selected radio.
   * @returns {string} The text of the selected radio.
   * @memberof TComponents.Radio
   */
  get value() {
    var items = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Radio');
    return items[this._props.selectedIndex].value;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Radio.loadCssClassFromString(/*css*/ `
.tc-radio {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-radio .fp-components-radio-group {
  width: 100%;
  height: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}
.tc-radio .fp-components-radio-container{
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 10px;
}
.tc-radio .fp-components-radio-group > *:last-child {
  margin-right: 0px;
}
.tc-radio .fp-components-radio-group .fp-components-radio-disabled{
  cursor: not-allowed !important;
  border-color:var(--fp-color-BLACK-OPACITY-30);
}
.tc-radio .fp-components-radio-group .fp-components-radio:hover{
  opacity:0.7;
}

.horizontal-layout {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  flex-wrap: wrap;
  align-content: space-around;
  justify-content: flex-start;
  align-items: center;
}
.vertical-layout {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
`);
