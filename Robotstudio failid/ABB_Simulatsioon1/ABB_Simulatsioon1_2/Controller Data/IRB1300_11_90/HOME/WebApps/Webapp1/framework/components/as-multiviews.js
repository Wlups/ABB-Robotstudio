import API from '../api/ecosystem-base.js';
import {Tab} from './as-tab.js';
import {Component_A} from './basic/as-component.js';

/**
 * MultiView component that extends the Tab component, allowing for multiple views within a tabbed interface.
 * @class TComponents.MultiView
 * @memberof TComponents
 * @extends TComponents.Tab
 * @param {HTMLElement} parent - The parent HTML element to which the component will be attached.
 * @param {Object} props - Properties to initialize the component with.
 */
export class MultiView extends Tab {
  /**
   * Creates an instance of MultiView.
   * @memberof TComponents.MultiView
   * @param {HTMLElement} parent - The parent HTML element.
   * @param {Object} props - The properties object.
   * @private
   */
  constructor(parent, props) {
    super(parent, props);
  }

  /**
   * Returns the default properties for the MultiView component.
   * @alias defaultProps
   * @memberof TComponents.MultiView
   * @returns {Object} The default properties.
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
      rotation: 0,
      borderRadius: 16,
      zIndex: 0,
      // border
      border: '1px solid #ccc',
      // color
      backgroundColor: '#F5F5F5',
      // views state.
      activeViewIndex: 0,
      onChange: '',
      useViewIcon: false,
      views: [
        {
          name: Component_A.dynamicText('View 0'),
          content: `View_${API.generateUUID()}`,
          id: null,
          icon: null,
        },
      ],
    };
  }

  /**
   * Renders the MultiView component, setting up necessary event listeners and styles.
   * @memberof TComponents.MultiView
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      this.tabContainer.onchange = this.cbOnChange.bind(this);
      this.tabContainer.position = this._props.tabPosition;

      this._onRenderView();

      const tabWrapperElem = this.find('.tc-multiview');
      if (tabWrapperElem) this.tabContainer.attachToElement(tabWrapperElem);

      this.tabContainer.activeTab = this.views[this._props.activeViewIndex].id;

      const fpWrappEl = this.find('.fp-components-tabcontainer');
      if (Component_A._isHTMLElement(fpWrappEl)) {
        fpWrappEl.style.backgroundColor = `${this._props.backgroundColor}`;
        fpWrappEl.style.border = `${this._props.border}`;
        fpWrappEl.style.borderRadius = `${this._props.borderRadius}px`;
        fpWrappEl.style.boxSizing = 'border-box';
      }

      const fpTabBarElem = this.find('.fp-components-tabcontainer-tabbar');
      if (Component_A._isHTMLElement(fpTabBarElem)) fpTabBarElem.style.display = 'none';
    } catch (e) {
      console.error('Error rendering MultiView:', e);
    }
  }

  /**
   * Generates the markup for the MultiView component.
   * @memberof TComponents.MultiView
   * @returns {string} The HTML markup string.
   */
  markup() {
    return /*html*/ `<div class="tc-multiview"></div>`;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
MultiView.loadCssClassFromString(`
.tc-multiview {
  position: absolute;
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-multiview .fp-components-tabcontainer-disabled,
.tc-multiview .fp-components-tabcontainer {
  position: absolute;
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-multiview .fp-components-tabcontainer .fp-components-tabcontainer-content {
  position: relative;
}

`);
