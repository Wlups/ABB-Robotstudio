import {Component_A} from './basic/as-component.js';
import {Popup_A} from './as-popup.js';
import {Slider} from './as-slider.js';

/**
 * @typedef {Object} TComponents.FP_Slider_A
 */

/**
 * Slider element. Additional callbacks can be added with the {@link TComponents.Slider#onChange|onChange} method.
 * @class TComponents.Slider
 * @memberof TComponents
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SliderProps} [props]
 * @property {TComponents.SliderProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="slider-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const slider = new Slider(document.querySelector('.slider-container'),{
 *   });
 */
export class VarSlider extends Slider {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.VarSliderProps}
     */
    this._props;
    /*
     * If bound to web data, `this._bindData` will have the format: { type: 'webdata', key: 'xxx' }.
     * If bound to group signal data, `this._bindData` will have the format: { type: 'groupsignal', key: 'xxxx' }.
     * If bound to rapid data, `this._bindData` will have the format: { type: 'rapiddata', dataType: 'xxx', module: 'xxx', name: 'xxx', task: 'xxx' }.
     */
    this._bindData;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Slider
   * @returns {TComponents.SliderProps}
   */
  defaultProps() {
    const parentProps = super.defaultProps();
    return Object.assign({}, parentProps, {
      // Bind variable properties
      inputVar: {
        type: 'group', // 'any' | 'string' | 'num' | 'bool' | 'group'
        func: 'custom', // 'custom' | 'sync'
        value: 30,
        isHidden: false,
      },
      text: '',
    });
  }

  /**
   * Renders the slider component.
   * @memberof TComponents.Slider
   */
  onRender() {
    try {
      this.removeAllEventListeners();

      if (this._props.inputVar.func == 'sync') {
        this._bindData = Component_A.getBindData(this._props.inputVar.value);
      }

      this.text = Component_A.dynamicText(this._props.text, this);

      super.onRender();
    } catch (e) {
      Popup_A.error(e, 'TComponents.VarSlider');
    }
  }

  /**
   * Pointer up/leave event handler.
   * @alias onPointerRelease
   * @memberof TComponents.Slider
   * @async
   */
  async _onPointerRelease(value) {
    if (this.enabled) {
      let tempVal = value;
      const flag = await this.syncInputData(tempVal);
      if (!flag) {
        // Restore to the previous state.
        let realValue = await API.RAPID.getVariableValue(
          this._bindData.module,
          this._bindData.name,
          this._bindData.task,
        );
        this._slider.value = realValue;
        return;
      }
      if (this.props.inputVar.func == Component_A.INPUTVAR_FUNC.CUSTOM) {
        this._slider.value = value;
        this._props.value = value;
      }
      if (this._props.onPointerRelease) {
        const fn = Component_A.genFuncTemplate(this._props.onPointerRelease, this);
        if (typeof fn == 'function') fn(value);
      }
    }
  }

  /**
   * Generates the markup for the slider component.
   * @memberof TComponents.Slider
   * @returns {string} HTML markup string
   */
  markup() {
    return /*html*/ `
      <div class="tc-var-slider">
        <div class="tc-slider"></div>
      </div>
      `;
  }

  /**
   * @type {string|boolean|number}
   * @memberof TComponents.VarSlider
   */
  get text() {
    return this._props.text;
  }

  /**
   * @type {any}
   * @memberof TComponents.VarSlider
   */
  set text(t) {
    try {
      if (typeof t === 'number') {
        this.setProps({
          value: t,
        });
      } else if (typeof t === 'string') {
        if (t === '') return;
        let tmp = Number(t);
        if (typeof tmp === 'number' && !isNaN(tmp)) {
          this.setProps({
            value: tmp,
          });
        }
      } else {
        throw 'Invalid text data';
      }
    } catch (error) {
      const err = new Error('Invalid text data.');
      Popup_A.error(err, 'TComponents.VarSlider');
    }
  }
}
/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 */
VarSlider.loadCssClassFromString(/*css*/ `
  .tc-var-slider {
    height: inherit;
    width: inherit;
    min-width: 0px;
    min-height: 0px;
    padding: 0px;
    margin: 0px;
  }
  `);
