import {Component_A} from './basic/as-component.js';
import {FP_Select_A} from './fp-ext/fp-select-ext.js';
import {Popup_A} from './as-popup.js';
import {formatOptionsString} from './utils/utils.js';

/**
 * Select dropdown that allows users to choose from a list of options. Additional callbacks can be added with the {@link TComponents.Select#onChange|onChange} method.
 * @class TComponents.Select
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectProps} [props]
 * @property {TComponents.SelectProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="select-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const selectBox = new Select(document.querySelector('.select-container'), {
 *     optionItems: 'Option 1|value1;Option 2|value2;Option 3|value3',
 *     selectedIndex: 0,
 *   });
 */
export class Select extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectProps}
     */
    this._props;

    this._select = new FP_Select_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Select
   * @returns {TComponents.SelectProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',

      onChange: '',

      // ⭐ W/H/X/Y/B/R/Z: Component required attributes.
      position: 'static',
      width: 140,
      height: 40,
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
      // Style template
      size: 'small',
      // Font
      // label: 'label',
      labelPos: 'top',
      // helperText: 'This is a select',
      placeHolder: 'select a value',
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
        textAlign: 'left',
      },

      //  Border
      border: '2px solid #dbdbdb',
      // Data
      value: '',
      selectedIndex: 0,
      optionItems: `text1|value1;\ntext2|value2;\ntext3|value3`,
    };
  }

  /**
   * Initializes the component.
   * @async
   */
  async onInit() {}

  /**
   * Renders the select component.
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      if (this._props.labelPos === 'left' || this._props.labelPos === 'right') {
        this.container.classList.add('justify-stretch');
      }
      this._select.props = this._props;
      this._select.items = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Select');
      this._select.enabled = this.enabled;
      const selectContainer = this.find('.tc-select');
      if (selectContainer) this._select.attachToElement(selectContainer);

      this.addEventListener(this._select._root, 'change', this._onChange.bind(this));
    } catch (e) {
      Popup_A.error(e, 'TComponents.Select');
    }
  }

  /**
   * Returns the markup for the select component.
   * @returns {string} The HTML markup string.
   */
  markup() {
    return /*html*/ `<div class="tc-select"></div>`;
  }

  /**
   * Handles the change event for the select element.
   * @alias _onChange
   * @memberof TComponents.Select
   * @param {Event} e - The change event.
   * @async
   */
  async _onChange(e) {
    console.log('select _onChange');
    if (this.enabled) {
      console.log('select _onChange  enabled');

      const fn = Component_A.genFuncTemplate(this._props.onChange, this);
      var items = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Select');
      let current = items.find((i) => i.value == e.target.value);
      const index = items.findIndex((i) => i.value == e.target.value);
      current.index = index;
      this.selectedIndex = index;
      fn && fn(index);
    }
  }

  /**
   * Gets the highlight state of the select component.
   * @memberof TComponents.Select
   * @returns {boolean} The highlight state.
   */
  get highlight() {
    return this._select.highlight;
  }

  /**
   * Sets the highlight state of the select component.
   * @memberof TComponents.Select
   * @param {boolean} value - The highlight state to set.
   */
  set highlight(value) {
    this._select.highlight = value;
  }

  /**
   * Gets the pointer release event handler.
   * @memberof TComponents.Select
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
   * @memberof TComponents.Select
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
   * @memberof TComponents.Select
   */
  get selectedIndex() {
    return this._props.selectedIndex;
  }

  /**
   * Sets the index of the selected option.
   * @param {number} v - The index to set as selected.
   * @memberof TComponents.Select
   */
  set selectedIndex(v) {
    this.setProps({
      selectedIndex: v,
    });
  }

  /**
   * Gets the formatted option items.
   * @returns {Array<Object>} The formatted option items.
   * @memberof TComponents.Select
   */
  get optionItems() {
    const data = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Select');
    for (let i = 0; i < data.length; i++) {
      data[i].text = Component_A.dynamicText(data[i].text.replace(/^\n+/, ''));
    }
    return data;
  }

  /**
   * Sets the option items from a formatted string.
   * @param {string} itemsString - The formatted string of option items.
   * @memberof TComponents.Select
   */
  set optionItems(itemsString) {
    this.setProps({
      optionItems: itemsString,
    });
  }

  /**
   * Gets the text of the currently selected option.
   * @returns {string} The text of the selected option.
   * @memberof TComponents.Select
   */
  get text() {
    const items = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Select');
    let text = items[this._props.selectedIndex].text;
    text = text.replace(/^\n+/, '');
    return Component_A.dynamicText(text);
  }

  /**
   * Gets the value of the currently selected option.
   * @returns {string} The text of the selected option.
   * @memberof TComponents.Select
   */
  get value() {
    var items = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.Select');
    return items[this._props.selectedIndex].value;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Select.loadCssClassFromString(/*css*/ `
.tc-select {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-select .fp-components-select-disabled,
.tc-select .fp-components-select  {
  width: 100%;
  height: 100%;
  border: 2px solid #dbdbdb;
  border-radius: 8px;
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  padding:4px;
}

.tc-select .fp-components-select-disabled {
  cursor:not-allowed !important;
}
.tc-select .fp-components-select:hover {
  opacity:0.7;
}
   
`);
