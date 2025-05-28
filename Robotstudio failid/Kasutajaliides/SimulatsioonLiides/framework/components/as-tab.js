import API from '../api/ecosystem-base.js';
import {Menu_A} from './as-menu.js';
import {Component_A} from './basic/as-component.js';
import {FP_Tabcontainer_A} from './fp-ext/fp-tabcontainer-ext.js';
import {Popup_A} from './as-popup.js';

/**
 * Represents a tab component with multiple customizable properties and events.
 *
 * @class TComponents.Tab
 * @memberof TComponents
 * @extends TComponents.Menu_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component.
 * @param {Object} [props] - The properties object.
 */
export class Tab extends Menu_A {
  constructor(parent, props) {
    super(parent, props);
  }

  /**
   * Initializes the tab component, setting up event handlers and tab container.
   *
   * @memberof TComponents.Tab
   */
  async onInit() {
    this.tabContainer = new FP_Tabcontainer_A();
    this.tabContainer.onTabClick = this._handleTabClick.bind(this);
    this.tabContainer.onchange = this.cbOnChange.bind(this);
  }

  /**
   * Returns the default properties of the tab component.
   *
   * @memberof TComponents.Tab
   * @returns {Object} Default properties.
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',

      onPlus: null,
      userTabClosing: false,
      onUserClose: null,
      plusEnabled: false,
      hiddenTabs: false,

      // ⭐ W/H/X/Y/B/R/Z: Component required attributes.
      position: 'static',
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      rotation: 0,
      borderRadius: 16,
      zIndex: 0,
      // color
      color: 'rgba(0,0,0,1)',
      backgroundColor: 'rgba(245,245,245,1)',
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
      tabPosition: 'top',
      styleTemplate: '',
      // views state.
      activeViewIndex: 0,
      onChange: '',
      useViewIcon: true,
      views: [
        {
          name: Component_A.dynamicText('Tab 0'),
          content: `View_${API.generateUUID()}`,
          id: null,
          icon: 'abb-icon abb-icon-home-house_32',
        },
      ],
    };
  }

  /**
   * Renders the tab component, applying styles and attaching event listeners.
   *
   * @memberof TComponents.Tab
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      this.tabContainer.position = this._props.tabPosition;

      if (this._props.title) this.tabContainer.setTabTitle = this._props.title;
      this.tabContainer.userTabClosing = this._props.userTabClosing;

      this.tabContainer.activeTab = this.views[this._props.activeViewIndex].id;
      this._onRenderView();

      this.tabContainer.plusEnabled = this._props.plusEnabled;
      this.tabContainer.hiddenTabs = this._props.hiddenTabs;

      const tabWrapperElem = this.find('.tc-tab');
      if (tabWrapperElem) this.tabContainer.attachToElement(tabWrapperElem);

      const tabWrapEl = this.find('.fp-components-tabcontainer');
      if (Component_A._isHTMLElement(tabWrapEl)) {
        tabWrapEl.style.borderRadius = `${this._props.borderRadius}px`;
      }

      const tabBarEl = this.find('.fp-components-tabcontainer-tabbar');
      if (Component_A._isHTMLElement(tabBarEl))
        tabBarEl.style.cssText = `
        font-family: ${this._props.font.fontFamily};
        font-size: ${this._props.font.fontSize}px;
        font-style: ${this._props.font.style.fontStyle};
        font-weight: ${this._props.font.style.fontWeight};
        text-decoration: ${this._props.font.style.textDecoration};
        color: ${this._props.color};`;

      const tabContentEl = this.find('.fp-components-tabcontainer-content');
      if (Component_A._isHTMLElement(tabContentEl)) {
        tabContentEl.style.backgroundColor = this._props.backgroundColor;
        switch (this._props.tabPosition) {
          case 'top':
            tabContentEl.style.borderRadius = `0px 0px ${this._props.borderRadius}px ${this._props.borderRadius}px`;
            break;
          case 'left':
            tabContentEl.style.borderRadius = `0px ${this._props.borderRadius}px ${this._props.borderRadius}px 0px`;
            break;
          case 'right':
            tabContentEl.style.borderRadius = `${this._props.borderRadius}px 0px 0px ${this._props.borderRadius}px`;
            break;
          default:
            break;
        }
      }
    } catch (e) {
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      throw e;
    }
  }

  /**
   * Sets the active view by the given view ID and updates the active tab in the tab container.
   *
   * @private
   * @memberof TComponents.Tab
   * @param {string} id - The ID of the view to be activated.
   * @throws {Error} If the clicked tab property is invalid.
   */
  _setViewById(id) {
    const index = this._props.views.findIndex((v) => v.content.id === id);
    const isInValid = this.tabContainer.activeTab && this.tabContainer.activeTab.id === id && index < 0;

    if (isInValid) {
      throw new Error('The clicked tab property is invalid.');
    }

    this.tabContainer.activeTab = id;
    this._props.activeViewIndex = index;
  }

  /**
   * Handles the tab click event.
   *
   * @private
   * @memberof TComponents.Tab
   * @param {Event} e - The event object.
   */
  _handleTabClick(e) {
    try {
      // Check if the clicked element is a tab && Remove the event and use a callback instead.
      const id = e.target && e.target.dataset && e.target.dataset.viewId;
      this._setViewById(id);
    } catch (e) {
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      throw e;
    }
  }

  /**
   * Renders the view for the tabs.
   *
   * @private
   * @memberof TComponents.Tab
   */
  _onRenderView() {
    this.viewId.clear();
    this.views.forEach(({icon, name, content, id}) => {
      const dom = this._getDom(content, id, name);
      id = this.tabContainer.addTab(name, icon, dom);
      this.viewId.set(id, name);
    });
  }

  /**
   * Gets the properties of the tab component.
   *
   * @memberof TComponents.Tab
   * @returns {Object} The properties object
   */
  getProps() {
    const tempView = this._props.views;
    const ret = super.getProps();
    ret.views = ret.views.map((view, index) => {
      view.content = tempView[index].content;
      return view;
    });

    return ret;
  }

  /**
   * Adds a new tab to the component.
   *
   * @memberof TComponents.Tab
   * @param {Object} tab - The tab object
   * @param {string} tab.name - The name of the tab
   * @param {string} tab.content - The content of the tab
   */
  addTab({name, content}) {
    this.addView({name, content});
  }

  /**
   * Returns the HTML markup for the tab component.
   *
   * @memberof TComponents.Tab
   * @returns {string} The HTML markup
   */
  markup() {
    return /*html*/ `<div class="tc-tab"></div>`;
  }

  /**
   * Gets the active tab.
   *
   * @memberof TComponents.Tab
   * @throws {Error} If the tab container is not initialized
   * @returns {string} The name of the active tab
   */
  get activeTab() {
    if (!this.tabContainer) throw new Error('TabContainer not initialized yet. Please render the component first');
    return this.viewId.get(this.tabContainer.activeTab);
  }

  /**
   * Sets the active tab by name.
   *
   * @memberof TComponents.Tab
   * @throws {Error} If the tab container is not initialized
   * @param {string} name - The name of the tab to set as active
   */
  set activeTab(name) {
    try {
      if (!this.tabContainer) throw new Error('TabContainer not initialized yet. Please render the component first');

      this.all('.fp-components-tabcontainer-activetab').forEach((el) => {
        el.classList.remove('fp-components-tabcontainer-activetab');
      });

      const id = [...this.viewId.entries()].filter(([_, value]) => value === name)[0][0];
      this._setViewById(id);
    } catch (e) {
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      throw e;
    }
  }

  /**
   * Gets the active tab view index.
   *
   * @memberof TComponents.Tab
   * @throws {Error} If the tab container is not initialized
   * @returns {string} The name of the active tab
   */
  get activeViewIndex() {
    return this._props.activeViewIndex;
  }

  /**
   * Sets the active tab view index and updates the active tab in the tab container.
   *
   * @memberof TComponents.Tab
   * @param {number} t - The new active view index.
   * @throws {Error} If the new index is invalid or if the active view content is invalid.
   */
  set activeViewIndex(t) {
    try {
      const index = this.checkActiveViewIndex(t);
      if (index === null) return;
      else {
        const viewContent = this._props.views[index].content;
        const id = viewContent.id || null;
        this._setViewById(id);
      }
    } catch (e) {
      Popup_A.error(e, `TComponents.${this.constructor.name}`);
      throw e;
    }
  }
}

/**
 * Add css properties to the component
 *
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Tab.loadCssClassFromString(`
.tc-tab {
  position: absolute;
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-tab .tabcontainer-top,
.tc-tab .tabcontainer-left,
.tc-tab .tabcontainer-right {
  display: flex;
}

.tc-tab .tabcontainer-top {
  flex-direction: column;
}

.tc-tab .tabcontainer-left {
  flex-direction: row;
}

.tc-tab .tabcontainer-right {
  flex-direction: row-reverse;
}

.tc-tab .fp-components-tabcontainer-disabled,
.tc-tab .fp-components-tabcontainer {
  position: absolute;
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-tab .fp-components-tabcontainer .fp-components-tabcontainer-tabbar > * {
  background-color: transparent;
  min-width: 0px;
  min-height: 0px;
  max-width: unset;
  max-height: unset;
}

.tc-tab .fp-components-tabcontainer .fp-components-tabcontainer-tabbar {
  position: relative;
  background-color: transparent;
  padding: 0px;
  gap: 8px;
  font-size: inherit;
  -ms-overflow-style: auto !important;
  scrollbar-width: thin !important;
}

.tc-tab .fp-components-tabcontainer .tabbar-top {
  height: 55px;
  width: 100%;
  display: flex;
  flex-direction: row;
  min-height: 0px;
}

.tc-tab .fp-components-tabcontainer .tabbar-left,
.tc-tab .fp-components-tabcontainer .tabbar-right {
  height: 100%;
  width: 60px;
  display: flex;
  flex-direction: column;
}

.tc-tab .fp-components-tabcontainer-activetab {
  font-weight: inherit;
  width: auto;
  height: auto;
  min-height: 0px;
  max-height: 0px;
  display: flex;
  flex-direction: initial;
  flex: none;
  transition: none;
}

.tc-tab .fp-components-tabcontainer-tabbar::-webkit-scrollbar {
  display: block;
  width: 8px;
}

.tc-tab .fp-components-tabcontainer .fp-components-tabcontainer-tabbar-content {
  background-color: transparent;
}

.tc-tab .fp-components-tabcontainer .tabbar-content-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 45px;
  width: 140px;
  min-width: 0px;
  max-width: 140px;
}

.tc-tab .fp-components-tabcontainer .tabbar-content-left,
.tc-tab .fp-components-tabcontainer .tabbar-content-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 60px;
}

.tc-tab .fp-components-tabcontainer .fp-components-tabcontainer-content {
  position: relative;
}

.tc-tab .fp-components-tabcontainer .fp-components-tabcontainer-tabbar-icon {
  height: 20px;
  width: 20px;
  margin: 6px;
  pointer-events: none;
}

.tc-tab .fp-components-tabcontainer .fp-components-tabcontainer-tabbar-text {
  display: block;
  pointer-events: none;
}

.tc-tab .tabbar-text-top {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 80px;
}

.tc-tab .tabbar-text-left,
.tc-tab .tabbar-text-right {
  height: 35px;
  width: auto;
  max-width: 50px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
`);
