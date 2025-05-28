import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {formatOptionsString} from './utils/utils.js';
import {Checkbox_A} from './as-checkbox-a.js';

export class CheckboxGroup_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
    this._props;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.CheckboxGroup_A
   */
  defaultProps() {
    return {
      // lifecycle
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
      // The properties.
      optionItems: `text1|value1;\ntext2|value2;\ntext3|value3`,
    };
  }

  /**
   * Initializes the component and sets up click event handling.
   * @alias onInit
   * @memberof TComponents.CheckboxGroup_A
   * @async
   */
  onInit() {
    this._optionItemList = [];
  }

  /**
   * Maps the internal components.
   * @returns {Object} The mapped components
   */
  mapComponents() {
    // Special case, the `this.child` within the lifecycle is only initialized once during construction and will not be dynamically added or removed afterward.
    // Here, we will use external properties to control the dynamic addition and removal of `child`. Therefore, to ensure that it is assigned each time, `this.child` must be set to null once.
    // This code is reflected in the `initChildrenComponents` function of `Component_A`.

    const child = [];

    this._optionItemList = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.CheckboxGroup_A');

    for (let i = 0; i < this._optionItemList.length; i++) {
      let ischecked = false;
      const ctext = this._optionItemList[i].text;
      const cvalue = this._optionItemList[i].value;

      // Get specifical child item previous checked state.
      if (Array.isArray(this.child)) {
        const index = this.child.findIndex((c) => c._props.text == ctext);
        if (index >= 0) ischecked = this.child[index]._props.checked;
      }
      const checkbox = new Checkbox_A(null, {
        text: ctext,
        font: this._props.font,
        color: this._props.color,
        checked: ischecked,
        enabled: this.enabled,
        onChange: this._props.onChange,
        selectedIndex: i,
        value: cvalue,
      });
      child.push(checkbox);
    }

    this.child = [];
    return child;
  }

  /**
   * Renders the component on the screen and applies the necessary styles and event listeners.
   * @alias onRender
   * @memberof TComponents.CheckboxGroup_A
   */
  onRender() {
    try {
      this.removeAllEventListeners();
      const checkBoxGroupContainer = this.find('.tc-checkbox-group-a-container');
      for (let i = 0; i < this.child.length; i++) {
        this.child[i].attachToElement(checkBoxGroupContainer);
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.CheckboxGroup_A');
    }
  }

  /**
   * Returns the HTML markup for the component.
   * @alias markup
   * @memberof TComponents.CheckboxGroup_A
   * @returns {string} The HTML markup for the component.
   */
  markup() {
    return /*html*/ `<div class="tc-checkbox-group-a">
      <div class="tc-checkbox-group-a-container"></div>
    </div>`;
  }

  /**
   * Gets the `onChange` event handler.
   * This returns the function associated with the `onChange` event or `undefined` if no valid handler is set.
   *
   * @returns {Function|undefined} A function to handle checkbox group checked state changes or `undefined` if no valid handler is set.
   * @memberof TComponents.CheckboxGroup_A
   */
  get onChange() {
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    if (typeof fn == 'function') return fn;
    else return undefined;
  }

  /**
   * Sets the `onChange` event handler for the checkbox group component.
   * The handler can either be a string representing a function to be executed or a function itself.
   * The handler will be invoked with the `args` parameter, which includes the current value.
   * @param {string|Function} t - A string representing a function to be executed or a function itself to handle the `onChange` event.
   * @memberof TComponents.CheckboxGroup_A
   * */
  set onChange(t) {
    this.setProps({onChange: t});
  }

  /**
   * Gets the formatted option items.
   * @returns {Array<Object>} The formatted option items.
   * @memberof TComponents.CheckboxGroup_A
   */
  get optionItems() {
    const data = formatOptionsString(this._props.optionItems, Popup_A.error, 'TComponents.CheckboxGroup_A');
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i].text === 'string') {
        data[i].text = data[i].text.replace(/^\n+/, '');
      }
    }
    return data;
  }

  /**
   * Sets the option items from a formatted string.
   * @param {string} itemsString - The formatted string of option items.
   * @memberof TComponents.CheckboxGroup_A
   */
  set optionItems(t) {
    this.setProps({optionItems: t});
  }
}

CheckboxGroup_A.loadCssClassFromString(/*css*/ `
.tc-checkbox-group-a {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-checkbox-group-a-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content:center;
}
`);
