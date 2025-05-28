import {Component_A} from './basic/as-component.js';
import {FP_Text_A} from './fp-ext/fp-text-ext.js';
import {Popup_A} from './as-popup.js';

/**
 * Text component that displays various types of text (e.g., headers, body, description) with customizable styles.
 * @class TComponents.Text
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.TextProps} [props]
 * @property {TextProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="text-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const textHello = new Text(document.querySelector('.text-container'), {
 *     text: 'Hello',
 *     textType: 'Header1',
 *     color: '#000',
 *   });
 */
export class Text extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.TextProps}
     */
    this._props;

    this._text = new FP_Text_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Text
   * @returns {TComponents.TextProps}
   */
  defaultProps() {
    return {
      // life cycle
      onCreated: '',
      onMounted: '',
      // content & type
      textType: 'body',
      text: 'This is a Text',
      // background
      backgroundColor: 'rgba(255,255,255,1)',
      // ⭐ W/H/X/Y/B/R/Z: Component required attributes.
      position: 'static',
      width: 100,
      height: 32,
      top: 0,
      left: 0,
      borderRadius: 16,
      rotation: 0,
      zIndex: 0,
      // color
      color: '#000000',
      // font
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
    };
  }

  /**
   * Initializes the component asynchronously.
   * @async
   * @memberof TComponents.Text
   */
  async onInit() {}

  /**
   * Renders the text component and applies the styles and properties.
   * @memberof TComponents.Text
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      if (this._props.labelPos === 'left' || this._props.labelPos === 'right') {
        this.container.classList.add('justify-stretch');
      }

      this._text.text = Component_A.dynamicText(this._props.text, this);
      this._text.textType = this._props.textType;
      this._text.borderRadius = this._props.borderRadius;
      this._text.color = this._props.color;
      this._text.backgroundColor = this._props.backgroundColor;
      this._text.font = this._props.font;

      const textContainer = this.find('.tc-text');
      if (Component_A._isHTMLElement(textContainer)) this._text.attachToElement(textContainer);
    } catch (e) {
      Popup_A.error(e, 'TComponents.Text');
    }
  }

  /**
   * Returns the markup for the text component.
   * @memberof TComponents.Text
   * @returns {string} HTML markup for the text component.
   */
  markup() {
    return /*html*/ `<div class="tc-text"></div>`;
  }

  /**
   * Gets the text content.
   * @memberof TComponents.Text
   * @returns {string} The text content.
   */
  get text() {
    return this._props.text;
  }

  /**
   * Sets the text content.
   * @memberof TComponents.Text
   * @param {string} value - The text content.
   */
  set text(value) {
    this.setProps({text: value});
  }

  /**
   * Gets the text type.
   * @memberof TComponents.Text
   * @returns {string} The text type.
   */
  get textType() {
    return this._props.textType;
  }

  /**
   * Sets the text type and adjusts corresponding styles.
   * @memberof TComponents.Text
   * @param {string} t - The text type.
   */
  set textType(t) {
    let textType = this._props.textType;
    let color = this._props.color;
    let font = Object.assign({}, this._props.font);

    if (t == 'Header1') {
      textType = 'h1';
      color = '#000';
      font.fontSize = 32;
      font.fontWeight = 'bold';
    } else if (t == 'Header2') {
      textType = 'h2';
      color = '#000';
      font.fontSize = 24;
      font.fontWeight = 'bold';
    } else if (t == 'Header3') {
      textType = 'h3';
      color = '#000';
      font.fontSize = 19;
      font.fontWeight = 'bold';
    } else if (t == 'Body') {
      textType = 'body';
      color = '#000';
      font.fontSize = 16;
    } else if (t == 'Description') {
      textType = 'description';
      color = '#888';
      font.fontSize = 16;
    } else if (t == 'Error') {
      textType = 'error';
      color = 'red';
    } else if (t == 'Warning') {
      textType = 'warning';
      color = 'orange';
    } else if (t == 'Success') {
      textType = 'success';
      color = 'green';
    } else if (t == 'Information') {
      textType = 'information';
      color = 'blue';
    } else {
      return;
    }

    this.setProps({textType: textType, color: color, font: font});
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
Text.loadCssClassFromString(/*css*/ `
.tc-text {
  height: inherit;
  width: inherit;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
}

.tc-text .fp-components-text,
.tc-text .fp-components-text-disabled {
  height: 100%;
  width: 100%;
  min-width: 0px;
  min-height: 0px;
  padding: 0px;
  margin: 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.tc-text .fp-components-text-disabled{
  cursor:not-allowed !important;
}
.tc-text .fp-components-text:hover,
.tc-text .fp-components-text-disabled:hover{
  opacity:0.7;
}


.fp-components-text-h1 {
  font-size: 2em;
  font-weight: bold;
  color: #000;
}

.fp-components-text-h2 {
  font-size: 1.5em;
  font-weight: bold;
  color: #000;
}

.fp-components-text-h3 {
  font-size: 1.17em;
  font-weight: bold;
  color: #000;
}

.fp-components-text-description {
  font-size: 1em;
  color: #888;
}

.fp-components-text-error {
  color: red;
}

.fp-components-text-warning {
  color: orange;
}

.fp-components-text-success {
  color: green;
}

.fp-components-text-information {
  color: blue;
}
`);
