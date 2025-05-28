export class FP_Tabcontainer_A extends FPComponents.Tabcontainer_A {
  constructor() {
    super();
    this._position = 'top';
    this._onTabClick = null;
  }

  set position(data) {
    this._position = data;
  }

  get position() {
    return this._position;
  }

  _updateScrollButtons() {
    // No implementation needed in this subclass
  }

  _rebuild() {
    let container = document.createElement('div');
    container.classList.add(`fp-components-tabcontainer`, `tabcontainer-${this._position}`);

    let tabBar = document.createElement('div');
    tabBar.classList.add(`fp-components-tabcontainer-tabbar`, `tabbar-${this._position}`);

    let content = document.createElement('div');
    content.classList.add(`fp-components-tabcontainer-content`);
    container.appendChild(tabBar);
    container.appendChild(content);

    this._root = container;
    this._tabBar = tabBar;
    this._contentPane = content;

    this._anchor.appendChild(container);

    this._updateTabs();
    this._updateOuterTabBarVisibility();
  }

  addTab(title, icon, contentElement, makeActive = false) {
    if (typeof contentElement === 'string') {
      contentElement = document.getElementById(contentElement);
    }

    let id = null;
    if (contentElement && contentElement.id) {
      id = contentElement.id;
    }

    this._tabQueue.push({id, title, icon, contentElement, makeActive});
    this._updateTabs();

    return id;
  }

  _addTabImpl(t) {
    // remove tab content from DOM tree.
    let parent = t.contentElement.parentElement;
    if (parent !== null) {
      parent.removeChild(t.contentElement);
    }

    // Create tab elements
    const tab = document.createElement('div');

    const modTabContElem = document.createElement('div');
    modTabContElem.classList.add(`fp-components-tabcontainer-tabbar-content`, `tabbar-content-${this._position}`);

    if (this._onTabClick) {
      modTabContElem.addEventListener('click', (e) => {
        e.stopPropagation();
        this._onTabClick(e);
      });
    }

    if (t.icon && t.icon != '') {
      const icon = document.createElement('i');
      icon.className = `fp-components-tabcontainer-tabbar-icon ${t.icon}`;
      modTabContElem.appendChild(icon);
    }

    const text = document.createElement('div');
    text.classList.add('fp-components-tabcontainer-tabbar-text', `tabbar-text-${this._position}`);
    text.textContent = t.title;

    // Append tab elements to tab bar
    modTabContElem.appendChild(text);
    modTabContElem.setAttribute('data-view-id', t.id);

    tab.appendChild(modTabContElem);

    t.root = tab;
    t.rootTitleDiv = text;

    this._tabs.push(t);
    this._tabBar.appendChild(tab);

    // Set active if specified
    if (t.makeActive || this._activeTabId === undefined) {
      this._activeTabId = t.id;
    }
  }

  get onTabClick() {
    return this._onTabClick;
  }

  set onTabClick(handler) {
    this._onTabClick = handler;
  }

  _updateTabs() {
    if (this._dirty || this._root === null) return;

    this._dirty = true;

    // Process the tab queue
    while (this._tabQueue.length) {
      const t = this._tabQueue.shift();
      t.delete ? this._removeTabImpl(t) : this._addTabImpl(t);
    }

    // Update scroll buttons
    this._updateScrollButtons(false);

    // Clear the content pane
    this._contentPane.innerHTML = '';

    // Update tabs and set active content
    for (const t of this._tabs) {
      if (t.id === this._activeTabId) {
        this._contentPane.appendChild(t.contentElement);
        this._contentPane.scrollTop = t.scrollTop;
        t.root.className = FPComponents.Tabcontainer_A._TAB_ACTIVE_NO_CLOSE;
        t.root.setAttribute('style', `border-${this._position == 'top' ? 'bottom' : this._position}: 2px solid blue;`);
      } else {
        t.root.removeAttribute('style');
        t.root.className = FPComponents.Tabcontainer_A._TAB_ACTIVE;
      }
    }

    this._dirty = false;
  }
}
