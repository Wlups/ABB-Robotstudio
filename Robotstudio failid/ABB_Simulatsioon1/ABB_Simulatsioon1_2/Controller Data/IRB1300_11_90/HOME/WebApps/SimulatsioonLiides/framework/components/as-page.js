import {Component_A} from './basic/as-component.js';

/**
 * Page component that extends the base Component_A class. This component handles the layout and rendering of a page.
 * @class TComponents.Page
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - The parent HTML element that will contain the Page component.
 * @param {TComponents.PageProps} [props={}] - The properties to initialize the Page component with.
 * @property {TComponents.PageProps} _props - The properties of the Page component.
 */
export class Page extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
    /**
     * @type {TComponents.PageProps}
     */
    this._props;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Page
   * @returns {TComponents.PageProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',

      // X/Y/W/H/B/R
      position: 'absolute',
      width: 1024,
      height: 680,
      top: 0,
      left: 0,
      zIndex: 0,

      // Special properties
      backgroundColor: 'white',
      background: '',
      id: '',
      name: '',
    };
  }

  /**
   * Initializes the Page component. This method is called during the component's initialization phase.
   * @memberof TComponents.Page
   */
  onInit() {
    //
  }

  /**
   * Renders the Page component. This method is responsible for cleaning up events and updating the DOM.
   * @memberof TComponents.Page
   */
  onRender() {
    this.removeAllEventListeners();

    if (Component_A._isHTMLElement(this.parent)) {
      this.parent.style.height = `${this._props.height}`;
      this.parent.style.width = `${this._props.width}`;
      this.parent.style.top = `${this._props.top}`;
      this.parent.style.left = `${this._props.left}`;
      this.parent.style.zIndex = `${this._props.zIndex}`;
      this.parent.style.backgroundColor = `${this._props.backgroundColor}`;

      if (this._props.id !== '') {
        const realPageElem = this.parent.querySelector(`#${this._props.id}`);
        if (Component_A._isHTMLElement(realPageElem)) {
          realPageElem.style.cssText = this.container.style.cssText;
          realPageElem.className = this.container.className;
        }
      }

      this.parent.removeChild(this.container);
    }
  }

  /**
   * Generates the HTML markup for the Page component.
   * @memberof TComponents.Page
   * @returns {string} The HTML markup for the Page component.
   */
  markup() {
    return /*html*/ ``;
  }

  /**
   * Generates the CSS text for the Page component based on its properties.
   * @memberof TComponents.Page
   * @returns {string} The CSS text for the Page component.
   */
  getCssText() {
    const cssText = `position: ${this._props.position}; 
    left: ${this._props.left}px;
    top: ${this._props.top}px;
    height: ${this._props.height}px;
    width: ${this._props.width}px;
    background-color: ${this._props.backgroundColor};
    z-index: ${this._props.zIndex};`
      .replace(/\s+/g, ' ')
      .trim();

    return cssText;
  }

  /**
   * Gets the properties of the Page component.
   * @memberof TComponents.Page
   * @returns {TComponents.PageProps} The properties of the Page component.
   */
  get properties() {
    return this._props;
  }

  /**
   * Sets the properties of the Page component.
   * @memberof TComponents.Page
   * @param {TComponents.PageProps} t - The new properties of the Page component.
   */
  set properties(t) {
    this._props = t;
  }

  /**
   * Appends a child component to the Page.
   * @param {Object} t - The child component to be appended.
   * @param {Function} t.render - The render method of the child component.
   * @param {Function} t.destroy - The destroy method of the child component.
   */
  appendChild(t) {
    if (typeof t == 'object' && typeof t.render == 'function' && typeof t.destroy == 'function') {
      t.destroy();
      t.parent = this.parent;
      t.render();
    }
  }

  /**
   * Removes a child component from the Page.
   * @param {Object} t - The child component to be removed.
   * @param {Function} t.destroy - The destroy method of the child component.
   */
  removeChild(t) {
    if (typeof t == 'object' && typeof t.destroy == 'function') {
      t.destroy();
    }
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Page.loadCssClassFromString(``);
