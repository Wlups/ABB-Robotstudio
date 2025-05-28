import {Component_A} from './as-component.js';

/**
 * @typedef TComponents.ContainerProps
 * @prop {TComponents.Component_A | HTMLElement | TComponents.Component_A[] | HTMLElement[]} [children]
 * @prop {boolean} [box] If true, the container will have a box around it
 * @prop {string} [width] Width of the container. Defaults to 'auto'
 * @prop {string} [height] Height of the container. Defaults to 'auto'
 * @prop {string} [classNames] Additional class names to be added to the container.
 * It can be a string, e.g.  'flex-row items-start justify-start',
 * or an array of strings, e.g.  ['flex-col', 'items-start', 'justify-start']
 * @prop {string} [id] name of container (optional). For instance, if container is part of a layout, the name of the prop
 * corresponding to the container shall be given further to the container. The name will be then exposed in the DOM element
 * as data-name attribute.
 */

/**
 * Container that can hold other components or HTML elements. It can be used to create row or column containers.
 * @class TComponents.Container_A
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ContainerProps} [props]
 * @ignore
 */
export class Container_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
    this._children = new Map();

    this.initPropsDep('children');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Container_A
   * @returns {TComponents.ContainerProps}
   */
  defaultProps() {
    return {
      children: [],
      row: false,
      box: false,
      width: 'auto',
      height: 'auto',
      classNames: ['flex-col', 'justify-stretch'],
      id: '',
    };
  }

  /**
   * Initialize the component. This method is called after the component is created and added to the DOM.
   * @alias onInit
   * @memberof TComponents.Container_A
   * @returns {Promise<void>}
   * @throws {Error} Throws an error if a child element cannot be found in the DOM.
   */
  async onInit() {
    this._children.clear();

    const childrenArray = Array.isArray(this._props.children)
      ? this._props.children
      : [this._props.children ? this._props.children : []];

    childrenArray.forEach((child, idx) => {
      if (typeof child === 'string') {
        // chekc if child has # and remove it
        const elementId = child.replace(/^#/, '');
        child = elementId.startsWith('.') ? document.querySelector(elementId) : document.getElementById(elementId);
        if (!child) {
          throw new Error(`Container_A: Could not find element with selector/id: ${elementId} in the DOM.
            Check the selector or if inside a TComponent, then try adding the child as Element or Component_A instance,
            since this may not be yet available in the DOM.`);
        }

        if (!child.id) {
          child.id = this._childId(idx);
        }
        this._children.set(child, child.id);
      } else if (Component_A.isTComponent(child)) {
        this._children.set(child, child.compId);
      } else if (Component_A._isHTMLElement(child)) {
        if (!child.id) {
          child.id = this._childId(idx);
        }
        this._children.set(child, child.id);
      } else throw new Error(`Unexpected type of child detected: ${typeof child}`);
    });

    this._props.children = [...this._children.values()];
  }

  /**
   * Maps the components in the container.
   * @alias mapComponents
   * @memberof TComponents.Container_A
   * @returns {Object} An object containing the mapped components.
   */
  mapComponents() {
    return {children: [...this._children.keys()]};
  }

  /**
   * Renders the container and its children.
   * @alias onRender
   * @memberof TComponents.Container_A
   */
  onRender() {
    this.container.id = this._props.id ? this._props.id : this.compId;

    this._children.forEach((id, child) => {
      if (Component_A.isTComponent(child)) {
        child.attachToElement(this.container);
      } else {
        if (child.parentNode) {
          child.parentNode.removeChild(child);
        }
        this.container.append(child);
      }
    });

    if (this._props.box) this.cssBox();
    this.cssAddClass('this', [
      't-component__container',
      // `${this._props.row ? 'flex-row' : 'flex-col'}`,
    ]);
    if (this._props.classNames) this.cssAddClass('this', this._props.classNames ? this._props.classNames : 'flex-col');

    this.container.style.width = this._props.width;
    this.container.style.height = this._props.height;
  }

  /**
   * Generates an ID for a child element based on its index.
   * @alias _childId
   * @memberof TComponents.Container_A
   * @param {number} idx Index of the child element.
   * @returns {string} Generated ID for the child element.
   */
  _childId(idx) {
    return `${this.compId}__child-${idx}`;
  }

  /**
   * Generates a selector for a child element based on its index.
   * @alias _childSelector
   * @memberof TComponents.Container_A
   * @param {number} idx Index of the child element.
   * @returns {string} Generated selector for the child element.
   */
  _childSelector(idx) {
    return `child-${idx}`;
  }

  /**
   * Add/remove a class to a specific child element. The index of the child element is the same as the index of the child element in the children array.
   * @alias cssItem
   * @memberof TComponents.Container_A
   * @param {number} index Index of the child element to be styled.
   * @param {string} className Name of the class to be added (removed).
   * @param {boolean} remove If true, the class will be removed.
   */
  cssItem(index, className, remove = false) {
    if (remove) this.cssRemoveClass(`.${this._childId(index)}`, className);
    else this.cssAddClass(`.${this._childId(index)}`, className);
  }

  /**
   * Add/remove a class to all child elements.
   * @alias cssItems
   * @memberof TComponents.Container_A
   * @param {string} className Name of the class to be added (removed).
   * @param {boolean} remove If true, the class will be removed.
   */
  cssItems(className, remove = false) {
    if (remove) this.cssRemoveClass('.child__container', className);
    else this.cssAddClass('.child__container', className, true);
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Container_A.loadCssClassFromString(/*css*/ `
.t-component__container {
  max-width: inherit;
  max-height: inherit;
}

`);
