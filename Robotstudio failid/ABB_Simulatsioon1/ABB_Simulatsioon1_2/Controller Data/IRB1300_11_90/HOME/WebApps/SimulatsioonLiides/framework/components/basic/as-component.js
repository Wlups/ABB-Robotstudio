import API from '../../api/index.js';
import {Base_A} from './as-base.js';
import {Accessors_A} from './as-accessors.js';
import {Eventing_A} from './as-event.js';
import {Popup_A} from '../as-popup.js';

/**
 * Load a CSS file
 * @alias tComponentsLoadCSS
 * @param {string} href - path of css file
 * @memberof TComponents
 */
function tComponentsLoadCSS(href) {
  let head = document.getElementsByTagName('head')[0];
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  head.appendChild(link);
}

tComponentsLoadCSS('framework/components/style/t-components.css');

/**
 * @typedef TComponents.ComponentProps
 * @prop {string} [label] Label text
 * @prop {string} [labelPos] Label position: "top|bottom|left|right|top-center|bottom-center"
 * @prop {object} [options] Set of options to modify the behaviour of the component
 * - async : if true, the subcomponents are instantiated asynchronously and onRender is executed inmediatelly without
 * waiting for the subcomponents to finish.
 */

/**
 * Creates an instance of TComponents.Component class.
 * This is the base parent class of all TComponent.
 * @class Component_A
 * @memberof TComponents
 * @extends TComponents.Base_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component.
 * @param {TComponents.ComponentProps} props Object containing {label} text paramenter
 * @property {HTMLElement} container - Container element where the component content is to be attached, this is then attached to the parent element
 * @property {TComponents.ComponentProps} props
 * @property {object} child - object containing all instances returned by {@link TComponents.Component_A.mapComponents} method.
 * @property {string} compId - Component UUID
 * @ignore
 *
 */
export class Component_A extends Accessors_A {
  constructor(parent, props = {}) {
    super(props);

    /**
     * @type {TComponents.ComponentProps}
     */
    this._props;

    if (!Component_A._isHTMLElement(parent) && parent !== null)
      throw new Error(
        `HTML parent element not detected. Set parent input argument to null if you want to attach the component later.`,
      );
    this._conditionDefaultProps = Object.assign(this.defaultProps(), props);

    this.compId = `${this.constructor.name}_${API.generateUUID()}`;

    this.child = null;

    /**
     * Parent HTML element where the component is attached to.
     * @type {HTMLElement}
     */
    this.parent = parent;
    this.container = document.createElement('div');
    this.container.id = this.compId;
    this.container.classList.add('t-component');
    this.parentComponentId = '';

    this.template = null;
    this.initialized = false;
    this._initCalled = false;
    this._enabled = true;

    this._deinstallFunction = null;
    this._eventListeners = new Map();
    this._fUpdate = false;
    Object.defineProperty(this, '_isTComponent', {
      value: true,
      writable: false,
    });

    this.once('before:init', () => {
      this.onCreated();
    });

    this.once('after:render', () => {
      this.onMounted();
    });
  }

  /**
   * Lifecycle hook called when the component is created.
   * @alias onCreated
   * @memberof TComponents.Component_A
   * @async
   */
  async onCreated() {
    const fn = Component_A.genFuncTemplate(this._props.onCreated, this);
    fn && fn();
  }

  /**
   * Lifecycle hook called when the component is mounted.
   * @alias onMounted
   * @memberof TComponents.Component_A
   * @async
   */
  async onMounted() {
    const fn = Component_A.genFuncTemplate(this._props.onMounted, this);
    fn && fn();
  }
  /**
   * Replace the content of the component's container.
   * @param {string|HTMLElement} content - The new content to replace the current content.
   * @alias replaceContent
   * @memberof TComponents.Component_A
   */
  replaceContent(content) {
    this.container.innerHTML = '';
    if (typeof content == 'string') {
      this.container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.container.appendChild(content);
    } else {
      this.container.innerHTML = content;
    }
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Component_A
   * @returns {TComponents.ComponentProps}
   */
  defaultProps() {
    return {label: '', labelPos: 'top'};
  }

  /**
   * Initialization of a component. Any asynchronous operation (like access to controller) is done here.
   * The {@link onInit()} method of the component is triggered by this method.
   * @alias init
   * @memberof TComponents.Component_A
   * @async
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async init() {
    try {
      this.trigger('before:init', this);

      /**
       * Clean up before initializing. Relevant from the second time the component is initialized.
       * - Remove all event listeners
       */
      this.removeAllEventListeners();

      /**
       * Parent HTML element where the component is attached to.
       */
      this.parent;

      /**
       * Initialization of internal states
       * @private
       */
      this.initialized = false;
      this._initCalled = true;

      /**
       * Reset values before onInit
       * Resetting enabled only if previously an error occurred, for a next try, otherwise it was explicitly disabled by the user
       */
      if (this.error) this.enabled = true;
      this.error = false;

      try {
        this._deinstallFunction = await this.onInit();
      } catch (e) {
        console.error(e);
        this.error = true;
      }

      this.trigger('init', this);

      return await this.render();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Update the content of the instance into the Document Object Model (DOM).
   * The {@link onRender()} method of this component and eventual initialization
   * of sub-components are managed by this method.
   * @alias render
   * @memberof TComponents.Component_A
   * @async
   * @param {object} [data] - Data that can be passed to the component, which may be required for the rendering process.
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async render(data = null) {
    this.container.innerHTML = '';
    try {
      this.trigger('before:render', this);

      if (this._initCalled === false) return await this.init();

      this._handleData(data);
      this._createTemplate();

      await this.initChildrenComponents();
    } catch (e) {
      this.error = true;
      console.error(e);
    }

    if (this.container.hasChildNodes() && this._labelStart()) {
      // Insert before the first child node
      this.container.insertBefore(this.template.content, this.container.firstChild);
    } else {
      this.container.appendChild(this.template.content);
    }

    this.parent && this.attachToElement(this.parent);
    this.error && (this.enabled = false);

    this._setContainerBasicCss();
    this.onRender();

    this.initialized = true;
    this.trigger('render', this);
    this.trigger('after:render', this);
    return this;
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @alias onInit
   * @memberof TComponents.Component_A
   * @abstract
   * @async
   * @alias onInit
   * @memberof TComponents.Component_A
   */
  async onInit() {}

  /**
   * Contians all synchronous operations/setups that may be required for any sub-component after its initialization and/or manipulation of the DOM.
   * This method is called internally during rendering process orchestrated by {@link render() render}.
   * @alias onRender
   * @memberof TComponents.Component_A
   * @abstract
   * @alias onRender
   * @memberof TComponents.Component_A
   */
  onRender() {}

  /**
   * Synchronously initializes all child TComponents returned by {@link #mapComponents() mapComponents} method.
   * This method is internally called by {@link #render() render} method.
   * @alias initChildrenComponents
   * @memberof TComponents.Component_A
   * @private
   * @async
   */
  async initChildrenComponents() {
    const newChildren = this.mapComponents();
    const toDispose = [];
    if (Object.keys(newChildren).length === 0) return;

    // Initialize this.child if it's not already initialized
    if (!this.child) {
      this.child = newChildren;
    } else {
      for (const key in newChildren) {
        const newChild = newChildren[key];
        const oldChild = this.child[key];

        if (Component_A.isTComponent(oldChild) && Component_A.isTComponent(newChild)) {
          // const shouldUpdate = !Base_A._equalProps(oldChild._props, newChild._props) || oldChild._fUpdate;
          const shouldUpdate = oldChild._fUpdate || !Component_A._equalProps(oldChild._props, newChild._props);

          if (shouldUpdate) {
            // If the properties are not equal or if _fUpdate is true,
            // Ensure old child is properly destroyed
            toDispose.push(oldChild);
            // Replace the existing child
            this.child[key] = newChild;
          } else {
            // If the properties are equal and _fUpdate is false, just attach the old child to the new DOM element
            if (newChild.compId !== oldChild.compId) {
              // cleaning up newChild since not needed, but just if it is a different instace as the old one
              oldChild.attachToElement(newChild.parent);
              newChild.destroy();
            }
          }
        } else {
          // If not a TComponent, replace the existing child anyway
          this.child[key] = newChild;
        }
      }
    }

    const arrAll = Object.entries(this.child).reduce((acc, [key, value]) => {
      if (value instanceof Promise)
        throw new Error(`Promise detected but not expected at ${this.compId}--mapComponent element ${key}...`);

      const sortComponent = (value) => {
        if (Component_A.isTComponent(value)) {
          value.parentComponentId = this.compId;
          acc.push(value);
        }
      };

      if (Array.isArray(value)) {
        value.forEach((v) => {
          sortComponent(v);
        });
      } else {
        sortComponent(value);
      }
      return acc;
    }, []);

    const initChildren = function () {
      return arrAll.map((child) => {
        return child._initCalled ? child : child.init();
      });
    };

    const status = this._props.options.async ? initChildren() : await Promise.all(initChildren());

    // Clean up the replaced old children objects
    toDispose.forEach((child) => child.destroy());
  }

  /**
   * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
   * All these components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
   * @alias mapComponents
   * @memberof TComponents.Component_A
   * @abstract
   * @returns {object} Contains all child TComponents instances used within the component.
   */
  mapComponents() {
    return {};
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * @alias markup
   * @memberof TComponents.Component_A
   * @param {object} self - The TComponents instance on which this method was called.
   * @abstract
   * @returns {string}
   */
  markup(self) {
    return /*html*/ '';
  }

  /**
   * Adds an event listener to the specified element and keeps track of it.
   * @param {HTMLElement} element - The target element to which the event listener will be added.
   * @param {string} eventType - The type of the event to listen for (e.g., 'click', 'mouseover').
   * @param {Function} listener - The function that will be called when the event is triggered.
   * @param {boolean|AddEventListenerOptions} [options] - Optional options object or useCapture flag.
   * @throws {Error} Throws an error if the specified element is not found.
   */
  addEventListener(element, eventType, listener, options) {
    if (!element) throw new Error('Element not found');
    element.addEventListener(eventType, listener, options);

    if (!this._eventListeners.has(element)) {
      this._eventListeners.set(element, []);
    }
    this._eventListeners.get(element).push({eventType, listener});
  }

  /**
   * Removes all event listeners that were added using addEventListener.
   */
  removeAllEventListeners() {
    if (!this._eventListeners) return;
    this._eventListeners.forEach((listeners, element) => {
      listeners.forEach(({eventType, listener}) => {
        element.removeEventListener(eventType, listener);
      });
    });
    this._eventListeners.clear();
  }

  /**
   * Clean up before initializing. Relevant from the second time the component is initialized.
   * - Call onDestroy method
   * - Call return function from onInit method if it exists
   * - Detach the component from the parent element
   * - Remove all local events, like this.on('event', callback)
   * - Remove all event listeners attached with this.addEventListener
   * @alias destroy
   * @memberof TComponents.Component_A
   * @private
   */
  destroy() {
    // calling instance specific onDestroy method
    try {
      this.onDestroy();
    } catch (error) {
      console.warn('Error during onDestroy method. Continue anyway...', error);
    }

    // clean reference to attached callbacks
    this.cleanUpEvents();

    // deinstall function (returned by onInit method)
    if (this._deinstallFunction && typeof this._deinstallFunction === 'function') this._deinstallFunction();

    if (this.container.parentElement) this.container.parentElement.removeChild(this.container);

    this.removeAllEventListeners();
    if (this.child) {
      Object.keys(this.child).forEach((key) => {
        if (Component_A.isTComponent(this.child[key])) this.child[key].destroy();
      });
    }
  }

  /**
   * This method is called internally during clean up process orchestrated by {@link destroy() destroy}.
   * @alias onDestroy
   * @memberof TComponents.Component_A
   * @async
   */

  onDestroy() {}

  /**
   * Static method to check if an object is a TComponent.
   * @memberof TComponents.Component_A
   * @param {Object} obj - The object to check.
   * @returns {boolean} True if the object is a TComponent, false otherwise.
   */
  static isTComponent(obj) {
    return obj && obj._isTComponent ? true : false;
  }

  /**
   * @alias _equalProps
   * @memberof TComponents.Component_A
   * @static
   * @param {object} newProps
   * @param {object} prevProps
   * @returns {boolean}
   * @private
   */
  static _equalProps(newProps, prevProps) {
    // use JSON.stringify with helper function to convert function to string to compare objects
    const stringify = (obj) => {
      return JSON.stringify(obj, (key, value) => {
        if (Component_A.isTComponent(value)) {
          return value.compId;
        }
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      });
    };

    return stringify(newProps) === stringify(prevProps);
  }

  /**
   * Changes the DOM element in which this component is to be inserted.
   * @alias attachToElement
   * @memberof TComponents.Component_A
   * @param {HTMLElement | Element} element - Container DOM element
   */
  attachToElement(element) {
    if (!Component_A._isHTMLElement(element)) return;
    // throw new Error(`HTML element container required but not detected`);

    if (!this.parent) {
      this.parent = element;
      this.parent.appendChild(this.container);
    } else if (this.parent === element) {
      // only add if it not already exists
      this.parent.contains(this.container) === false && this.parent.appendChild(this.container);
    } else {
      // remove from old parent to attach to new one
      this.parent.contains(this.container) && this.parent.removeChild(this.container);
      this.parent = element;
      this.parent.appendChild(this.container);
    }
  }

  /**
   * Returns the first Element within the component that matches the specified selector. If no matches are found, null is returned.
   * @alias find
   * @memberof TComponents.Component_A
   * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
   * @returns {HTMLElement | Element} An Element object representing the first element within the component that matches the specified set of CSS selectors, or null if there are no matches.
   */
  find(selector) {
    const el = this.template && this.template.content.querySelector(selector);

    return el ? el : this.container.querySelector(selector);
  }

  /**
   * Returns an Array representing the component's elements that matches the specified selector. If no matches are found, an empty Array is returned.
   * @alias all
   * @memberof TComponents.Component_A
   * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
   * @returns {Element[]} An Array of Elements that matches the specified CSS selector, or an empty array if there are no matches.
   */
  all(selector) {
    var aContainer = Array.from(this.container.querySelectorAll(selector));
    var nlTemplate = this.template && this.template.content.querySelectorAll(selector);

    if (nlTemplate) {
      Array.from(nlTemplate).forEach(function (tElem) {
        var isDuplicate = aContainer.some((cElem) => tElem === cElem);
        if (!isDuplicate) {
          aContainer[aContainer.length] = tElem;
        }
      });
    }

    return aContainer;
  }

  /**
   * Changes visibility of the component to not show it in the view.
   * @alias hide
   * @memberof TComponents.Component_A
   */
  hide() {
    this.container.classList.add('tc-hidden');
  }

  /**
   * Changes visibility of the component to show it in the view.
   * @alias show
   * @memberof TComponents.Component_A
   */
  show() {
    this.container.classList.remove('tc-hidden');
  }

  /**
   * Get the hidden state of the component.
   * @alias hidden
   * @memberof TComponents.Component_A
   * @returns {boolean} True if the component is hidden, false otherwise.
   */
  get hidden() {
    return this.container.classList.contains('tc-hidden');
  }

  /**
   * Validates the CSS properties to ensure they are of the correct types.
   * @returns {boolean} - Returns true if all properties are valid, otherwise false.
   */
  _validateBasicCssProps() {
    const {width, height, left, top, zIndex, position} = this._props;

    if (
      typeof width === 'number' &&
      typeof height === 'number' &&
      typeof left === 'number' &&
      typeof top === 'number' &&
      typeof zIndex === 'number' &&
      typeof position === 'string'
    ) {
      return true;
    }

    return false;
  }

  /**
   * Applies the basic CSS styles to the container element.
   */
  _setContainerBasicCss() {
    if (!this._validateBasicCssProps()) return;

    const {width, height, left, top, zIndex, position} = this._props;

    Object.assign(this.container.style, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
      zIndex,
      position,
    });
  }

  /**
   * Changes the background color of the component
   * @alias backgroundColor
   * @memberof TComponents.Component_A
   * @param {string} param - Parameter: There are four parameter accepted by backgroundColor property: "color|transparent|initial|inherit"
   *                            color: This property holds the background color.
   *                            transparent: By default the background color is transparent.
   *                            initial: Set this property to it’s default
   *                            inherit: Inherits the property from it’s parent element
   */
  // backgroundColor(param) {
  //   this.container.style.backgroundColor = param;
  // }

  /**
   * Changes apperance of the component (border and background color) to frame it or not.
   * @alias cssBox
   * @memberof TComponents.Component_A
   * @param {boolean} enable - if true, the component is framed, if false, not frame is shown
   */
  cssBox(enable = true) {
    enable ? this.container.classList.add('tc-container-box') : this.container.classList.remove('tc-container-box');
  }

  /**
   * Sets or returns the contents of a style declaration as a string.
   * @alias css
   * @memberof TComponents.Component_A
   * @param {string|Array} properties - Specifies the content of a style declaration.
   * E.g.: "background-color:pink;font-size:55px;border:2px dashed green;color:white;"
   */
  css(properties) {
    if (!properties) {
      this.container.style.cssText = '';
      return;
    }

    let s = '';
    if (typeof properties === 'string') s = properties;
    else if (Array.isArray(properties)) {
      s = properties.join(';');
      s += ';';
    } else if (typeof properties === 'object') {
      for (const [key, val] of Object.entries(properties)) {
        s += `${key} : ${val};`;
      }
    }
    this.container.style.cssText = s;
  }

  /**
   * Adds a class to underlying element(s) containing the input selector
   * @alias cssAddClass
   * @memberof TComponents.Component_A
   * @param {string} selector - CSS selector, if class: ".selector", if identifier: "#selector"
   * @param {string | string[]} classNames - name of the class to appy (without dot)
   * @param {boolean} [all] - if true it will apply the class to all selector found, otherwise it applies to the first one found
   */
  cssAddClass(selector, classNames, all = false) {
    if (!selector || !classNames) return;
    let arrClassNames = Array.isArray(classNames) ? classNames : [...classNames.replace(/^\s/g, '').split(' ')];

    // check if array is empty
    if (arrClassNames.length === 0) return;
    // filter out emmpty strings
    arrClassNames = arrClassNames.filter((c) => c !== '');

    if (selector === 'this') this.container.classList.add(...arrClassNames);
    else {
      const el = all ? this.all(selector) : this.find(selector);
      if (el)
        Array.isArray(el) ? el.forEach((el) => el.classList.add(...arrClassNames)) : el.classList.add(...arrClassNames);
    }
  }

  /**
   * Removes a class to underlying element(s) containing the input selector
   * @alias cssRemoveClass
   * @memberof TComponents.Component_A
   * @param {string} selector - CSS selector, if class: ".selector", if identifier: "#selector"
   * @param {string} classNames - name of the class to appy (without dot)
   * @param {boolean} [all] - if true it will apply the class to all selector found, otherwise it applies to the first one found
   */
  cssRemoveClass(selector, classNames, all = false) {
    if (!selector || !classNames) return;
    let arrClassNames = Array.isArray(classNames) ? classNames : [...classNames.replace(/^\s/g, '').split(' ')];

    // check if array is empty
    if (arrClassNames.length === 0) return;
    // filter out emmpty strings
    arrClassNames = arrClassNames.filter((c) => c !== '');

    if (selector === 'this') this.container.classList.remove(...arrClassNames);
    else {
      const el = all ? this.all(selector) : this.find(selector);
      if (el)
        Array.isArray(el)
          ? el.forEach((el) => el.classList.remove(...arrClassNames))
          : el.classList.remove(...arrClassNames);
    }
  }

  /**
   * Force a rerender when a component is handled inside the mapComponents method of a higher order component.
   * Normally this happens only when the props has changed. If this function is called inside a component.
   * @alias forceUpdate
   * @private
   */
  forceUpdate() {
    this._fUpdate = true;
  }

  /**
   * Synchronizes the input data.
   *
   * This method checks if the input data is valid and triggers synchronization
   * using an external component. It handles errors gracefully and provides
   * feedback through a popup if synchronization fails.
   *
   * @alias syncInputData
   * @async
   * @param {*} value - The value to be synchronized. This can be of any type depending on the implementation.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the synchronization is successful,
   *                             or `false` if an error occurs or binding data is null.
   * @throws {Error} If binding data is null or synchronization fails unexpectedly.
   */
  async syncInputData(value) {
    if (this._props.inputVar && this._props.inputVar.func === Component_A.INPUTVAR_FUNC.SYNC) {
      if (this._bindData !== null) {
        try {
          const flag = await Component_A.syncData(value, this);
          return flag;
        } catch (e) {
          Popup_A.error(e, 'Sync input data');
          return false;
        }
      } else {
        const e = new Error('Failed to parse the binding data!');
        Popup_A.error(e, 'Sync input data');
        return false;
      }
    } else if (this._props.inputVar && this._props.inputVar.func === Component_A.INPUTVAR_FUNC.CUSTOM) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Determines if the label should be positioned at the start (top or left).
   * @private
   * @returns {boolean} True if the label should be at the start, false otherwise.
   */
  _labelStart() {
    return this._props.label && (this._props.labelPos.includes('top') || this._props.labelPos.includes('left'));
  }

  /**
   * Determines if the label should be positioned at the end (bottom or right).
   * @private
   * @returns {boolean} True if the label should be at the end, false otherwise.
   */
  _labelEnd() {
    return this._props.label && (this._props.labelPos.includes('bottom') || this._props.labelPos.includes('right'));
  }

  /**
   * Generates the markup for the component including the label if necessary.
   * @private
   * @returns {string} The HTML markup of the component.
   */
  _markupWithLabel() {
    const markup = this.markup(this);

    return /*html*/ `
      ${markup}
  `;
  }

  /**
   * Handles and updates the internal data object with the provided data.
   * @private
   * @param {Object} data - The data to handle and update.
   */
  _handleData(data) {
    if (data) {
      if (!this._data) this._data = {};
      Object.keys(data).forEach((key) => (this._data[key] = data[key]));
    }
  }

  /**
   * Creates a new template element and sets its innerHTML with the component's markup including the label.
   * @private
   */
  _createTemplate() {
    this.template = document.createElement('template');
    this.template.innerHTML = this._markupWithLabel();
  }

  /**
   * Recursively search for property of an object and underlying objects of type TComponents and FPComponents.
   * @alias _hasChildOwnProperty
   * @memberof TComponents.Component_A
   * @static
   * @private
   * @param {object} obj
   * @param {string} property
   * @param {object[]} [result=[]] result - Array of objects already found during the recursively execution
   * @returns {object[]} Array of objects found or empty array if nothing found
   */
  static _hasChildOwnProperty(obj, property, result = []) {
    if (typeof obj === 'object' && obj !== null && (Component_A.isTComponent(obj) || Component_A._isFPComponent(obj))) {
      for (const val of Object.values(obj)) {
        if (typeof val === 'object' && val !== null && val !== obj && !Component_A._isHTMLElement(val)) {
          if (Object.prototype.hasOwnProperty.call(val, property)) {
            result.push(val);
          }
          Component_A._hasChildOwnProperty(val, property, result);
        }
      }
    }
    return result;
  }

  /**
   * Recursively check for instances of type TComponent and FPComponent
   */
  static _hasChildComponent(obj, result = []) {}

  static _isFPComponent(o) {
    return Object.values(FPComponents).some((FPComponent) => o instanceof FPComponent);
  }

  /**
   * Check if an entry is HTML Element
   * @alias _isHTMLElement
   * @memberof TComponents.Component_A
   * @static
   * @param {any} o
   * @returns {boolean} true if entry is an HTMLElement, false otherwise
   */
  static _isHTMLElement(o) {
    return typeof HTMLElement === 'object'
      ? o instanceof HTMLElement //DOM2
      : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string';
  }

  /**
   * Loads a CSS class from a string and inserts it into the document.
   * @param {string} css - The CSS string to load.
   * @throws {Error} If css is not a string.
   */
  static loadCssClassFromString(css) {
    if (typeof css !== 'string') throw new Error('css must be a string');
    const tComponentStyle = document.createElement('style');
    tComponentStyle.innerHTML = css;
    const ref = document.querySelector('script');
    if (ref && ref.parentNode) ref.parentNode.insertBefore(tComponentStyle, ref);
  }

  /**
   * Returns markup based on a condition.
   * @param {boolean} condition - The condition to evaluate.
   * @param {string} markup - The markup to return if the condition is true.
   * @param {string} [elseMarkup=''] - The markup to return if the condition is false.
   * @returns {string} The appropriate markup based on the condition.
   */
  static mIf(condition, markup, elseMarkup = '') {
    return condition ? markup : elseMarkup;
  }

  /**
   * Maps an array to a string of markup.
   * @param {Array} array - The array to map.
   * @param {function} markup - The function to generate markup for each item.
   * @returns {string} The concatenated string of markup.
   */
  static mFor(array, markup) {
    return array.map((item, index) => markup(item, index)).join('');
  }

  /**
   * Updates the properties of the component.
   * @param {Object} [_newProps={}] - The new properties to merge with the current properties.
   */
  updateProps(_newProps = {}) {
    this.props = Object.assign(this.props, _newProps || this.defaultProps());
  }

  /**
   * Handles component state changes based on resource and action.
   * @param {Object} self - The component instance.
   * @param {Object} options - The options for the handler.
   * @param {string} options.resource - The resource to monitor.
   * @param {Object} options.instance - The instance information.
   * @param {string} options.state - The state to monitor.
   * @param {string} action - The action to perform.
   */
  static async handleComponentOn(self, {resource, instance, state}, action) {
    const actions = {
      disable: (condition) => (condition ? (self.enabled = false) : (self.enabled = true)),
      hide: (condition) => (condition ? self.hide() : self.show()),
      update: (condition) => {
        // eslint-disable-next-line no-undef
        condition && self.updateProps(updateProps);
      },
    };

    const eventHandlers = {
      OpMode: {
        event: 'op-mode',
        monitorFn: API.CONTROLLER.monitorOperationMode,
        callback: monitorOpMode,
        states: [API.CONTROLLER.OPMODE.Auto, API.CONTROLLER.OPMODE.ManualR],
      },
      Execution: {
        event: 'execution-state',
        monitorFn: API.RAPID.monitorExecutionState,
        callback: monitorExecutionState,
        states: [API.RAPID.EXECUTIONSTATE.Running, API.RAPID.EXECUTIONSTATE.Stopped],
      },
      Motor: {
        event: 'controller-state',
        monitorFn: API.CONTROLLER.monitorControllerState,
        callback: monitorControllerState,
        states: [API.CONTROLLER.STATE.MotorsOn, API.CONTROLLER.STATE.MotorsOff],
      },
      Error: {
        event: 'controller-state',
        monitorFn: API.CONTROLLER.monitorControllerState,
        callback: monitorControllerState,
        states: [API.CONTROLLER.STATE.SysFailure, API.CONTROLLER.STATE.EStop, API.CONTROLLER.STATE.GuardStop],
      },
    };

    const handler = eventHandlers[resource];

    if (handler) {
      handler.states.forEach(async (s) => {
        const cb = (state) => {
          actions[action](state === s);
        };

        if (state === s) {
          Component_A.globalEvents.on(handler.event, cb);

          // trigger once the callback depending on the event
          let currentState;
          if (handler.event === 'op-mode') {
            currentState = await RWS.Controller.getOperationMode();
          } else if (handler.event === 'execution-state') {
            currentState = await RWS.Rapid.getExecutionState();
          } else if (handler.event === 'controller-state') {
            currentState = await RWS.Controller.getControllerState();
          }
          cb(currentState);
        }
      });

      if (Component_A.globalEvents.count(handler.event) <= 1) {
        try {
          await handler.monitorFn(handler.callback);
        } catch (e) {
          Popup_A.error(e, 'TComponents.Component_A');
        }
      }
    }
  }

  /**
   * Disables the component based on a condition.
   * @param {Object} self - The component instance.
   * @param {Object} condition - The condition to evaluate.
   */
  static disableComponentOn(self, condition) {
    this.handleComponentOn(self, condition, 'disable');
  }

  /**
   * Hides the component based on a condition.
   * @param {Object} self - The component instance.
   * @param {Object} condition - The condition to evaluate.
   */
  static hideComponentOn(self, condition) {
    this.handleComponentOn(self, condition, 'hide');
  }

  /**
   * Processes conditions and updates the component properties accordingly.
   * @param {Object} self - The component instance.
   * @param {Array} states - The states to process.
   */
  static conditionProcessing(self, states) {
    for (const state of states) {
      switch (state.type) {
        case 'signal':
          if (state.condition.key) {
            API.SIGNALMONITOR.monitorDigitalSignal(
              {
                type: 'digitalsignal',
                name: state.condition.key,
              },
              (vvv) => {
                if (vvv == state.condition.value) {
                  if (state.tips) {
                    Object.assign(state.props, {tips: state.tips});
                  }
                  self.updateProps(state.props);
                  switch (state.action) {
                    case 'show_enable':
                      self.show();
                      self.enabled = true;
                      break;
                    case 'show_disable':
                      self.show();
                      self.enabled = false;
                      break;
                    case 'hide':
                      self.hide();
                      break;
                  }
                }
              },
            );
          }
          break;
        case 'variable':
          var vs = state.condition.key.split('/');
          API.VARIABLEMONITOR.monitorVariable(
            {
              type: state.condition.type,
              task: vs[1],
              module: vs[2],
              name: vs[3],
            },
            (vvv) => {
              if (vvv == state.condition.value) {
                if (state.tips) {
                  Object.assign(state.props, {tips: state.tips});
                }
                self.updateProps(state.props);
                switch (state.action) {
                  case 'show_enable':
                    self.show();
                    self.enabled = true;
                    break;
                  case 'show_disable':
                    self.show();
                    self.enabled = false;
                    break;
                  case 'hide':
                    self.hide();
                    break;
                }
              }
            },
          );
          break;
      }
    }
  }

  /**
   * Generates dynamic text based on the input type.
   * @param {string|number} text - The text to process.
   * @param {Object} self - The component instance.
   * @returns {string|number} The processed text.
   */
  static dynamicText(text, self) {
    if (!text || typeof text == 'number') {
      return text;
    }

    //{{App.container1.a}}-----------webdata
    if (text.startsWith('{{') && text.endsWith('}}')) {
      const key = text.slice(2, -2);
      self &&
        API.WEBDATAMONITOR.monitorWebdata(key, (vvv) => {
          self.updateProps({
            text: API.formatValue(vvv),
          });
        });
      return '';
    }

    //$$digitalsignal.ManualMode$$------------signal
    else if (text.startsWith('$$') && text.endsWith('$$')) {
      const vs = text.slice(2, -2).split('.');
      self &&
        API.SIGNALMONITOR.monitorDigitalSignal(
          {
            type: vs[0],
            name: vs[1],
          },
          (vvv) => {
            self.updateProps({
              text: API.formatValue(vvv),
            });
          },
        );
      return '';
    }

    //@@tooldata|task1.module1|tooldata1@@----------rapid
    else if (text.startsWith('@@') && text.endsWith('@@')) {
      const vs = text.slice(2, -2).split('|');

      var task_module = vs[1].split('.');

      self &&
        API.VARIABLEMONITOR.monitorVariable(
          {
            type: vs[0],
            task: task_module[0],
            module: task_module[1],
            name: vs[2],
          },
          (vvv) => {
            self.updateProps({
              text: API.formatValue(vvv),
            });
          },
        );
      return '';
    } else if (text.startsWith('!!') && text.endsWith('!!')) {
      return Component_A.t(text.slice(2, -2));
    } else {
      return text || '';
    }
  }

  /**
   * Extracts binding data from a string.
   * @param {string} strData - The string to extract data from.
   * @returns {Object|null} The binding data or null if not applicable.
   */
  static getBindData(strData) {
    let bindData = null;

    if (typeof strData !== 'string') {
      return bindData;
    }

    // {{App.container1.a}} 标识webdata
    if (strData.indexOf('{{') === 0 && strData.lastIndexOf('}}') === strData.length - 2) {
      bindData = {
        type: 'webdata',
        key: strData.replace(/{{/g, '').replace(/}}/g, ''),
      };
    }

    // $$digitalsignal.ManualMode$$ 标识signal
    if (strData.indexOf('$$') === 0 && strData.lastIndexOf('$$') === strData.length - 2) {
      const vs = strData.replace(/\$\$/g, '').split('.');
      bindData = {
        type: vs[0],
        key: vs[1],
      };
    }

    // @@tooldata|task1.module1|tooldata1@@
    if (strData.indexOf('@@') === 0 && strData.lastIndexOf('@@') === strData.length - 2) {
      const vs = strData.replace(/@@/g, '').split('|');
      const variablePath = vs[1].split('.').concat([vs[2]]);
      bindData = {
        type: 'rapiddata',
        dataType: vs[0],
        task: variablePath[0],
        module: variablePath[1],
        name: variablePath[2],
      };
    }

    return bindData;
  }

  /**
   * Synchronizes data with a specified value.
   * @param {*} value - The value to synchronize.
   * @param {Object} self - The component instance.
   * @returns {Promise<boolean>} A promise that resolves to true if synchronization is successful, otherwise false.
   */
  static async syncData(value, self) {
    try {
      if (self._bindData.type === 'webdata') {
        await API.WEBDATAMONITOR.setWebdata(self._bindData.key, value);
      }

      if (self._bindData.type === 'digitalsignal') {
        let numVar = value;

        if (typeof value == 'boolean') numVar = value == true ? 1 : 0;
        if (typeof value == 'string') numVar = Number(value);

        if (isNaN(numVar)) {
          const error = new Error('Invalid input value.');
          Popup_A.error(error, 'Sync input data');
        }

        await API.RWS.SIGNAL.setSignalValue(self._bindData.key, numVar);
      }

      if (self._bindData.type === 'groupsignal') {
        let numVar = value;

        if (typeof value == 'string') numVar = Number(value);

        if (isNaN(numVar)) {
          const error = new Error('Invalid input value.');
          Popup_A.error(error, 'Sync input data');
        }

        await API.RWS.SIGNAL.setSignalValue(self._bindData.key, numVar);
      }

      if (self._bindData.type === 'rapiddata') {
        //  Do not sync PERS if controller in running execution status
        // let executionStatus = await RWS.Rapid.getExecutionState();
        // const isRunning = executionStatus === RWS.Rapid.ExecutionStates.running;
        await API.RAPID.setVariableValue(self._bindData.module, self._bindData.name, value, self._bindData.task, {
          syncPers: false,
        });
      }
      return true;
    } catch (e) {
      Popup_A.error(e, `Sync error`);
      return false;
    }
  }

  /**
   * Generates a function template from a string.
   * @param {string | Function | any} data - The string containing the function body.
   * @param {Object} self - The component instance.
   * @returns {Function|null} The generated function or null if the input is not a valid function.
   */
  static genFuncTemplate(data, self) {
    try {
      let tempFn = null;

      if (typeof data === 'string') {
        if (!data) return null;

        eval(`tempFn = async function(...args){
          try {
            ${data}
          } catch (e) {
            TComponents.Popup_A.error(e, "Event trigger error")
          }
        }`);
      } else if (typeof data === 'function') {
        tempFn = data;
      }

      return typeof tempFn === 'function' ? tempFn.bind(self) : null;
    } catch (e) {
      TComponents.Popup_A.error(e, 'Generate function template');
      return null;
    }
  }

  /**
   * Sets the language adapter for the component.
   * @param {Object} adapter - The language adapter.
   * @param {function} adapter.t - The translation function.
   * @throws {Error} If adapter.t is not a function.
   */
  static setLanguageAdapter(adapter) {
    if (typeof adapter.t !== 'function') throw new Error('func must be a function');
    Component_A.languageAdapter = adapter;
  }

  /**
   * Translates a key using the language adapter.
   * @param {string} key - The key to translate.
   * @returns {string} The translated key.
   */
  static t(key) {
    if (Component_A.languageAdapter && Component_A.languageAdapter.t) return Component_A.languageAdapter.t(key);
    return key;
  }

  /**
   * Enables or disables any FPComponent component (see Omnicore App SDK) declared within the component as an own property (e.g. this.btn = new FPComponent()).
   * @alias enabled
   * @type {boolean}
   * @memberof TComponents.Component_A
   * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * Enables or disables the component and all its child components.
   * @alias enabled
   * @memberof TComponents.Component_A
   * @param {boolean} en - The enabled state to set.
   */
  set enabled(en) {
    this._enabled = en;
    //Support user enable all the children by api
    const objects = Component_A._hasChildOwnProperty(this, '_enabled');
    objects.forEach((o) => {
      o.enabled = en;
      console.log('child-property', o);
    });
    if (this.child) {
      if (this.child instanceof Array) {
        console.log('this.child is an object', this.child);
        this.child.forEach((c) => {
          c.enabled = en;
          console.log('child-array', c);
        });
      } else if (this.child instanceof Object) {
        for (const key in this.child) {
          if (this.child[key] && Object.prototype.hasOwnProperty.call(this.child[key], '_enabled')) {
            this.child[key].enabled = en;
            console.log('child-object', this.child[key]);
          }
        }
      }
    }
  }
}

/**
 * language adapter for the Component_A class.
 * @type {object}
 */
Component_A.languageAdapter = null;

/**
 * Global event handler for the Component_A class.
 * @type {Eventing_A}
 */
Component_A.globalEvents = new Eventing_A();

/**
 * Enum-like object that defines various input variable types.
 * These types are used to categorize the types of input data that can be handled by the component.
 * @type {Object}
 * @property {string} NUM - Represents a numeric input type.
 * @property {string} ANY - Represents a generic input type, not limited to a specific data type.
 * @property {string} BOOL - Represents a boolean input type (true/false).
 * @property {string} STRING - Represents a string input type.
 */
Component_A.INPUTVAR_TYPE = {
  NUM: 'num',
  ANY: 'any',
  BOOL: 'bool',
  STRING: 'string',
};

/**
 * Enum-like object that defines various input variable handling strategies.
 * These strategies specify how input variables are processed within the component.
 * @type {Object}
 * @property {string} CUSTOM - A custom processing strategy for input variables.
 * @property {string} SYNC - A synchronous processing strategy for input variables.
 */
Component_A.INPUTVAR_FUNC = {
  CUSTOM: 'custom',
  SYNC: 'sync',
};

/**
 * Monitors and triggers the operation mode event.
 * @async
 * @param {string} value - The operation mode to set.
 */
const monitorOpMode = async (value) => {
  Component_A.globalEvents.trigger('op-mode', value);
};

/**
 * Monitors and triggers the execution state event.
 * @async
 * @param {string} value - The execution state to set.
 */
const monitorExecutionState = async (value) => {
  Component_A.globalEvents.trigger('execution-state', value);
};

/**
 * Monitors and triggers the controller state event.
 * @async
 * @param {string} value - The controller state to set.
 */
const monitorControllerState = async (value) => {
  Component_A.globalEvents.trigger('controller-state', value);
};

/**
 * Maximum allowable gap in rem units.
 * @constant {number}
 */
const maxGap = 16;

/**
 * Maximum allowable padding in rem units.
 * @constant {number}
 */
const maxPadding = 16;

/**
 * Maximum allowable margin in rem units.
 * @constant {number}
 */
const maxMargin = 16;

/**
 * Generates CSS styles for padding classes.
 * @returns {string} - The generated CSS styles for padding.
 */
const generatePaddingStyles = () => {
  let styles = '';
  for (let i = 1; i <= maxPadding; i++) {
    const paddingValue = (i * 0.25).toFixed(2); // Calculate padding value based on class number.
    styles += `
      .pl-${i} { padding-left: ${paddingValue}rem; /* ${i * 4}px */ }
      .pr-${i} { padding-right: ${paddingValue}rem; /* ${i * 4}px */ }
      .pt-${i} { padding-top: ${paddingValue}rem; /* ${i * 4}px */ }
      .pb-${i} { padding-bottom: ${paddingValue}rem; /* ${i * 4}px */ }
      .px-${i} { padding-left: ${paddingValue}rem; padding-right: ${paddingValue}rem; /* ${i * 4}px */ }
      .py-${i} { padding-top: ${paddingValue}rem; padding-bottom: ${paddingValue}rem; /* ${i * 4}px */ }
    `;
  }
  return styles;
};

/**
 * Generates CSS styles for margin classes.
 * @returns {string} - The generated CSS styles for margin.
 */
function generateMarginStyles() {
  let styles = '';

  for (let i = 1; i <= maxMargin; i++) {
    const value = i * 0.25;
    styles += `
      .ml-${i} { margin-left: ${value}rem; /* ${i * 4}px */ }
      .mr-${i} { margin-right: ${value}rem; /* ${i * 4}px */ }
      .mt-${i} { margin-top: ${value}rem; /* ${i * 4}px */ }
      .mb-${i} { margin-bottom: ${value}rem; /* ${i * 4}px */ }
      .mx-${i} { margin-left: ${value}rem; margin-right: ${value}rem; /* ${i * 4}px */ }
      .my-${i} { margin-top: ${value}rem; margin-bottom: ${value}rem; /* ${i * 4}px */ }
    `;
  }

  return styles;
}

/**
 * Generates CSS styles for gap classes.
 * @returns {string} - The generated CSS styles for gap.
 */
function generateGapStyles() {
  let styles = '';

  for (let i = 0; i <= maxGap; i++) {
    const value = i * 0.25;
    styles += `
      .flex-row.gap-${i} > * + * { margin-left: ${value}rem; /* ${i * 4}px */ }
      .flex-col.gap-${i} > * + * { margin-top: ${value}rem; /* ${i * 4}px */ }
    `;
  }

  return styles;
}

/**
 * Loads CSS classes from a string and applies them to the Component_A.
 * @param {string} cssString - The CSS string to be loaded.
 */
Component_A.loadCssClassFromString(/*css*/ `
  ${generatePaddingStyles()}
  ${generateMarginStyles()}
  ${generateGapStyles()}
`);
