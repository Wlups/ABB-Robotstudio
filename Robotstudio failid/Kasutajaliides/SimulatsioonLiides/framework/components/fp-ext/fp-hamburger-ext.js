export class FP_Hamburger_A extends FPComponents.Hamburgermenu_A {
  constructor() {
    super();

    this._updateViews = this._updateViewsImmediate;
  }

  _updateViewsImmediate() {
    if (this._root === null) {
      return;
    }

    if (this._dirty == false) {
      this._dirty = true;

      this._dirty = false;
      if (this._root !== null) {
        let child;
        while ((child = this._contentPane.lastChild)) {
          this._contentPane.removeChild(child);
        }

        // Update view status and switch content and set exising scroll value
        let currView;
        for (currView of this._views) {
          if (currView.menuButton) {
            currView.menuButton.classList.remove(FPComponents.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
          }
          if (currView.id === this.activeView) {
            if (currView.contentElement.parentElement !== null) {
              currView.contentElement.parentElement.removeChild(currView.contentElement);
            }

            this._contentPane.appendChild(currView.contentElement);
            this._contentPane.scrollTop = currView.scrollTop;
            (function (view, scope) {
              scope._contentPane.scrollTop = view.scrollTop;
            })(currView, this);

            if (currView.menuButton) {
              currView.menuButton.classList.add(FPComponents.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
            }

            // calculate height of menu. Has to be calculcated with JS because 100% for bg position doesn't work correctly in old Edge browser.
            // Remove backgroun style.
            // var scrollHeight = this._menuDiv.scrollHeight;
            // if (scrollHeight > 0) {
            //   this._menuDiv.style.backgroundPosition = '0% 0%, 0% ' + (scrollHeight - 80) + 'px, 0% 0%, 0% 100%';
            // }
          } else {
            if (
              currView.contentElement &&
              currView.contentElement.parentElement !== null &&
              currView.contentElement.parentElement !== this._contentPane
            ) {
              currView.contentElement.parentElement.removeChild(currView.contentElement);
            }
          }
        }
      }
    }
  }

  _addViewButton(view) {
    let divNode = document.createElement('div');
    divNode.className = 'fp-components-hamburgermenu-a-menu__button';

    let imgNode = document.createElement('div');
    imgNode.className = 'fp-components-hamburgermenu-a-menu__button-icon';
    divNode.appendChild(imgNode);

    if (view.icon !== undefined) {
      const iconNode = document.createElement('div');
      iconNode.className = `${view.icon}`;
      imgNode.style.backgroundImage = 'unset';
      imgNode.appendChild(iconNode);
    }

    let pNode = document.createElement('p');

    if (view.label !== undefined) {
      pNode.appendChild(document.createTextNode(view.label));
      pNode.className = 'fp-components-hamburgermenu-a-menu__button-text';
    }

    divNode.appendChild(pNode);
    this._menuDiv.appendChild(divNode);

    divNode.onclick = () => {
      for (var i = 0; i < this._menuDiv.children.length; i++) {
        var child = this._menuDiv.children[i];
        child.classList.remove(FPComponents.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
      }

      divNode.classList.add(FPComponents.Hamburgermenu_A._MENU_BUTTON_ACTIVE);

      if (this._isOpen) {
        this._toggleOpen();
      }

      this.activeView = view.id;
    };

    view.menuButton = divNode;
  }

  _build() {
    if (this._anchor != null) {
      let container = document.createElement('div');
      container.className = 'fp-components-base fp-components-hamburgermenu-a-container';
      let overlay = document.createElement('div');
      overlay.className = 'fp-components-hamburgermenu-a-overlay';
      overlay.onclick = () => this._toggleOpen();
      let menuWrapperNode = document.createElement('div');
      menuWrapperNode.className = 'fp-components-hamburgermenu-a-menu__wrapper';
      let menuContainer = document.createElement('div');
      menuContainer.className = 'fp-components-hamburgermenu-a-menu__container';
      let buttonContainerWrap = document.createElement('div');
      buttonContainerWrap.className = 'fp-components-hamburgermenu-a-button-wrap';
      let buttonContainerNode = document.createElement('div');
      buttonContainerNode.className = 'fp-components-hamburgermenu-a-button-container';
      buttonContainerNode.onclick = () => this._toggleOpen();
      buttonContainerWrap.appendChild(buttonContainerNode);
      let button = document.createElement('div');
      button.className = 'fp-components-hamburgermenu-a-button';
      let menu = document.createElement('div');
      menu.className = 'fp-components-hamburgermenu-a-menu';
      var titleDiv = document.createElement('div');
      titleDiv.className = 'fp-components-hamburgermenu-a-menu__title-container';
      let titleTextDiv = document.createElement('div');
      titleTextDiv.className = 'fp-components-hamburgermenu-a-menu__title-text';
      titleTextDiv.textContent = this._title;
      let content = document.createElement('div');
      content.className = 'fp-components-hamburgermenu-a-container__content';
      container.appendChild(overlay);
      container.appendChild(menuWrapperNode);
      menuWrapperNode.appendChild(menuContainer);
      menuContainer.appendChild(titleDiv);
      titleDiv.appendChild(titleTextDiv);
      menuContainer.appendChild(menu);
      menuWrapperNode.appendChild(buttonContainerWrap);
      buttonContainerNode.appendChild(button);
      container.appendChild(content);
      this._root = container;
      this._contentPane = content;
      this._menuWrapper = menuWrapperNode;
      this._menuContainer = menuContainer;
      this._menuDiv = menu;
      this._buttonDiv = buttonContainerNode;
      this._overlayDiv = overlay;
      this._titleDiv = titleDiv;
      this._updateMenu();
      for (const v of this._views) {
        this._addViewButton(v);
      }
      this._updateViews();
      this._anchor.appendChild(container);
    }
  }
}
