import API from '../api/ecosystem-base.js';
import {Menu_A} from './as-menu.js';
import {Component_A} from './basic/as-component.js';
import {FP_Hamburger_A} from './fp-ext/fp-hamburger-ext.js';
import {Popup_A} from './as-popup.js';

/**
 * @typedef {Object} TComponents.HamburgerProps
 * @property {string} [title] - Set this attribute to any string to display a title next to the
 * hamburger menu icon when the menu is open. Set this attribute to false (default) to hide
 * the menu when closed, and only display the hamburger menu icon.
 * @property {boolean} [alwaysVisible] - Set this attribute to true (default) to have the hamburger
 * menu always be visible. In this state the hamburger menu will be wide enough
 * for the icons of each menu item to be visible when closed. When the menu is opened,
 * it will be full width.
 * @property {Function} [onChange] - Set this attribute to a callback function that should
 * be called when a new view becomes active, i.e. the container has switched view to another content element.
 * The oldViewId and newViewId parameters are both view identifier objects which respectively identify the
 * previously active view and the currently active view.
 * It is possible for one of the parameters to be null, e.g. when the first view becomes active.
 * @property {TComponents.View[]} [views] - Array of view objects
 */

/**
 * Represents a Hamburger menu component.
 * @class TComponents.Hamburger
 * @memberof TComponents
 * @extends TComponents.Menu_A
 * @param {HTMLElement} parent - The parent element to attach the hamburger menu to.
 * @param {TComponents.HamburgerProps} props - The properties for the hamburger menu.
 */
export class Hamburger extends Menu_A {
  constructor(parent, props) {
    super(parent, props);
  }

  /**
   * Initializes the hamburger menu.
   * @memberof Hamburger
   */
  onInit() {
    this.hamburgerMenu = new FP_Hamburger_A();
    this._props.views.forEach((view) => {
      if (view.image) view['image'] = '';
    });
  }

  /**
   * Gets the visibility state of the hamburger menu.
   * @memberof Hamburger
   * @returns {boolean} The visibility state of the hamburger menu.
   */
  get alwaysVisible() {
    return this._props.alwaysVisible;
  }

  /**
   * Sets the visibility state of the hamburger menu.
   * @memberof Hamburger
   * @param {boolean} b - The new visibility state.
   */
  set alwaysVisible(b) {
    this.setProps({alwaysVisible: b});
  }

  /**
   * Returns default properties for the hamburger menu.
   * @memberof Hamburger
   * @returns {TComponents.HamburgerProps} The default properties.
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
      border: '1px groove rgba(204,204,204,1)',
      // color
      color: 'rgba(0,0,0,1)',
      backgroundColor: 'rgba(255,255,255,1)',
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
      alwaysVisible: true,
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
   * Renders the hamburger menu.
   * @memberof Hamburger
   */
  onRender() {
    try {
      const tcWrapEl = this.find('.tc-hamburger');
      if (Component_A._isHTMLElement(tcWrapEl)) {
        this.hamburgerMenu.attachToElement(tcWrapEl);
      }

      this.hamburgerMenu.title = Component_A.dynamicText(this._props.title, this);
      this.hamburgerMenu.alwaysVisible = this._props.alwaysVisible;
      this.hamburgerMenu.onchange = this.cbOnChange.bind(this);

      this.views.forEach(({name, content, icon, active, id}) => {
        const dom = this._getDom(content, id, name);
        this.viewId.set(
          this.hamburgerMenu.addView(Component_A.dynamicText(name, this), dom, icon ? icon : undefined, active),
          name,
        );
      });

      const hamMenuContEl = this.find('.fp-components-hamburgermenu-a-menu__container');
      if (Component_A._isHTMLElement(hamMenuContEl)) hamMenuContEl.style.setProperty('z-index', '3');

      const hamMenuBtEl = this.find('.fp-components-hamburgermenu-a-button-container');
      if (Component_A._isHTMLElement(hamMenuBtEl)) hamMenuBtEl.style.setProperty('z-index', '99');

      const fpWrapEl = this.find('.fp-components-hamburgermenu-a-container');
      if (Component_A._isHTMLElement(fpWrapEl)) {
        fpWrapEl.style.alignItems = 'normal';
        fpWrapEl.classList.add('hamburger__container');
        fpWrapEl.style.border = this._props.border;
        fpWrapEl.style.borderRadius = `${this._props.borderRadius}px`;
      }

      const hamBarEl = this.find('.fp-components-hamburgermenu-a-menu__wrapper');
      if (Component_A._isHTMLElement(hamBarEl)) {
        hamBarEl.style.color = this._props.color;
        hamBarEl.style.fontFamily = this._props.font.fontFamily;
        hamBarEl.style.fontSize = `${this._props.font.fontSize}px`;
        hamBarEl.style.fontStyle = this._props.font.style.fontStyle;
        hamBarEl.style.fontWeight = this._props.font.style.fontWeight;
        hamBarEl.style.textDecoration = this._props.font.style.textDecoration;
      }

      // fix: the delayed rendering of menu icon
      const buttons = this.all('.fp-components-hamburgermenu-a-menu__button');
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.color = this._props.color;
      }

      const hamContEl = this.find('.fp-components-hamburgermenu-a-container__content');
      if (Component_A._isHTMLElement(hamContEl)) {
        hamContEl.classList.add('hamburger__container', 'flex-col', 'justify-stretch');
        hamContEl.style.backgroundColor = this._props.backgroundColor;
      }

      this.container.classList.add('tc-container');
      this.container.classList.add('hamburger-base-style');
    } catch (e) {
      Popup_A.error(e, 'TComponents.Hamburger');
    }
  }

  /**
   * Gets the currently active view.
   * @memberof Hamburger
   * @returns {string} The name of the active view.
   * @throws Will throw an error if the hamburger menu is not initialized.
   */
  get activeView() {
    if (!this.hamburgerMenu) throw new Error('Hamburger menu not initialized. Please render the component first.');
    return this.viewId.get(this.hamburgerMenu.activeView);
  }

  /**
   * Sets the currently active view.
   * @memberof Hamburger
   * @param {string} name - The name of the view to set as active.
   * @throws Will throw an error if the hamburger menu is not initialized.
   */
  set activeView(name) {
    try {
      if (!this.hamburgerMenu) throw new Error('Hamburger menu not initialized. Please render the component first.');

      this.all('.fp-components-hamburgermenu-a-menu__button--active').forEach((el) => {
        el.classList.remove('fp-components-hamburgermenu-a-menu__button--active');
      });

      this.hamburgerMenu.activeView = [...this.viewId.entries()].filter(([_, value]) => value === name)[0][0];
      const index = this._props.views.findIndex((v) => v.name === name);
      this._props.activeViewIndex = index;
    } catch (e) {
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      throw e;
    }
  }

  /**
   * Generates the HTML markup for the hamburger menu.
   * @memberof Hamburger
   * @returns {string} The HTML markup.
   */
  markup() {
    return /*html*/ `<div class="tc-hamburger"></div>`;
  }

  /**
   * Gets the active tab view index.
   *
   * @memberof TComponents.Hamburger
   * @throws {Error} If the tab container is not initialized
   * @returns {string} The name of the active tab
   */
  get activeViewIndex() {
    return this._props.activeViewIndex;
  }

  /**
   * Sets the active view index and updates the active view in the hamburger component.
   *
   * @memberof TComponents.Hamburger
   * @param {number} t - The new active view index.
   * @throws {Error} If the new index is invalid or if the active view content is invalid.
   */
  set activeViewIndex(t) {
    try {
      const index = this.checkActiveViewIndex(t);
      if (index === null) return;
      else {
        const name = this._props.views[index].name;
        this.activeView = name;
      }
    } catch (e) {
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      throw e;
    }
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Hamburger.loadCssClassFromString(/*css*/ `
.tc-hamburger {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-hamburger .fp-components-hamburgermenu-a-container-disabled,
.tc-hamburger .fp-components-hamburgermenu-a-container {
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-hamburger .hamburger-base-style {
  background-color: transparent !important;
  border: 1px solid var(--t-color-GRAY-30);
  border-top: none;
  border-buttom: none;
  border-right: none;
}

.tc-hamburger .hamburger__container {
  position: relative;
  max-width: inherit;
  overflow-y: auto;
}

.tc-hamburger .fp-components-hamburgermenu-a-menu__container {
  text-decoration: inherit;
}

.tc-hamburger .fp-components-hamburgermenu-a-menu__title-container {
  min-height: unset;
  padding-left: 48px;
}

.tc-hamburger .fp-components-hamburgermenu-a-menu {
  min-height: unset;
  padding-right: 0px;
}

.tc-hamburger .fp-components-hamburgermenu-a-menu__button {
  min-height: 48px;
}

.tc-hamburger .fp-components-hamburgermenu-a-menu__wrapper {
  z-index: 2;
}

.tc-hamburger .fp-components-hamburgermenu-a-container__content {
  z-index: 1;
}

.tc-hamburger .fp-components-hamburgermenu-a-menu__button-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  width: 32px;
  min-height: unset;
}

.tc-hamburger .fp-components-hamburgermenu-a-button-wrap {
  width: 48px;
  height: 48px;
}
`);
