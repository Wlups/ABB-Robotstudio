import API from '../api/ecosystem-base.js';
import {Component_A} from './basic/as-component.js';
import {Container_A} from './basic/as-container.js';
import {Popup_A} from './as-popup.js';

/**
 * @typedef {Object} TComponents.LayoutInfoboxProps
 * @property {string} [title] - Title of the infobox
 * @property {boolean} [useBorder] - Use border around the infobox
 * @property {TComponents.ContainerProps} [content] - Props to be passed to the content container
 * @property {Object} [options] - Options to be passed to the container
 */

/**
 * LayoutInfobox is a component that displays a title and content in a box
 * @class TComponents.LayoutInfobox
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.LayoutInfoboxProps} [props]
 */
export class LayoutInfobox extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    this._newChild = {}; // [{name:string, instance: TComponent.Component_A}]
    this.forceUpdate();
  }

  /**
   * Gets the border usage state.
   * @memberof TComponents.LayoutInfobox
   * @type {boolean}
   */
  get useBorder() {
    return this._props.useBorder;
  }

  /**
   * Sets the border usage state.
   * @memberof TComponents.LayoutInfobox
   * @param {boolean} b - The new border usage state.
   */
  set useBorder(b) {
    this.setProps({useBorder: b});
  }

  /**
   * Gets the title usage state.
   * @memberof TComponents.LayoutInfobox
   * @type {boolean}
   */
  get useTitle() {
    return this._props.useTitle;
  }

  /**
   * Sets the title usage state.
   * @memberof TComponents.LayoutInfobox
   * @param {boolean} b - The new title usage state.
   */
  set useTitle(b) {
    this.setProps({useTitle: b});
  }

  /**
   * Gets the title of the infobox.
   * @memberof TComponents.LayoutInfobox
   * @type {string}
   */
  get title() {
    return this._props.title;
  }

  /**
   * Sets the title of the infobox.
   * @memberof TComponents.LayoutInfobox
   * @param {string} s - The new title.
   */
  set title(s) {
    this.setProps({title: s});
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @memberof TComponents.LayoutInfobox
   * @returns {TComponents.LayoutInfoboxProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // ⭐ W/H/X/Y/B/R/Z: Component required attributes.
      position: 'static',
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      zIndex: 0,
      borderRadius: 16,
      rotation: 0,
      // color
      color: '#000000',
      backgroundColor: 'transparent',
      // title font
      useTitle: true,
      title: 'default',
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
      // border.
      useBorder: true,
      border: '1px groove #ccc',
      // container component.
      content: {
        children: [`Container_${API.generateUUID()}`],
        row: false,
        box: false,
        width: 'auto',
        height: 'auto',
        classNames: ['flex-col', 'justify-stretch'],
      },
    };
  }

  /**
   * Creates an empty container.
   * @memberof TComponents.LayoutInfobox
   * @param {Object} props - Properties for the container.
   * @returns {Container_A} The created container.
   */
  createEmptyContainer(props) {
    const tmpC = props.children[0];
    if (Component_A._isHTMLElement(tmpC)) {
      const container_a = new Container_A(this.find('.layout-infobox-content'), props);
      return container_a;
    } else if (typeof tmpC === 'string') {
      const container_b = new Container_A(this.find('.layout-infobox-content'), {id: tmpC});
      container_b.container.id = tmpC;
      return container_b;
    }
  }

  /**
   * Maps the components.
   * @memberof TComponents.LayoutInfobox
   * @returns {Object} The mapped components.
   */
  mapComponents() {
    let props = Object.assign({}, this._props.content);
    props = Object.assign(props, {id: 'content'});

    const content = this.createEmptyContainer(props);

    return Object.assign({}, {content: content}, this._newChild);
  }

  /**
   * Handles rendering of the component.
   * @memberof TComponents.LayoutInfobox
   */
  onRender() {
    this.removeAllEventListeners();

    this.container.classList.add('layout-container');

    const fpCoreContainerElem = this.find('.fp-components-emptycontainer');
    if (Component_A._isHTMLElement(fpCoreContainerElem)) {
      fpCoreContainerElem.style.cssText = this.getWrapperStyle();
    }

    const layoutTitleElem = this.find('.layout-title');
    if (Component_A._isHTMLElement(layoutTitleElem)) {
      layoutTitleElem.style.cssText = this.getTitleLayoutStyle();
    }

    const pTitleElem = this.find('p');
    if (Component_A._isHTMLElement(pTitleElem)) {
      pTitleElem.style.cssText = this.getTitleStyle();
    }

    const infoBoxContentElem = this.find('.layout-infobox-content');
    if (Component_A._isHTMLElement(infoBoxContentElem)) {
      infoBoxContentElem.style.cssText = this.getContentStyle();
    }

    // Render new child components.
    const keys = Object.keys(this._newChild);
    for (var i = 0; i < keys.length; i++) {
      const key = keys[i];
      const childInstance = this._newChild[key];

      if (typeof childInstance.render === 'function') {
        childInstance.render();
      }
    }
  }

  /**
   * Generates the markup for the component.
   * @memberof TComponents.LayoutInfobox
   * @returns {string} The HTML markup for the component.
   */
  markup() {
    // TODO: Move this style modification function to the `onRender` function.
    return /*html*/ `
    <div class="tc-layout-infobox">
      <div class="fp-components-emptycontainer layout-infobox tc-container-box">
        ${
          this._props.useTitle
            ? /*html*/ `
              <div class="flex-row justify-center layout-title">
                <p>
                  ${Component_A.dynamicText(this._props.title, this)}
                </p>
              </div>`
            : ''
        }
          <div class="layout-infobox-content flex-col justify-stretch">
          </div>
        </div>
      </div>
    <div>
    `;
  }

  /**
   * Gets the CSS text for the wrapper style.
   * @memberof TComponents.LayoutInfobox
   * @returns {string} The CSS text for the wrapper style.
   */
  getWrapperStyle() {
    const cssText = `background-color: ${this._props.backgroundColor};
    border-radius: ${this._props.borderRadius}px;
    border: ${this._props.useBorder ? this._props.border : 'none'};
    box-sizing: border-box;`
      .replace(/\s+/g, ' ')
      .trim();
    return cssText;
  }

  /**
   * Gets the CSS text for the title layout style.
   * @memberof TComponents.LayoutInfobox
   * @returns {string} The CSS text for the title layout style.
   */
  getTitleLayoutStyle() {
    const cssText = `background-color: ${this._props.backgroundColor};
    border-radius: ${this._props.borderRadius}px ${this._props.borderRadius}px 0px 0px;`
      .replace(/\s+/g, ' ')
      .trim();
    return cssText;
  }

  /**
   * Gets the CSS text for the title style.
   * @memberof TComponents.LayoutInfobox
   * @returns {string} The CSS text for the title style.
   */
  getTitleStyle() {
    const cssText = `color: ${this._props.color}; 
      font-family: ${this._props.font.fontFamily};
      font-size: ${this._props.font.fontSize}px;
      font-weight: ${this._props.font.style.fontWeight};
      font-style: ${this._props.font.style.fontStyle};
      text-decoration: ${this._props.font.style.textDecoration};
      text-align: ${this._props.font.textAlign}`
      .replace(/\s+/g, ' ')
      .trim();

    return cssText;
  }

  /**
   * Gets the CSS text for the content style.
   * @memberof TComponents.LayoutInfobox
   * @returns {string} The CSS text for the content style.
   */
  getContentStyle() {
    const cssText = `background-color: ${this._props.backgroundColor};
      border-radius: ${this._props.useTitle ? 0 : this._props.borderRadius}px ${this._props.useTitle ? 0 : this._props.borderRadius}px ${this._props.borderRadius}px ${this._props.borderRadius}px;`
      .replace(/\s+/g, ' ')
      .trim();
    return cssText;
  }

  /**
   * Appends a child component to the current component.
   * If the child name is 'content', this method does nothing.
   * Otherwise, it assigns the parent property of the child component
   * to the first child of the 'content' component and updates the `_newChild` object.
   * Then, it triggers a re-render of the component.
   *
   * @memberof TComponents.LayoutInfobox
   * @param {Object} instance The child component instance to be added.
   * @param {string} name The name of the child component to be appended.
   * @returns {void}
   *
   * @throws {Error} If the `instance` parameter is not a valid object.
   *
   * @example
   * layoutInfoboxInstance.appendChild(childInstance, 'childComponent');
   */
  appendChild(instance, name) {
    if (name === 'content') return;
    instance.parent = this.child.content.child.children[0];
    this._newChild[name] = instance;
    this.render();
  }

  /**
   * Removes a child component from the current component.
   * It can remove the child either by name (if `t` is a string) or by component instance (if `t` is an object with a `compId`).
   * After removing the child, the method updates the `child` property by calling `mapComponents()`
   * and triggers a re-render of the component.
   *
   * @memberof TComponents.LayoutInfobox
   * @param {string|Object} t The child component to remove. It can be either:
   * - A string representing the child component's name (if the child is in `_newChild`).
   * - An object with a `compId` property, representing the child component to be removed.
   * @returns {void}
   *
   * @throws {Error} If the `t` parameter is neither a string nor an object with a `compId`.
   *
   * @example
   * layoutInfoboxInstance.removeChild('childComponent'); // Removes by name
   * layoutInfoboxInstance.removeChild(someChildInstance); // Removes by component instance
   */
  removeChild(t) {
    if (typeof t === 'string') {
      if (this._newChild && this._newChild[t]) {
        this._newChild[t].parent = null;
        this._newChild[t].destroy();

        delete this._newChild[t];
        this.child = this.mapComponents();
        this.render();
      }
    } else if (typeof t === 'object' && t.compId) {
      const keys = Object.keys(this._newChild);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const childInstance = this._newChild[key];

        if (childInstance && childInstance.compId === t.compId) {
          this._newChild[key].parent = null;
          this._newChild[key].destroy();
          delete this._newChild[key];
          break;
        }
      }

      this.child = this.mapComponents();
      this.render();
    }
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
LayoutInfobox.loadCssClassFromString(/*css*/ `
.tc-layout-infobox {
  position: absolute;
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.fp-components-emptycontainer-disabled,
.fp-components-emptycontainer {
  position: absolute;
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.layout-container {
  display: flex;
  flex-direction: column;
}

.layout-container > .layout-infobox {
  flex: 1;
}

.layout-container .tc-container-box {
  margin: 0px;
  padding: 0px;
}

.layout-infobox-content {
  position: relative;
  max-height: 100%;
  overflow: auto;
}

.layout-infobox {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.layout-infobox > .layout-title {
  position: relative;
  /* background-color: #dddddd; */
  max-height: 30px;
  min-height: 30px;

  border-bottom-style: solid;
  border-bottom-color: #d5d5d5;
  border-bottom-width: 3px;
  /* border-radius: 10px; */
  display: flex;
  align-items: center;
  /* padding-left: 8px; */
  /* margin-top: 0.2rem; */
  /* margin-bottom: 0.4rem; */
}

.layout-infobox > .layout-title > p {
  font-size: 12px;
  width: 100%;
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.layout-infobox > :not(.layout-title)  {
  /* background-color: white; */
  flex-grow: 1;
  /* padding: 8px; */

  min-height: 30px;
  min-width: 80px;
}

`);
