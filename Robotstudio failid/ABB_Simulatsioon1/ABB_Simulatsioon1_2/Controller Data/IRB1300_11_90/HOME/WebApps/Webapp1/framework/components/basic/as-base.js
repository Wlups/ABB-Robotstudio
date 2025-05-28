import {Eventing_A} from './as-event.js';
import state from '../services/processing-queue.js';

/**
 * TComponents Namespace
 * @namespace TComponents
 * @public
 */

/**
 * Base class for handling objects
 * @class TComponents.Base_A
 * @memberof TComponents
 * @extends TComponents.Eventing_A
 * @public
 * @ignore
 */
export class Base_A extends Eventing_A {
  /**
   * Creates an instance of TComponents.Base_A.
   * @param {object} [props={}] - Initial properties for the object
   * @throws Will throw an error if props is not an object
   * @private
   */
  constructor(props = {}) {
    super();

    if (typeof props !== 'object') throw new Error('props must be an object');

    this.initialized = false;
    this.noCheck = [];

    this._initPropsDependencies = [];

    this._props = this._getAllProps(props);
    this._prevProps = Object.assign({}, this._props);
  }

  /**
   * Returns an object with expected input properties together with their initial value.
   * Every child class shall have a {@link defaultProps} to register its corresponding input properties.
   * @alias defaultProps
   * @memberof TComponents.Base_A
   * @protected
   * @example
   * class MyComponent extends TComponents.Component_A {
   *  constructor(parent, props){}
   *  defaultProps(){
   *    return {
   *      myProp1: '',
   *      myProp2: 0,
   *      myProp3: false,
   *      myProp4: { a: 'A', b: 'B'}
   *    }
   *  }
   * }
   * @returns {object}
   */
  defaultProps() {
    return {options: {async: false}};
  }

  /**
   * Register the properties that trigger an onInit when changed with setProps().
   * Input value is a string or array of strings with the name of the corresponding props
   * @alias initPropsDep
   * @initPropsDep
   * @memberof TComponents.Base_A
   * @protected
   * @param {string|string[]} props - The properties that trigger an onInit when changed
   * @throws Will throw an error if the new value is not a string or an array of strings
   * @example
   *     this.initPropsDep(['module', 'variable']);
   */
  initPropsDep(props) {
    if (typeof props === 'string') {
      props = [props];
    } else if (!Array.isArray(props)) {
      throw new Error('The new value should be a string or an array of strings.');
    }

    this._initPropsDependencies = [...this._initPropsDependencies, ...props];
  }

  /**
   * Method used to update one or multiple component input properties. A change of property using this method
   * will trigger at least a {@link render()} call. If at least one of the given properties is listed in
   * the {@link initPropsDep} array, then a {@link init()} is called before the {@link render()}.
   * @alias setProps
   * @param {object} newProps - Object including the property or properties to be updated.
   * @param {Function | null} [onRender=null] - Function to be executed once after the component has been rendered.
   * @param {boolean} [sync=false] - Whether to update synchronously or not
   * @memberof TComponents.Base_A
   * @public
   * @returns {Promise<boolean>} - true if the component has been updated, false otherwise
   */
  async setProps(newProps, onRender = null, sync = false) {
    const {props, modified} = Base_A._updateProps(newProps, this._props, false, this.noCheck);

    /**
     * Internal element containing the component properties. A copy of it can be obtained
     * outside the component with {@link getProps} method. To modify the props from outside, the method
     * {@link setProps} can be used.
     * @private
     */
    this._props = props;

    // if onRender is a function, register event listener to be executed after render
    if (onRender && typeof onRender === 'function') this.once('render', onRender);

    if (modified && this.initialized) {
      if (sync) {
        await this._componentDidUpdate();
      } else {
        // Put the update in the queue so that every rendering is done synchronously
        // one after the other
        state.q.push(this._componentDidUpdate.bind(this));
      }

      return true;
    }

    return false;
  }

  /**
   * Returns a copy of the component properties. Notice that the returning value does not have a
   * reference to the internal properties of the component. i.e. changing a value in that object
   * does not affect the component itself. To change the properties of the component use the {@link setProps} method.
   * @alias getProps
   * @memberof TComponents.Base_A
   * @public
   * @returns {object}
   */
  getProps() {
    return Base_A._deepClone(this._props);
  }

  /**
   * Abstract function for asynchronous initialization of the component. This function is overwritten in {@link TComponents.Component_A}
   * @alias init
   * @memberof TComponents.Base_A
   * @async
   * @abstract
   * @protected
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async init() {}

  /**
   * Abstract function for DOM rendering. This function is overwritten in {@link TComponents.Component_A}
   * @alias render
   * @memberof TComponents.Base_A
   * @abstract
   * @protected
   * @async
   */
  async render() {}

  /**
   * @alias props
   * @memberof TComponents.Base_A
   * @public
   * @type {object}
   */
  get props() {
    return this.getProps();
  }

  set props(props) {
    this.setProps(props);
  }

  /**
   * Get all properties, including default properties from the prototype chain.
   * @param {object} p - Initial properties
   * @param {boolean} [restError=true] - Whether to throw error for unexpected props
   * @private
   * @returns {object}
   */
  _getAllProps(p, restError = true) {
    const {props} = Base_A._updateProps(p, this._getAllDefaultProps(), restError, this.noCheck);
    return props;
  }

  /**
   * Get all default properties from the prototype chain.
   * @private
   * @returns {object}
   * @private
   */
  _getAllDefaultProps() {
    let props = {};
    let proto = this;

    const noCheck = [];

    // Traverse up the prototype chain and merge all defaultProps
    while (proto) {
      if (proto.defaultProps) {
        props = Object.assign({}, proto.defaultProps(), props);
        if (proto.noCheck) {
          proto.noCheck.forEach((element) => {
            if (!noCheck.includes(element)) {
              noCheck.push(element);
            }
          });
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    this.noCheck = noCheck;

    return props;
  }

  /**
   * Update properties with new values and determine if any properties were modified.
   * @alias _updateProps
   * @memberof TComponents.Base_A
   * @static
   * @private
   * @param {object} [newProps={}] - New properties to update
   * @param {object} [prevProps={}] - Previous properties
   * @param {boolean} [restError=false] - Whether to throw error for unexpected props
   * @param {string[]} [noCheck=[]] - Properties to exclude from modification check
   * @returns {object} An object containing the updated properties and a boolean indicating if any properties were modified
   */
  static _updateProps(newProps = {}, prevProps = {}, restError = false, noCheck = []) {
    let modified = false;

    let props = Object.keys(prevProps).reduce((acc, key) => {
      if (Object.prototype.hasOwnProperty.call(newProps, key)) {
        if (
          !Array.isArray(prevProps[key]) &&
          !noCheck.includes(key) &&
          typeof prevProps[key] === 'object' &&
          prevProps[key] !== null &&
          !(prevProps[key] instanceof HTMLElement)
        ) {
          const nestedProps = Base_A._updateProps(newProps[key], prevProps[key], restError, noCheck);
          modified = modified || nestedProps.modified;
          acc[key] = nestedProps.props;
        } else {
          acc[key] = newProps[key];
          modified = modified || newProps[key] !== prevProps[key];
        }
      } else {
        // key not existing in new prop, so the value is the same as before
        acc[key] = prevProps[key];
      }
      return acc;
    }, {});

    const rest = Object.keys(newProps).reduce((acc, key) => {
      if (!Object.prototype.hasOwnProperty.call(prevProps, key)) {
        acc[key] = newProps[key];
      }
      return acc;
    }, {});

    if (restError && Object.keys(rest).length !== 0) {
      Logger.w('TComponents.Base_A', `Unexpected props: ${JSON.stringify(rest)}`);
      // throw new Error(`Unexpected props: ${JSON.stringify(rest)}`);
    }

    return {props, modified};
  }

  /**
   * Handle component updates and determine if dependencies have changed.
   * @alias _componentDidUpdate
   * @memberof TComponents.Base_A
   * @private
   */
  async _componentDidUpdate() {
    function checkDepsDiff(deps, props, prevProps) {
      for (let i = 0; i < deps.length; i++) {
        const dep = deps[i];
        if (props[dep] !== prevProps[dep]) {
          return true;
        }
      }
      return false;
    }

    const isDepsDiff =
      this._initPropsDependencies && checkDepsDiff(this._initPropsDependencies, this._props, this._prevProps);

    // Update previous props
    this._prevProps = Object.assign({}, this._props);

    // Trigger update of the component
    if (isDepsDiff) {
      await this.init();
    } else {
      await this.render();
    }
  }

  /**
   * Creates a clone of an object, including objects with circular references,
   * functions, and non-enumerable properties.
   * @alias _deepClone
   * @memberof TComponents.Base_A
   * @static
   * @param {object} obj - The object to clone
   * @returns {object} The cloned object
   * @private
   */
  static _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    let clone;

    if (obj instanceof Date) {
      clone = new Date(obj.getTime());
    } else if (obj instanceof RegExp) {
      clone = new RegExp(obj.source, obj.flags);
    } else if (obj instanceof Set) {
      clone = new Set(obj);
    } else if (obj instanceof Map) {
      clone = new Map(obj);
    } else if (obj instanceof Error) {
      clone = new Error(obj.message);
    } else if (obj instanceof Array) {
      clone = [];
      for (let i = 0; i < obj.length; i++) {
        clone[i] = Base_A._deepClone(obj[i]);
      }
    } else if (obj instanceof HTMLElement) {
      clone = obj.cloneNode(true);
      if (obj.id && clone.id) {
        clone.id = API.generateUUID(); // Replace generateUniqueID() with your own logic to generate a unique ID
      }
    } else {
      // clone = Object.create(Object.getPrototypeOf(obj));
      clone = {};
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = Base_A._deepClone(obj[key]);
        }
        // clone[key] = Base_A._deepClone(obj[key]);
      }
    }

    return clone;
  }
}
