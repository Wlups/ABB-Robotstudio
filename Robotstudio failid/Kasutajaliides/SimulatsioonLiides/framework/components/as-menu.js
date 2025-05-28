import API from '../api/ecosystem-base.js';
import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';

/**
 * @typedef TComponents.View
 * @prop   {string}  name   Name of the view
 * @prop   {TComponents.Component_A | HTMLElement | string}  content Content of the view. It can be a TComponent, HTMLElement or an id of an HTMLElement
 * @prop   {string}  [image] Path to image of the view
 * @prop   {boolean}  [active=false] Set this attribute to true to make the view active
 */

/**
 * @typedef TComponents.MenuProps
 * @prop {string} [title] - Set this attribute to any string to display a title next to the
 * hamburger menu icon when the menu is open. Set this attribute to false (default) to hide
 * the menu when closed, and only display the hamburger menu icon.
 * @prop {Function} [onChange] Set this attribute to a callback function that should
 * be called when a new view becomes active, i.e. the container has switched view to another content element.
 * The oldViewId and newViewId parameters are both view identifier objects which respectively identify the
 * previously active view and the currently active view.
 * It is possible for one of the parameters to be null, e.g. when the first view becomes active.
 * @prop {TComponents.View[]} [views] Array of view objects
 * @prop {string} [label] Label text
 */

/**
 * Abstract class used by {@link TComponents.Hamburger_A} and {@link TComponents.Tab_A}
 * @class TComponents.Menu_A
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.MenuProps} [props]
 */
export class Menu_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    this.viewId = new Map();
    this.requireMarkup = [];

    /**
     * @type {TComponents.MenuProps}
     */
    this._props;
    this._viewsChild = {};

    this.initPropsDep('views');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Menu_A
   * @returns {TComponents.MenuProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // basic properties: X/Y/W/H/B/R/Z
      position: 'static',
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: 0,
      // border
      border: '1px groove #ccc',
      // color
      color: '(0,0,0,1)',
      backgroundColor: '(245,245,245,1)',
      // view label text font.
      font: {
        fontSize: 12,
        fontFamily: 'Segoe UI',
        style: {
          fontStyle: 'normal',
          fontWeight: 'normal',
          textDecoration: 'none',
        },
      },
      // tab style.
      size: '',
      styleTemplate: '',
      // menu.
      useTitle: true,
      title: '',
      activeViewIndex: 0,
      onChange: '',
      useViewIcon: true,
      views: [
        {
          name: Component_A.dynamicText('Item 0'),
          content: `View_${API.generateUUID()}`,
          id: null,
          icon: 'abb-icon abb-icon-abb_robot-tool_32',
        },
      ],
    };
  }

  /**
   * Initialize the component.
   * @memberof TComponents.Menu_A
   */
  onInit() {
    this.views = [];
    if (this._props.views.length > 0) {
      this._props.views.forEach((view) => {
        view['id'] = this._processContent(view.content);
        this.views.push(view);
      });
    }
  }

  /**
   * Maps components to their identifiers.
   * @memberof TComponents.Menu_A
   * @returns {Object}
   */
  mapComponents() {
    const obj = {};

    this.views.forEach(({content}) => {
      if (Component_A.isTComponent(content)) {
        obj[content.compId] = content;
      }
    });
    return obj;
  }

  /**
   * Render the component.
   * @memberof TComponents.Menu_A
   */
  onRender() {
    if (this._props.onChange) {
      this.cleanEvent('change');
      this.on('change', this._props.onChange);
    }
    this.viewId.clear();
    this.views.forEach(({name, content, image, active, id}) => {
      const dom = this._getDom(content, id, name);

      id = {};
      this.viewId.set(id, name);
    });

    this.container.classList.add('tc-container');
  }

  /**
   * Generate the markup for the component.
   * @memberof TComponents.Menu_A
   * @returns {string} HTML markup
   */
  markup() {
    return /*html*/ `
    ${this.views.filter(({id}) => id !== null).reduce((html, {id}) => html + `<div id="${id}"></div>`, '')}
    `;
  }

  /**
   * Add a new view to the menu.
   * @alias addView
   * @memberof TComponents.Menu_A
   * @param  {TComponents.View}  view   View object
   */
  addView(newView) {
    const views = [...this._props.views, newView];
    this.setProps({views});
  }

  /**
   * Get the DOM element for the given content.
   * @memberof TComponents.Menu_A
   * @private
   * @param {TComponents.Component_A | HTMLElement | string} content - The content of the view.
   * @param {string} id - The identifier of the view.
   * @param {string} name - The name of the view.
   * @returns {HTMLElement} The DOM element.
   */
  _getDom(content, id, name) {
    let dom;
    if (Component_A.isTComponent(content)) {
      if (id) content.attachToElement(this.find(`#${id}`));
      dom = content.parent;
    } else {
      dom = content;
    }
    return dom;
  }

  /**
   * Process the content of the view.
   * @memberof TComponents.Menu_A
   * @private
   * @param {TComponents.Component_A | HTMLElement | string} content - The content of the view.
   * @returns {string} The identifier of the view.
   * @throws Will throw an error if the content type is unexpected.
   */
  _processContent(content) {
    let id = null;

    if (Component_A.isTComponent(content)) {
      id = content.compId + '__container';
    } else if (Component_A._isHTMLElement(content)) {
      // Deploy env: This TComponent div must have an id.
      id = content.id;
    } else if (typeof content === 'string') {
      // Dev env: content is string.
      id = content;
      content = document.getElementById(`${id}`);

      if (!content) {
        throw new Error(`Could not find element with id: ${id} in the DOM.
        Try adding view as Element or Component_A instance to the Hamburger menu.`);
      }
    } else if (!Component_A._isHTMLElement(content)) {
      throw new Error(`Unexpected type of view content: type -- ${typeof content} --> ${content}}`);
    }
    return id;
  }

  /**
   * Callback for when the view changes.
   * @memberof TComponents.Menu_A
   * @param {Object} oldView - The old view identifier.
   * @param {Object} newView - The new view identifier.
   */
  cbOnChange(oldView, newView) {
    const fn = Component_A.genFuncTemplate(this._props.onChange, this);
    fn && fn(oldView, newView);
  }

  /**
   * Determines the type of menu component currently set to active.
   * Checks if the provided view index is valid and sets it as active if it is.
   *
   * @memberof TComponents.Menu_A
   * @param {number} t - The new active view index.
   * @returns {null | number} Returns null if the provided index is the same as the current active index or invalid, otherwise returns the new active view index.
   */
  checkActiveViewIndex(t) {
    if (this._props.activeViewIndex === t) {
      return null;
    }

    const viewLen = this._props.views.length;
    if (t >= viewLen || t < 0) {
      const e = new Error('The active view index is invalid, not within the range of the views!');
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      return null;
    }

    return t;
  }

  /**
   * Get the views.
   * @memberof TComponents.Menu_A
   * @returns {TComponents.View[]} The views.
   */
  get views() {
    const views = [];
    if (this._props.views.length > 0) {
      for (let i = 0; i < this._props.views.length; i++) {
        const view = this._props.views[i];
        const tmpView = Object.assign({}, view);

        if (typeof tmpView.content == 'string') {
          tmpView.content = document.createElement('div');
          tmpView.content.id = view.content;
          tmpView.content.classList.add('t-component__container');
          // Manually set the view id.
          tmpView.id = view.content;
        } else {
          tmpView.id = this._processContent(tmpView.content);
        }

        tmpView.name = Component_A.dynamicText(view.name);
        tmpView.active = i === this._props.activeViewIndex;
        tmpView.child = this._viewsChild[tmpView.id] || {};

        views.push(tmpView);
      }
    }

    return views;
  }

  // /**
  //  * Set the views.
  //  * @memberof TComponents.Menu_A
  //  * @param {TComponents.View[]} arr - The views to set.
  //  */
  // set views(arr) {
  //   this.setProps({
  //     views: arr,
  //   });
  //   // {
  //   //   name: 'Tab 0',
  //   //   content: `View_${API.generateUUID()}`,
  //   //   id: null,
  //   //   icon: 'abb-icon abb-icon-home-house_32',
  //   // }
  // }

  /**
   * Get the useTitle property.
   * @memberof TComponents.Menu_A
   * @returns {boolean} The useTitle property.
   */
  get useTitle() {
    return this._props.useTitle;
  }

  /**
   * Set the useTitle property.
   * @memberof TComponents.Menu_A
   * @param {boolean} b - The useTitle property.
   */
  set useTitle(b) {
    this.setProps({useTitle: b});
  }

  /**
   * Get the title property.
   * @memberof TComponents.Menu_A
   * @returns {string} The title property.
   */
  get title() {
    return this._props.title;
  }

  /**
   * Set the title property.
   * @memberof TComponents.Menu_A
   * @param {string} s - The title property.
   */
  set title(s) {
    this.setProps({title: s});
  }

  /**
   * Removes a child component by its key.
   * This function will check if the child exists, and if so, it will remove
   * and destroy the child component from the view.
   * @memberof TComponents.Menu_A
   * @param {string|object} key - The key of the child to remove.
   * Can be either a string representing the child's name, or an object containing the component ID.
   * @param {string|object} t - The child instance or name to remove.
   */
  _removeChildByKey(key, t) {
    const childs = this._viewsChild[key];

    if (typeof t === 'string') {
      if (childs && childs[t]) {
        childs[t].parent = null;
        childs[t].destroy();

        delete childs[t];
      }
    } else if (typeof t === 'object' && t.compId) {
      const keys = Object.keys(childs);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const childInstance = childs[key];

        if (childInstance && childInstance.compId === t.compId) {
          childs[key].parent = null;
          childs[key].destroy();
          delete childs[key];
          break;
        }
      }
    }
  }

  /**
   * Appends a child component to a specific view by its index.
   * The child component will be appended to the content of the view at the specified index.
   * If a child with the same name already exists, it will be removed first.
   * @memberof TComponents.Menu_A
   * @param {number} index - The index of the view to append the child to.
   * @param {object} instance - The child component to append.
   * @param {string} name - The name of the child component.
   * @throws {Error} - Throws an error if the index is out of range or invalid.
   */
  appendChild(index, instance, name) {
    if (typeof index != 'number' || index >= this.views.length || index < 0) return;

    const view = this.views[index];
    if (!view.id || !view.content || !view.content.id) return;
    const id = view.content.id;

    const keys = Object.keys(this._viewsChild);
    const length = this.views.length;

    for (var i = 0; i < length; i++) {
      const key = keys[i];
      if (key !== id && this._viewsChild[key]) {
        this._removeChildByKey(key, instance);
      }
    }

    instance.parent = view.content;
    if (!this._viewsChild[id]) {
      this._viewsChild[id] = {};
    }

    this._viewsChild[id][name] = instance;

    instance.render();
  }

  /**
   * Removes a child component from a specific view by its index.
   * The child component is identified by the provided name or component ID.
   * @memberof TComponents.Menu_A
   * @param {number} index - The index of the view to remove the child from.
   * @param {string|object} t - The name or component instance of the child to remove.
   * @throws {Error} - Throws an error if the index is out of range or invalid.
   */
  removeChild(index, t) {
    if (typeof index != 'number' || index >= this.views.length || index < 0) return;

    const view = this.views[index];
    if (!view.id || !view.content || !view.content.id) return;
    const id = view.content.id;

    if (!this._viewsChild[id]) {
      this._viewsChild[id] = {};
    }

    this._removeChildByKey(id, t);
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Menu_A.loadCssClassFromString(``);
